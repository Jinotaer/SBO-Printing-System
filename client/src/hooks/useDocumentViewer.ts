import { useEffect, useState, useCallback } from 'react';
import type { PrintingRequest } from './adminRequests.types';

// ---------------------------------------------------------------------------
// Document viewer — streams PDF/image/office docs as blob to avoid redirect,
// auto-download, or white iframe caused by Content-Disposition headers.
// ---------------------------------------------------------------------------

export function useDocumentViewer() {
  const [viewingDoc, setViewingDoc] = useState<PrintingRequest | null>(null);
  const [docBlobUrl, setDocBlobUrl] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const openDocument = useCallback((req: PrintingRequest) => {
    setViewingDoc(req);
  }, []);

  const closeDocument = useCallback(() => {
    setViewingDoc(null);
  }, []);

  useEffect(() => {
    if (!viewingDoc) {
      if (docBlobUrl) URL.revokeObjectURL(docBlobUrl);
      setDocBlobUrl(null);
      setDocError(null);
      return;
    }

    let objectUrl: string | null = null;
    const controller = new AbortController();

    const fetchDoc = async () => {
      setDocLoading(true);
      setDocError(null);
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const url = `${base}/printing-requests/document/${encodeURIComponent(viewingDoc.requestCode)}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to load document (${res.status})`);
        const blob = await res.blob();
        const mime = viewingDoc.document.mimeType || blob.type;
        const typedBlob = mime && blob.type !== mime ? new Blob([blob], { type: mime }) : blob;
        objectUrl = URL.createObjectURL(typedBlob);
        setDocBlobUrl(objectUrl);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        const msg = e instanceof Error ? e.message : 'Failed to load document';
        if ((e as Error)?.name !== 'AbortError') setDocError(msg);
      } finally {
        setDocLoading(false);
      }
    };

    fetchDoc();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [viewingDoc]);

  return {
    viewingDoc,
    setViewingDoc,
    docBlobUrl,
    docLoading,
    docError,
    openDocument,
    closeDocument,
  };
}

export default useDocumentViewer;
