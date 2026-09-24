import { AdminLayout } from "../../components/layout/AdminLayout";
import { Button } from "../../components/ui/button";
import { Pagination } from "../../common/Pagination";
import {
  Search,
  FileText,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Layers,
  Package,
  Check,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  SearchX,
  Ban,
} from "lucide-react";
import {
  useAdminRequests,
  STATUS_TABS,
  type RequestStatus,
} from "../../hooks/useAdminRequests";

// ---------------------------------------------------------------------------
// Helpers — data-only, no decorative icons
// ---------------------------------------------------------------------------

function statusStyles(status: RequestStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "PROCESSING":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PRINTING":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "READY_FOR_CLAIM":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "COMPLETED":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function StatusPill({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide leading-none border whitespace-nowrap ${statusStyles(status)}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function mimeIcon(mime: string) {
  if (mime.includes("pdf")) return FileText;
  if (mime.startsWith("image/")) return FileImage;
  if (mime.includes("sheet") || mime.includes("excel")) return FileSpreadsheet;
  if (mime.includes("presentation") || mime.includes("powerpoint"))
    return Layers;
  if (mime.includes("zip") || mime.includes("archive")) return FileArchive;
  return FileText;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// Page
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

  const hasActiveFilter = statusFilter !== "ALL" || search.trim().length > 0;

  return (
    <AdminLayout
      currentPageTitle="Print Queue"
      currentPageSubtitle="Review, approve, and dispatch student printing jobs to the SBO station"
    >
      <div className="space-y-4">
        {/* ── Controls — search + filters (data-driven, minimal) ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Search row */}
          <div className="p-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search request code, student, document..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200 outline-none transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => fetchRequests()}
              className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-colors"
              title="Refresh queue"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Active filter summary — data only */}
          {hasActiveFilter && (
            <div className="px-3 pb-2 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 truncate">
                <span className="font-medium text-slate-900 tabular-nums">{meta.total}</span> results
                {statusFilter !== "ALL" && (
                  <>
                    {" "}
                    · <span className="font-medium text-slate-900">{statusFilter.replace(/_/g, " ")}</span>
                  </>
                )}
                {search && (
                  <>
                    {" "}
                    · “<span className="font-medium text-slate-900 truncate">{search}</span>”
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
                className="shrink-0 text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2"
              >
                Clear
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-slate-100" />

          {/* Filter tabs — text only, status-driven */}
          <div className="px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-thin">
            <span className="text-[11px] font-medium tracking-widest uppercase text-slate-400 shrink-0">
              Status
            </span>
            <div className="flex items-center gap-1.5">
              {STATUS_TABS.map((tab) => {
                const isActive = statusFilter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                      isActive
                        ? "bg-[#0a469b] text-white border-[#0a469b]"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {tab.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs text-slate-500 shrink-0 pl-3 border-l border-slate-100">
              <span className="tabular-nums font-medium text-slate-900">{meta.total}</span> total
              <span className="text-slate-300">·</span>
              <span className="tabular-nums font-medium text-slate-900">{pendingCount}</span> pending
            </div>
          </div>
        </div>

        {/* ── Table Card — dense, data-first, no decorative icons ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Table header bar — plain */}
          <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-3">
            <h3 className="text-[13px] font-semibold tracking-tight text-slate-900">
              Request Queue
              <span className="ml-2 font-normal text-slate-500 text-xs">
                <span className="tabular-nums font-medium text-slate-700">{meta.total}</span> requests
                {meta.totalPages > 1 && (
                  <span>
                    {" "}
                    • page <span className="tabular-nums font-medium text-slate-700">{page}</span> of {meta.totalPages}
                  </span>
                )}
              </span>
            </h3>
            <span className="hidden sm:inline text-[11px] font-medium text-slate-500">
              {loading ? "Loading…" : `${requests.length} on this page`}
            </span>
          </div>

          {/* Table body */}
          {loading ? (
            <div className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-4 animate-pulse">
                  <div className="w-28 h-3 bg-slate-100 rounded" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="h-3 w-32 bg-slate-100 rounded" />
                    <div className="h-2.5 w-24 bg-slate-100 rounded" />
                  </div>
                  <div className="hidden md:block flex-1 min-w-0 space-y-1.5">
                    <div className="h-3 w-36 bg-slate-100 rounded" />
                    <div className="h-2.5 w-20 bg-slate-100 rounded" />
                  </div>
                  <div className="hidden sm:block w-36 h-2.5 bg-slate-100 rounded" />
                  <div className="w-24 h-6 bg-slate-100 rounded-full" />
                  <div className="w-14 h-7 bg-slate-100 rounded-lg" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-3">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Unable to load requests</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[44ch] mx-auto leading-relaxed">{error}</p>
              <Button onClick={() => fetchRequests()} className="mt-4 h-8 rounded-lg bg-[#073474] hover:bg-[#052655] text-white text-xs font-semibold">
                <RefreshCw className="w-3.5 h-3.5" /> Try again
              </Button>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                {hasActiveFilter ? <SearchX className="w-5 h-5" /> : <Package className="w-5 h-5" />}
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                {hasActiveFilter ? "No matching requests" : "Queue is empty"}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[42ch] mx-auto leading-relaxed">
                {hasActiveFilter
                  ? "No printing requests match your current search and filters. Try clearing filters or searching with a different term."
                  : "No printing jobs have been submitted yet. New student requests will appear here."}
              </p>
              {hasActiveFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                  className="mt-4 h-8 rounded-lg text-xs font-semibold"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="py-2.5 px-4 text-[11px] font-semibold tracking-widest uppercase text-slate-500 whitespace-nowrap">
                      Request
                    </th>
                    <th className="py-2.5 px-4 text-[11px] font-semibold tracking-widest uppercase text-slate-500">
                      Student
                    </th>
                    <th className="py-2.5 px-4 text-[11px] font-semibold tracking-widest uppercase text-slate-500">
                      Document
                    </th>
                    <th className="py-2.5 px-4 text-[11px] font-semibold tracking-widest uppercase text-slate-500 whitespace-nowrap">
                      Submitted
                    </th>
                    <th className="py-2.5 px-4 text-[11px] font-semibold tracking-widest uppercase text-slate-500">
                      Status
                    </th>
                    <th className="py-2.5 px-4 text-[11px] font-semibold tracking-widest uppercase text-slate-500 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Request Code — mono primary identifier */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[13px] font-semibold tracking-tight text-[#073474] tabular-nums">{r.requestCode}</span>
                      </td>

                      {/* Student — name + ID */}
                      <td className="py-3 px-4 min-w-[180px]">
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-slate-900 leading-none truncate max-w-[200px]" title={r.student.fullName}>
                            {r.student.fullName}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 leading-none mt-1 tabular-nums" title={r.student.studentId}>
                            {r.student.studentId}
                          </div>
                        </div>
                      </td>

                      {/* Document — name + meta */}
                      <td className="py-3 px-4 max-w-[280px]">
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-slate-900 truncate leading-none" title={r.document.originalName}>
                            {r.document.originalName}
                          </div>
                          <div className="text-[11px] text-slate-500 leading-none mt-1 truncate">
                            <span className="truncate">{r.document.mimeType}</span>
                            <span className="mx-1 text-slate-300">•</span>
                            <span className="tabular-nums">{formatSize(r.document.sizeBytes)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Submitted — data only */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs text-slate-600 tabular-nums" title={r.createdAt}>
                          {formatDate(r.createdAt)}
                        </span>
                      </td>

                      {/* Status — text pill only, no icons */}
                      <td className="py-3 px-4">
                        <StatusPill status={r.status} />
                      </td>

                      {/* Action — minimal text button, no icon */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelected(r)}
                          className="inline-flex items-center justify-center h-7 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-[#073474]/30 hover:text-[#073474] hover:bg-[#073474]/5 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            page={page}
            total={meta.total}
            limit={meta.limit}
            totalPages={meta.totalPages}
            onPageChange={setPage}
            itemLabel="requests"
          />
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="flex-1 bg-[#0F172A]/40 "
            onClick={() => setSelected(null)}
            aria-hidden="true"
          />
          <div className="w-full max-w-[560px] h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden">
            {/* Drawer header — sticky, data only */}
            <div className="shrink-0 bg-white border-b border-slate-200 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[15px] font-semibold tracking-tight text-slate-900 tabular-nums">
                      {selected.requestCode}
                    </span>
                    <StatusPill status={selected.status} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>Submitted {formatDate(selected.createdAt)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>Updated {formatDate(selected.updatedAt)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors shrink-0"
                  aria-label="Close drawer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {/* Timeline — minimal */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h4 className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-4">
                  Progress
                </h4>

                <div className="relative">
                  {/* vertical line */}
                  <div
                    className="absolute left-[11px] top-[12px] bottom-[12px] w-px bg-slate-200"
                    aria-hidden="true"
                  />

                  <div className="space-y-4">
                    {[
                      {
                        key: "PENDING",
                        label: "Request Submitted",
                        desc: `Received ${formatDate(selected.createdAt)} • Awaiting SBO review`,
                        done: true,
                        current: selected.status === "PENDING",
                      },
                      {
                        key: "PROCESSING",
                        label: "Processing",
                        desc: "Staff reviews file & prepares print settings",
                        done: [
                          "PROCESSING",
                          "PRINTING",
                          "READY_FOR_CLAIM",
                          "COMPLETED",
                        ].includes(selected.status),
                        current: selected.status === "PROCESSING",
                      },
                      {
                        key: "PRINTING",
                        label: "Printing",
                        desc: "Document is being printed at station",
                        done: [
                          "PRINTING",
                          "READY_FOR_CLAIM",
                          "COMPLETED",
                        ].includes(selected.status),
                        current: selected.status === "PRINTING",
                      },
                      {
                        key: "READY_FOR_CLAIM",
                        label: "Ready for Claim",
                        desc: "Printed • At SBO desk Tray A • Email sent to student",
                        done: ["READY_FOR_CLAIM", "COMPLETED"].includes(
                          selected.status,
                        ),
                        current: selected.status === "READY_FOR_CLAIM",
                      },
                      {
                        key: "COMPLETED",
                        label: "Completed",
                        desc: "Claimed by student with code verification",
                        done: selected.status === "COMPLETED",
                        current: selected.status === "COMPLETED",
                      },
                    ].map((step, i) => (
                      <div
                        key={step.key}
                        className="relative flex items-start gap-3"
                      >
                        <div
                          className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 border transition-colors ${
                            step.done
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : step.current
                                ? "bg-slate-900 border-slate-900 text-white"
                                : "bg-white border-slate-200 text-slate-400"
                          }`}
                        >
                          {step.done ? <Check className="w-3 h-3" /> : i + 1}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div
                            className={`text-[13px] font-medium leading-none ${step.done || step.current ? "text-slate-900" : "text-slate-400"}`}
                          >
                            {step.label}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {step.desc}
                          </div>
                        </div>
                        {step.current && (
                          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5" />
                        )}
                      </div>
                    ))}

                    {selected.status === "REJECTED" && (
                      <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                          <Ban className="w-3 h-3" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-red-800">
                            Rejected
                          </p>
                          <p className="text-xs text-red-700/80 mt-1 leading-relaxed break-words">
                            {selected.rejectionReason || "No reason provided"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Student */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h4 className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-3">
                  Student
                </h4>
                <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    {getInitials(selected.student.fullName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 leading-none">
                      {selected.student.fullName}
                    </p>
                    <p className="text-xs font-mono text-slate-500 mt-1 tabular-nums">
                      {selected.student.studentId}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {selected.student.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                  <div>
                    <p className="text-[10px] font-medium tracking-widest uppercase text-slate-400">
                      Department
                    </p>
                    <p className="font-medium text-slate-900 mt-1 leading-tight">
                      {selected.student.department}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium tracking-widest uppercase text-slate-400">
                      Year Level
                    </p>
                    <p className="font-medium text-slate-900 mt-1">
                      {selected.student.yearLevel}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-medium tracking-widest uppercase text-slate-400">
                      Email
                    </p>
                    <p className="font-medium text-slate-900 mt-1 break-all">
                      {selected.student.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h4 className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-3">
                  Document
                </h4>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    {(() => {
                      const I = mimeIcon(selected.document.mimeType);
                      return <I className="w-4 h-4 text-slate-600" />;
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 leading-tight break-all">
                      {selected.document.originalName}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 tabular-nums">
                      {selected.document.mimeType} • {formatSize(selected.document.sizeBytes)} •{" "}
                      <span
                        className={
                          selected.document.storageType === "google_drive"
                            ? "text-slate-900 font-medium"
                            : "text-slate-500"
                        }
                      >
                        {selected.document.storageType === "google_drive" ? "Drive" : "Local"}
                      </span>
                    </p>
                    <p
                      className="text-[11px] font-mono text-slate-400 truncate mt-1"
                      title={selected.document.storagePath}
                    >
                      {selected.document.storagePath}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openDocument(selected)}
                  className="w-full mt-3 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                >
                  Open document{" "}
                  <span className="text-slate-500">
                    • {selected.document.storageType === "google_drive" ? "Drive" : "Local"}
                  </span>
                </button>
              </div>

              {/* Options */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h4 className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-3">
                  Printing options
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Paper", value: selected.options.paperSize },
                    {
                      label: "Color",
                      value:
                        selected.options.colorMode === "color" ? "Color" : "Grayscale",
                    },
                    { label: "Sides", value: selected.options.printSides },
                    {
                      label: "Copies",
                      value: String(selected.options.copies),
                      mono: true,
                    },
                  ].map((o) => (
                    <div
                      key={o.label}
                      className="rounded-lg bg-slate-50 border border-slate-200 p-2.5"
                    >
                      <p className="text-[10px] font-medium tracking-widest uppercase text-slate-400">
                        {o.label}
                      </p>
                      <p
                        className={`text-sm font-medium text-slate-900 mt-1 ${o.mono ? "font-mono tabular-nums" : ""}`}
                      >
                        {o.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                  <p className="text-[10px] font-medium tracking-widest uppercase text-slate-400">
                    Pages
                  </p>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {selected.options.pageSelection === "all"
                      ? "All pages"
                      : selected.options.pageRange || "Custom range"}
                  </p>
                </div>
                {selected.options.additionalInstructions && (
                  <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                    <p className="text-[10px] font-medium tracking-widest uppercase text-amber-700">
                      Instructions
                    </p>
                    <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                      {selected.options.additionalInstructions}
                    </p>
                  </div>
                )}
              </div>

              {/* Staff Actions — light, data-first */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h4 className="text-[11px] font-semibold tracking-widest uppercase text-slate-500">
                  Staff actions
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Acting as{" "}
                  <span className="font-medium text-slate-900">
                    {adminUser?.name || "SBO Staff"}
                  </span>
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.status === "PENDING" && (
                    <>
                      <Button
                        disabled={!!actionLoading}
                        onClick={() =>
                          setConfirmAction({
                            title: "Start Processing?",
                            message:
                              "Move this request to PROCESSING? The student will be notified that staff is reviewing the file.",
                            onConfirm: () =>
                              updateStatus(selected._id, "PROCESSING"),
                          })
                        }
                        className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-medium shadow-sm gap-1.5"
                      >
                        {actionLoading === selected._id + "PROCESSING" ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : null}
                        Start processing
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowReject(true)}
                        className="h-8 px-3 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {selected.status === "PROCESSING" && (
                    <>
                      <Button
                        disabled={!!actionLoading}
                        onClick={() =>
                          setConfirmAction({
                            title: "Start Printing?",
                            message:
                              "Send to printer and mark as PRINTING? Ensure paper and toner are ready.",
                            onConfirm: () =>
                              updateStatus(selected._id, "PRINTING"),
                          })
                        }
                        className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-medium shadow-sm gap-1.5"
                      >
                        {actionLoading?.endsWith("PRINTING") ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : null}
                        Start printing
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowReject(true)}
                        className="h-8 px-3 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {selected.status === "PRINTING" && (
                    <Button
                      disabled={!!actionLoading}
                      onClick={() =>
                        setConfirmAction({
                          title: "Mark Ready for Claim?",
                          message:
                            "Confirm document is printed and placed at the SBO desk. An email will be sent to the student automatically.",
                          onConfirm: () =>
                            updateStatus(selected._id, "READY_FOR_CLAIM"),
                        })
                      }
                      className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm gap-1.5"
                    >
                      {actionLoading?.endsWith("READY_FOR_CLAIM") ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : null}
                      Mark ready for claim
                    </Button>
                  )}
                  {selected.status === "READY_FOR_CLAIM" && (
                    <Button
                      disabled={!!actionLoading}
                      onClick={() =>
                        setConfirmAction({
                          title: "Mark as Claimed?",
                          message:
                            "Confirm student has presented the Request Code and received the printed document?",
                          onConfirm: () =>
                            updateStatus(selected._id, "COMPLETED"),
                        })
                      }
                      className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-medium shadow-sm gap-1.5"
                    >
                      {actionLoading?.endsWith("COMPLETED") ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : null}
                      Mark as claimed
                    </Button>
                  )}
                  {selected.status === "COMPLETED" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 py-2">
                      Completed — no further actions.
                    </span>
                  )}
                  {selected.status === "REJECTED" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 py-2">
                      Rejected — no further actions.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {showReject && selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm"
            onClick={() => setShowReject(false)}
          />
          <div className="relative bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-[#0F172A]">
                  Reject Request
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                  Provide a reason — it will be emailed to the student and shown
                  in their tracker.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reject-reason"
                className="text-xs font-bold text-[#0F172A]"
              >
                Reason for rejection <span className="text-red-600">*</span>
              </label>
              <textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. File is corrupted, unsupported format, incomplete document..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 bg-[#FAFAF9] focus:bg-white focus:border-red-300 focus:ring-4 focus:ring-red-500/10 outline-none text-sm font-medium placeholder:text-slate-400 transition-all"
                autoFocus
              />
              <p className="text-[11px] font-medium text-slate-400">
                {rejectReason.length}/280 characters
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowReject(false)}
                className="h-9 rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                disabled={!rejectReason.trim() || !!actionLoading}
                onClick={() =>
                  updateStatus(selected._id, "REJECTED", {
                    rejectionReason: rejectReason.trim(),
                  })
                }
                className="h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black disabled:opacity-40 gap-1.5"
              >
                {actionLoading?.endsWith("REJECTED") ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Ban className="w-3.5 h-3.5" />
                )}
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Modal ── */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm"
            onClick={() => setConfirmAction(null)}
          />
          <div className="relative bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#073474]/10 border border-[#073474]/15 flex items-center justify-center text-[#073474] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-[#0F172A]">
                  {confirmAction.title}
                </h3>
                <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
                  {confirmAction.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setConfirmAction(null)}
                className="h-9 rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction.onConfirm}
                className="h-9 rounded-xl bg-[#073474] hover:bg-[#052655] text-white text-xs font-black"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── In-System Document Viewer ── */}
      {viewingDoc && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-white">
          <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FFF1E6] border border-orange-100 flex items-center justify-center text-[#FF7701] shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black tracking-tight text-[#0F172A] truncate max-w-[280px] sm:max-w-[420px]">
                  {viewingDoc.document.originalName}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 truncate">
                  {viewingDoc.requestCode} • {viewingDoc.document.mimeType} •{" "}
                  {formatSize(viewingDoc.document.sizeBytes)} •{" "}
                  <span
                    className={
                      viewingDoc.document.storageType === "google_drive"
                        ? "text-emerald-600 font-bold"
                        : "text-slate-500"
                    }
                  >
                    {viewingDoc.document.storageType === "google_drive"
                      ? "Google Drive"
                      : "Local"}{" "}
                    • In-system viewer
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {docBlobUrl && (
                <a
                  href={docBlobUrl}
                  download={viewingDoc.document.originalName}
                  className="hidden sm:inline-flex h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 items-center gap-1.5 shadow-xs"
                >
                  Download
                </a>
              )}
              <button
                type="button"
                onClick={closeDocument}
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-black text-white flex items-center justify-center transition-colors shadow-sm"
                aria-label="Close viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-[#FAFAF9] overflow-hidden relative flex flex-col">
            {docLoading && (
              <div className="flex-1 flex flex-col items-center justify-center bg-white">
                <div className="w-12 h-12 rounded-2xl bg-[#073474]/10 flex items-center justify-center mb-3">
                  <Loader2 className="w-6 h-6 text-[#073474] animate-spin" />
                </div>
                <p className="text-sm font-bold text-[#0F172A]">
                  Loading document…
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Streaming from{" "}
                  {viewingDoc.document.storageType === "google_drive"
                    ? "Google Drive"
                    : "local storage"}{" "}
                  in-system
                </p>
              </div>
            )}
            {docError && !docLoading && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-[#0F172A]">
                  Failed to load document
                </h4>
                <p className="text-xs font-medium text-slate-500 mt-1 max-w-[42ch]">
                  {docError}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={closeDocument}
                    className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold shadow-xs"
                  >
                    Close
                  </button>
                  {docBlobUrl && (
                    <a
                      href={docBlobUrl}
                      download={viewingDoc.document.originalName}
                      className="h-9 px-4 rounded-xl bg-[#073474] text-white text-xs font-bold inline-flex items-center shadow-sm"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            )}
            {!docLoading &&
              !docError &&
              docBlobUrl &&
              (() => {
                const mime = viewingDoc.document.mimeType || "";
                const isPdf = mime.includes("pdf");
                const isImage = mime.startsWith("image/");
                if (isPdf || isImage) {
                  return (
                    <iframe
                      src={docBlobUrl}
                      title={viewingDoc.document.originalName}
                      className="w-full flex-1 border-0 bg-white"
                      allow="fullscreen"
                    />
                  );
                }
                if (
                  mime.includes("officedocument") ||
                  mime.includes("msword") ||
                  mime.includes("presentation") ||
                  mime.includes("sheet")
                ) {
                  return (
                    <div className="flex-1 w-full h-full flex flex-col bg-white overflow-hidden">
                      <div className="h-8 bg-slate-50 border-b border-slate-200 flex items-center px-3 text-[11px] font-bold text-slate-500 gap-2 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
                        Office document — in-system preview
                      </div>
                      <iframe
                        src={docBlobUrl}
                        title={viewingDoc.document.originalName}
                        className="w-full flex-1 border-0 bg-white"
                      />
                      <div className="p-3 border-t border-slate-200 bg-[#FAFAF9] text-center">
                        <p className="text-[11px] font-medium text-slate-500">
                          If preview is blank, use Download to open in Word /
                          PowerPoint.
                        </p>
                      </div>
                    </div>
                  );
                }
                return (
                  <iframe
                    src={docBlobUrl}
                    title={viewingDoc.document.originalName}
                    className="w-full flex-1 border-0 bg-white"
                  />
                );
              })()}
          </div>

          <div className="h-10 border-t border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 text-[11px] font-medium text-slate-500 shrink-0">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Streamed
              securely in-system • {viewingDoc.requestCode} • No new tab
            </span>
            <span className="hidden sm:inline">Press Esc or × to close</span>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
