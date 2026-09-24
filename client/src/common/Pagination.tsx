import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  total: number;
  limit: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  itemLabel?: string;
  className?: string;
};

function getRange(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): (number | "DOTS")[] {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return getRange(1, totalPages);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  const first = 1;
  const last = totalPages;

  if (!showLeftDots && showRightDots) {
    const leftRange = getRange(1, 3 + siblingCount * 2);
    return [...leftRange, "DOTS", last];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = getRange(totalPages - (3 + siblingCount * 2) + 1, totalPages);
    return [first, "DOTS", ...rightRange];
  }

  // both dots
  const middle = getRange(leftSibling, rightSibling);
  return [first, "DOTS", ...middle, "DOTS", last];
}

export function Pagination({
  page,
  total,
  limit,
  totalPages: totalPagesProp,
  onPageChange,
  siblingCount = 1,
  itemLabel = "items",
  className,
}: PaginationProps) {
  const totalPages = totalPagesProp ?? Math.max(1, Math.ceil(total / Math.max(1, limit)));

  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const range = getPaginationRange(page, totalPages, siblingCount);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div
      className={[
        "flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-200 bg-white",
        className || "",
      ].join(" ")}
    >
      <span className="text-xs font-medium text-slate-500 order-2 sm:order-1 tabular-nums">
        Showing <span className="font-semibold text-slate-900">{total === 0 ? 0 : start}</span>
        {total > 0 && (
          <>
            –<span className="font-semibold text-slate-900">{end}</span>
          </>
        )}{" "}
        of <span className="font-semibold text-slate-900">{total}</span> {itemLabel}
      </span>

      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => canPrev && onPageChange(page - 1)}
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-medium border bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:text-[#073474] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-700 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3 h-3" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {range.map((p, idx) => {
            if (p === "DOTS") {
              return (
                <span
                  key={`dots-${idx}`}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 text-xs font-medium"
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }

            const isActive = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-label={`Go to page ${p}`}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "w-7 h-7 rounded-lg text-xs font-semibold inline-flex items-center justify-center border transition-colors tabular-nums",
                  isActive
                    ? "bg-[#073474] border-[#073474] text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-[#073474] hover:bg-slate-50",
                ].join(" ")}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => canNext && onPageChange(page + 1)}
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-medium border bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:text-[#073474] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-700 transition-colors"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
