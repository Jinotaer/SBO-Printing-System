import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { AlertCircle, X } from "lucide-react";

export type ErrorToastVariant = "error" | "warning" | "info";

export interface ErrorToastProps {
  message: string | null;
  title?: string;
  variant?: ErrorToastVariant;
  durationMs?: number;
  onDismiss: () => void;
}

/*
  Common bottom-right error toast - used across Login, Register, Dashboard.
  Position: fixed bottom-4 right-4, max-w-sm, consistent with LoginAdmin popup.
  - Light theme locked (white card, no dark inversion mid-page)
  - WCAG AA: red-600 text on red-50 bg, #2A1400 title on white
  - Shape: rounded-2xl (16px) card
  - Motion: spring entry, respects prefers-reduced-motion
*/

export function ErrorToast({
  message,
  title = "Something went wrong",
  variant = "error",
  durationMs = 5000,
  onDismiss,
}: ErrorToastProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!message) return;
    if (durationMs <= 0) return;
    const t = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [message, durationMs, onDismiss]);

  if (!message) return null;

  const variantStyles: Record<ErrorToastVariant, { iconWrap: string; icon: string }> = {
    error: {
      iconWrap: "bg-red-50 border-red-200",
      icon: "text-red-600",
    },
    warning: {
      iconWrap: "bg-amber-50 border-amber-200",
      icon: "text-amber-600",
    },
    info: {
      iconWrap: "bg-[#EBEFF8] border-[#073474]/15",
      icon: "text-[#073474]",
    },
  };

  const styles = variantStyles[variant];

  const content = (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full max-w-sm bg-white border border-red-200 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
    >
      <div className="p-4 flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${styles.iconWrap}`}
        >
          <AlertCircle className={`w-4 h-4 ${styles.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#2A1400] leading-none">{title}</p>
          <p className="text-xs font-medium text-slate-600 mt-1.5 leading-relaxed break-words">
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0 cursor-pointer active:translate-y-[1px] active:scale-[0.98]"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      <div className="pointer-events-auto">
        {reduce ? (
          content
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.6 }}
          >
            {content}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ErrorToast;
