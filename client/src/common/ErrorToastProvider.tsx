import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ErrorToast } from "./ErrorToast";

type ToastVariant = "error" | "warning" | "info";

interface ToastState {
  message: string | null;
  title: string | null;
  variant: ToastVariant;
}

interface ErrorToastContextValue {
  showError: (message: string, title?: string, variant?: ToastVariant) => void;
  clearError: () => void;
}

const ErrorToastContext = createContext<ErrorToastContextValue | null>(null);

export function useGlobalErrorToast(): ErrorToastContextValue {
  const ctx = useContext(ErrorToastContext);
  if (!ctx) throw new Error("useGlobalErrorToast must be used within <ErrorToastProvider>");
  return ctx;
}

export function ErrorToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ message: null, title: null, variant: "error" });

  const showError = useCallback(
    (message: string, title = "Something went wrong", variant: ToastVariant = "error") => {
      setToast({ message, title, variant });
    },
    []
  );

  const clearError = useCallback(() => {
    setToast({ message: null, title: null, variant: "error" });
  }, []);

  const value = useMemo(() => ({ showError, clearError }), [showError, clearError]);

  return (
    <ErrorToastContext.Provider value={value}>
      {children}
      <ErrorToast
        message={toast.message}
        title={toast.title ?? undefined}
        variant={toast.variant}
        onDismiss={clearError}
      />
    </ErrorToastContext.Provider>
  );
}

export default ErrorToastProvider;
