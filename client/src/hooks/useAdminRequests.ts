import { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { apiFetch } from '@/lib/api';
import { useDocumentViewer } from './useDocumentViewer';
import type { PrintingRequest, ListMeta, ConfirmAction, RequestStatus } from './adminRequests.types';

// Re-export types & constants for consumers (e.g. Requests.tsx)
export type { PrintingRequest, ListMeta, ConfirmAction, RequestStatus } from './adminRequests.types';
export { STATUS_TABS } from './adminRequests.types';
export { useDocumentViewer } from './useDocumentViewer';

// ---------------------------------------------------------------------------
// Sub-hook: status / action handling (processing → printing → ready → completed)
// ---------------------------------------------------------------------------

export function useAdminRequestActions(
  adminName: string | undefined,
  setRequests: React.Dispatch<React.SetStateAction<PrintingRequest[]>>,
  selected: PrintingRequest | null,
  setSelected: React.Dispatch<React.SetStateAction<PrintingRequest | null>>,
) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const updateStatus = useCallback(
    async (id: string, status: RequestStatus, extra?: { rejectionReason?: string }) => {
      setActionLoading(id + status);
      try {
        const body: Record<string, unknown> = { status, staffName: adminName || 'SBO Staff' };
        if (extra?.rejectionReason) body.rejectionReason = extra.rejectionReason;
        const res = await apiFetch<{ success: boolean; data: PrintingRequest }>(
          `/printing-requests/${id}/status`,
          {
            method: 'PATCH',
            body: JSON.stringify(body),
          },
        );
        const updated = res.data;
        setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, ...updated } : r)));
        if (selected && selected._id === id) setSelected({ ...selected, ...updated });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to update status';
        alert(msg);
      } finally {
        setActionLoading(null);
        setConfirmAction(null);
        setShowReject(false);
        setRejectReason('');
      }
    },
    [adminName, selected, setRequests, setSelected],
  );

  return {
    actionLoading,
    rejectReason,
    setRejectReason,
    showReject,
    setShowReject,
    confirmAction,
    setConfirmAction,
    updateStatus,
  };
}

// ---------------------------------------------------------------------------
// Main hook: composes list + viewer + actions for the admin Requests page
// ---------------------------------------------------------------------------

export function useAdminRequests() {
  const { adminUser } = useAdminAuth();

  // List / filter / pagination
  const [requests, setRequests] = useState<PrintingRequest[]>([]);
  const [meta, setMeta] = useState<ListMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PrintingRequest | null>(null);

  // Document viewer (blob streaming)
  const {
    viewingDoc,
    setViewingDoc,
    docBlobUrl,
    docLoading,
    docError,
    openDocument,
    closeDocument,
  } = useDocumentViewer();

  // Status actions
  const {
    actionLoading,
    rejectReason,
    setRejectReason,
    showReject,
    setShowReject,
    confirmAction,
    setConfirmAction,
    updateStatus,
  } = useAdminRequestActions(adminUser?.name, setRequests, selected, setSelected);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      const res = await apiFetch<{ success: boolean; data: PrintingRequest[]; meta: ListMeta }>(
        `/printing-requests?${params.toString()}`,
        { method: 'GET' },
      );
      setRequests(res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load requests';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  // Initial + reactive fetch
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Reset page when filter / search changes (avoids empty pages)
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return {
    // context
    adminUser,
    // list
    requests,
    setRequests,
    meta,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    fetchRequests,
    pendingCount,
    // selection (drawer)
    selected,
    setSelected,
    // viewer
    viewingDoc,
    setViewingDoc,
    docBlobUrl,
    docLoading,
    docError,
    openDocument,
    closeDocument,
    // actions
    actionLoading,
    rejectReason,
    setRejectReason,
    showReject,
    setShowReject,
    confirmAction,
    setConfirmAction,
    updateStatus,
  };
}

export default useAdminRequests;
