import { AdminLayout } from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/button';
import {
  Search,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Printer,
  Eye,
  X,
  Loader2,
  Filter,
  RefreshCw,
  ShieldCheck,
  Calendar,
  Layers,
  Package,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useAdminRequests, STATUS_TABS, type RequestStatus } from '../../hooks/useAdminRequests';

// ---------------------------------------------------------------------------
// Pure helpers (no hook / state) — kept in view layer for easy styling
// ---------------------------------------------------------------------------

function statusBadge(status: RequestStatus) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'PROCESSING':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'PRINTING':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'READY_FOR_CLAIM':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'COMPLETED':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'REJECTED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

function statusIcon(status: RequestStatus) {
  switch (status) {
    case 'PENDING':
      return <AlertCircle className="w-3 h-3" />;
    case 'PROCESSING':
      return <Clock className="w-3 h-3 animate-spin" />;
    case 'PRINTING':
      return <Printer className="w-3 h-3" />;
    case 'READY_FOR_CLAIM':
      return <CheckCircle2 className="w-3 h-3" />;
    case 'COMPLETED':
      return <Check className="w-3 h-3" />;
    case 'REJECTED':
      return <X className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return d;
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// ---------------------------------------------------------------------------
// Page Component — all stateful logic lives in useAdminRequests()
// ---------------------------------------------------------------------------

export default function AdminRequests() {
  const {
    adminUser,
    requests,
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
    selected,
    setSelected,
    viewingDoc,
    docBlobUrl,
    docLoading,
    docError,
    openDocument,
    closeDocument,
    actionLoading,
    rejectReason,
    setRejectReason,
    showReject,
    setShowReject,
    confirmAction,
    setConfirmAction,
    updateStatus,
  } = useAdminRequests();

  return (
    <AdminLayout
      currentPageTitle="Print Queue & Requests"
      currentPageSubtitle="Review, verify, print and release student documents - integrated with Google Drive"
    >
      <div className="space-y-6">
        {/* Top controls: Search + Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1 max-w-[480px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Request Code, Student Name, ID, Email, Document..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-[#FAFAF9] focus:bg-white focus:border-[#073474] focus:ring-2 focus:ring-[#073474]/15 outline-none text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchRequests()}
                className="h-10 px-3 rounded-xl border-slate-200 hidden sm:flex"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-500 font-medium">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <span className="text-[11px] font-bold text-slate-400">{meta.total} total</span>
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                  statusFilter === tab
                    ? 'bg-[#073474] text-white border-[#073474] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {tab.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-[#FAFAF9]/50 flex items-center justify-between">
            <h3 className="text-sm font-black text-[#2A1400] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF7701]" />
              Request Queue
              {pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-bold">
                  {pendingCount} pending in view
                </span>
              )}
            </h3>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Page {meta.page} of {meta.totalPages}
            </span>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-100">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-slate-100 rounded" />
                    <div className="h-2 w-1/2 bg-slate-100 rounded" />
                  </div>
                  <div className="w-20 h-6 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-red-700">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchRequests} className="mt-3 rounded-xl">
                Try again
              </Button>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Package className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No requests found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[40ch] mx-auto">
                No printing requests match your current search and filters. Try clearing filters or check back
                later.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                }}
                className="mt-4 rounded-xl"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF9] border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Request Code</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Document</th>
                    <th className="py-3 px-4">Options</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-[#073474] text-[13px]">{r.requestCode}</span>
                        <div className="text-[11px] text-slate-400">{formatSize(r.document.sizeBytes)}</div>
                      </td>
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <div className="font-bold text-[#2A1400] leading-none">{r.student.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{r.student.studentId}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{r.student.email}</div>
                        <div className="text-[11px] text-slate-500">
                          {r.student.department} • {r.student.yearLevel}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div
                          className="flex items-center gap-1.5 font-bold text-slate-800 truncate"
                          title={r.document.originalName}
                        >
                          <FileText className="w-3.5 h-3.5 text-[#FF7701] shrink-0" />
                          <span className="truncate">{r.document.originalName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{r.document.mimeType}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] leading-relaxed">
                        <span className="font-bold text-slate-700">{r.options.paperSize}</span> •{' '}
                        {r.options.colorMode === 'color' ? 'Color' : 'B&W'} • {r.options.printSides}
                        <br />
                        <span className="font-mono font-bold">{r.options.copies} copies</span> •{' '}
                        {r.options.pageSelection === 'all' ? 'All pages' : r.options.pageRange}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(r.createdAt)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge(r.status)}`}
                        >
                          {statusIcon(r.status)} {r.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelected(r)}
                          className="h-8 px-3 rounded-xl text-xs font-bold border-slate-200 hover:border-[#073474] hover:text-[#073474]"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-[#FAFAF9]/30">
              <span className="text-xs text-slate-500">
                Showing {(meta.page - 1) * meta.limit + 1}-{Math.min(meta.page * meta.limit, meta.total)} of{' '}
                {meta.total}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 rounded-xl text-xs"
                >
                  Previous
                </Button>
                <span className="text-xs font-bold text-slate-700 px-2">
                  {page} / {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 rounded-xl text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer / Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="w-full max-w-[640px] h-full bg-white shadow-2xl overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-start justify-between gap-4 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-[#073474]">{selected.requestCode}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge(selected.status)}`}>
                    {selected.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Submitted {formatDate(selected.createdAt)} • Updated {formatDate(selected.updatedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 flex-1">
              {/* Timeline */}
              <div className="bg-[#FAFAF9] rounded-2xl border border-slate-200 p-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#073474] mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Progress Timeline
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      key: 'PENDING',
                      label: 'Request Submitted',
                      desc: `Received ${formatDate(selected.createdAt)}`,
                      done: true,
                      current: selected.status === 'PENDING',
                    },
                    {
                      key: 'PROCESSING',
                      label: 'Processing',
                      desc: 'Staff reviews and prepares',
                      done: ['PROCESSING', 'PRINTING', 'READY_FOR_CLAIM', 'COMPLETED'].includes(selected.status),
                      current: selected.status === 'PROCESSING',
                    },
                    {
                      key: 'PRINTING',
                      label: 'Printing',
                      desc: 'Document being printed',
                      done: ['PRINTING', 'READY_FOR_CLAIM', 'COMPLETED'].includes(selected.status),
                      current: selected.status === 'PRINTING',
                    },
                    {
                      key: 'READY_FOR_CLAIM',
                      label: 'Ready for Claim',
                      desc: 'At SBO desk, email sent',
                      done: ['READY_FOR_CLAIM', 'COMPLETED'].includes(selected.status),
                      current: selected.status === 'READY_FOR_CLAIM',
                    },
                    {
                      key: 'COMPLETED',
                      label: 'Completed',
                      desc: 'Claimed by student',
                      done: selected.status === 'COMPLETED',
                      current: selected.status === 'COMPLETED',
                    },
                  ].map((step, i) => (
                    <div key={step.key} className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step.done ? 'bg-emerald-500 text-white' : step.current ? 'bg-[#073474] text-white ring-4 ring-[#073474]/15' : 'bg-slate-200 text-slate-500'}`}
                      >
                        {step.done ? <Check className="w-4 h-4" /> : i + 1}
                      </div>
                      <div className="flex-1">
                        <div className={`text-xs font-bold ${step.done || step.current ? 'text-[#2A1400]' : 'text-slate-400'}`}>
                          {step.label}
                        </div>
                        <div className="text-[11px] text-slate-500">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                  {selected.status === 'REJECTED' && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                      <strong>Rejected:</strong> {selected.rejectionReason || 'No reason provided'}
                    </div>
                  )}
                </div>
              </div>

              {/* Student */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#073474] mb-3">Student Information</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Name</span>
                    <p className="font-bold text-[#2A1400]">{selected.student.fullName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">ID</span>
                    <p className="font-mono font-bold">{selected.student.studentId}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Department</span>
                    <p className="font-bold">{selected.student.department}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Year</span>
                    <p className="font-bold">{selected.student.yearLevel}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Email</span>
                    <p className="font-bold">{selected.student.email}</p>
                  </div>
                </div>
              </div>

              {/* Document */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#073474] mb-3">Document</h4>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#FFF1E6] border border-orange-100 flex items-center justify-center text-[#FF7701] shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{selected.document.originalName}</p>
                      <p className="text-xs text-slate-500">
                        {selected.document.mimeType} • {formatSize(selected.document.sizeBytes)} •{' '}
                        {selected.document.storageType}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[300px]">{selected.document.storagePath}</p>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => openDocument(selected)}
                  className="w-full mt-3 h-10 rounded-xl bg-[#073474] hover:bg-[#052655] text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Open Document{' '}
                  {selected.document.storageType === 'google_drive' ? '(Drive)' : '(Local)'}
                </Button>
              </div>

              {/* Options */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#073474] mb-3">Printing Options</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Paper</span>
                    <p className="font-bold">{selected.options.paperSize}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Color</span>
                    <p className="font-bold">{selected.options.colorMode === 'color' ? 'Colored' : 'B&W'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Sides</span>
                    <p className="font-bold">{selected.options.printSides}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Copies</span>
                    <p className="font-bold font-mono">{selected.options.copies}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Pages</span>
                    <p className="font-bold">{selected.options.pageSelection === 'all' ? 'All pages' : selected.options.pageRange}</p>
                  </div>
                  {selected.options.additionalInstructions && (
                    <div className="col-span-2">
                      <span className="text-slate-500">Instructions</span>
                      <p className="font-medium italic">"{selected.options.additionalInstructions}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Staff Actions */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-[#FAFAF9]">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#073474] mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Staff Actions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selected.status === 'PENDING' && (
                    <>
                      <Button
                        disabled={!!actionLoading}
                        onClick={() =>
                          setConfirmAction({
                            title: 'Start Processing?',
                            message: 'Move this request to PROCESSING?',
                            onConfirm: () => updateStatus(selected._id, 'PROCESSING'),
                          })
                        }
                        className="h-9 px-4 rounded-xl bg-[#073474] hover:bg-[#052655] text-white text-xs font-bold"
                      >
                        {actionLoading === selected._id + 'PROCESSING' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}{' '}
                        Start Processing
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowReject(true)}
                        className="h-9 px-4 rounded-xl text-xs font-bold border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {selected.status === 'PROCESSING' && (
                    <>
                      <Button
                        disabled={!!actionLoading}
                        onClick={() =>
                          setConfirmAction({
                            title: 'Start Printing?',
                            message: 'Send to printer and mark as PRINTING?',
                            onConfirm: () => updateStatus(selected._id, 'PRINTING'),
                          })
                        }
                        className="h-9 px-4 rounded-xl bg-[#073474] hover:bg-[#052655] text-white text-xs font-bold"
                      >
                        {actionLoading?.endsWith('PRINTING') ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Printer className="w-3.5 h-3.5" />
                        )}{' '}
                        Start Printing
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowReject(true)}
                        className="h-9 px-4 rounded-xl text-xs font-bold border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {selected.status === 'PRINTING' && (
                    <Button
                      disabled={!!actionLoading}
                      onClick={() =>
                        setConfirmAction({
                          title: 'Mark Ready for Claim?',
                          message: 'Confirm document is printed and ready. An email will be sent to the student.',
                          onConfirm: () => updateStatus(selected._id, 'READY_FOR_CLAIM'),
                        })
                      }
                      className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      {actionLoading?.endsWith('READY_FOR_CLAIM') ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}{' '}
                      Mark Ready for Claim
                    </Button>
                  )}
                  {selected.status === 'READY_FOR_CLAIM' && (
                    <Button
                      disabled={!!actionLoading}
                      onClick={() =>
                        setConfirmAction({
                          title: 'Mark as Claimed?',
                          message: 'Confirm student has received the printed document with Request Code verification?',
                          onConfirm: () => updateStatus(selected._id, 'COMPLETED'),
                        })
                      }
                      className="h-9 px-4 rounded-xl bg-[#FF7701] hover:bg-[#E66A00] text-white text-xs font-bold"
                    >
                      {actionLoading?.endsWith('COMPLETED') ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}{' '}
                      Mark as Claimed
                    </Button>
                  )}
                  {selected.status === 'COMPLETED' && (
                    <span className="text-xs text-slate-500 font-medium py-2">No further actions - completed.</span>
                  )}
                  {selected.status === 'REJECTED' && (
                    <span className="text-xs text-red-600 font-medium py-2">Request rejected.</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Acting as: {adminUser?.name || 'SBO Staff'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showReject && selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowReject(false)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="text-base font-black text-[#2A1400]">Reject Request</h3>
            <p className="text-xs text-slate-500">Provide a reason - it will be emailed to the student.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Corrupted file, unsupported format..."
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReject(false)} className="h-9 rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                disabled={!rejectReason.trim() || !!actionLoading}
                onClick={() => updateStatus(selected._id, 'REJECTED', { rejectionReason: rejectReason.trim() })}
                className="h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {actionLoading?.endsWith('REJECTED') ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Confirm
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmAction(null)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="text-base font-black text-[#2A1400]">{confirmAction.title}</h3>
            <p className="text-xs text-slate-600">{confirmAction.message}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmAction(null)} className="h-9 rounded-xl text-xs">
                Cancel
              </Button>
              <Button onClick={confirmAction.onConfirm} className="h-9 rounded-xl bg-[#073474] text-white text-xs font-bold">
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* In-System Document Viewer (no redirect, no auto-download, no white screen) */}
      {viewingDoc && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-white">
          <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FFF1E6] border border-orange-100 flex items-center justify-center text-[#FF7701] shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-[#2A1400] truncate max-w-[280px] sm:max-w-[420px]">
                  {viewingDoc.document.originalName}
                </h3>
                <p className="text-[11px] text-slate-500 truncate">
                  {viewingDoc.requestCode} • {viewingDoc.document.mimeType} • {formatSize(viewingDoc.document.sizeBytes)} •{' '}
                  <span
                    className={viewingDoc.document.storageType === 'google_drive' ? 'text-emerald-600 font-bold' : 'text-slate-500'}
                  >
                    {viewingDoc.document.storageType === 'google_drive' ? 'Google Drive' : 'Local'} • In-system viewer
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {docBlobUrl && (
                <a
                  href={docBlobUrl}
                  download={viewingDoc.document.originalName}
                  className="hidden sm:inline-flex h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 items-center gap-1.5"
                >
                  Download
                </a>
              )}
              <button
                type="button"
                onClick={closeDocument}
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-black text-white flex items-center justify-center transition-colors"
                aria-label="Close viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-[#FAFAF9] overflow-hidden relative flex flex-col">
            {docLoading && (
              <div className="flex-1 flex flex-col items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 text-[#073474] animate-spin mb-3" />
                <p className="text-xs font-bold text-slate-600">Loading document...</p>
                <p className="text-[11px] text-slate-400">
                  Streaming from {viewingDoc.document.storageType === 'google_drive' ? 'Google Drive' : 'local'} in-system
                </p>
              </div>
            )}
            {docError && !docLoading && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                <h4 className="text-sm font-black text-[#2A1400]">Failed to load document</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[40ch]">{docError}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={closeDocument}
                    className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                  >
                    Close
                  </button>
                  {docBlobUrl && (
                    <a
                      href={docBlobUrl}
                      download={viewingDoc.document.originalName}
                      className="h-9 px-4 rounded-xl bg-[#073474] text-white text-xs font-bold inline-flex items-center"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            )}
            {!docLoading && !docError && docBlobUrl && (
              (() => {
                const mime = viewingDoc.document.mimeType || '';
                const isPdf = mime.includes('pdf');
                const isImage = mime.startsWith('image/');
                if (isPdf || isImage) {
                  return <iframe src={docBlobUrl} title={viewingDoc.document.originalName} className="w-full flex-1 border-0 bg-white" allow="fullscreen" />;
                }
                if (
                  mime.includes('officedocument') ||
                  mime.includes('msword') ||
                  mime.includes('presentation') ||
                  mime.includes('sheet')
                ) {
                  return (
                    <div className="flex-1 w-full h-full flex flex-col bg-white overflow-hidden">
                      <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-3 text-[11px] font-bold text-slate-500 gap-2 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Office document - preview via in-system viewer
                      </div>
                      <iframe src={docBlobUrl} title={viewingDoc.document.originalName} className="w-full flex-1 border-0 bg-white" />
                      <div className="p-3 border-t border-slate-200 bg-[#FAFAF9] text-center">
                        <p className="text-[11px] text-slate-500">If preview appears blank, use Download to open in Word/PowerPoint.</p>
                      </div>
                    </div>
                  );
                }
                return <iframe src={docBlobUrl} title={viewingDoc.document.originalName} className="w-full flex-1 border-0 bg-white" />;
              })()
            )}
          </div>

          <div className="h-10 border-t border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 text-[11px] text-slate-500 shrink-0">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Streamed securely in-system • {viewingDoc.requestCode} • No new tab
            </span>
            <span className="hidden sm:inline">Press Esc or X to close</span>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
