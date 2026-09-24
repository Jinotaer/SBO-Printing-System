import { useCallback, useState } from "react";

export interface UseErrorToastReturn {
  message: string | null;
  title: string | null;
  showError: (message: string, title?: string) => void;
  clearError: () => void;
}

/**
 * Local hook for any page that needs a bottom-right error toast.
 * Keeps API identical to LoginAdmin's popupMessage handling but extracts
 * the 5s auto-dismiss logic into the toast itself.
 *
 * Usage:
 * const { message, showError, clearError } = useErrorToast();
 * // on catch: showError(err.message, "Authentication Error")
 * // render: <ErrorToast message={message} title={title ?? undefined} onDismiss={clearError} />
 */
export function useErrorToast(): UseErrorToastReturn {
  const [message, setMessage] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  const showError = useCallback((msg: string, ttl = "Something went wrong") => {
    setMessage(msg);
    setTitle(ttl);
  }, []);

  const clearError = useCallback(() => {
    setMessage(null);
    setTitle(null);
  }, []);

  return { message, title, showError, clearError };
}

export default useErrorToast;
