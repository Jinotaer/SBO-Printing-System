import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { isBuksuEmail } from "../services/authService";

export interface RegisterNavigationState {
  email?: string;
  name?: string;
  unregisteredNotice?: boolean;
}

export function useAdminLogin() {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithGoogleIdToken, loading: authLoading } = useAdminAuth();

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const navigateToRegister = (state?: RegisterNavigationState) => {
    navigate("/register", { state });
  };

  const navigateToDashboard = () => {
    navigate("/admin/dashboard", { replace: true });
  };

  const handleAuthenticate = async (email: string, name?: string) => {
    setError(null);
    setStatusMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!isBuksuEmail(normalizedEmail)) {
      setError("Access Restricted: Only @student.buksu.edu.ph accounts are permitted.");
      return;
    }

    // Try real backend login (Google SSO simulation - no password) — fallback/mock path
    setStatusMessage("Verifying account with server...");
    const result = await loginWithGoogle(normalizedEmail, name);

    if (result.success) {
      setShowGoogleModal(false);
      setStatusMessage("Account verified! Signing you in to BukSU SBO Portal...");
      setTimeout(() => {
        navigateToDashboard();
      }, 500);
      return;
    }

    // If unregistered, redirect to register
    if (result.isUnregistered) {
      setIsRedirecting(true);
      setShowGoogleModal(false);
      setStatusMessage(`Email "${normalizedEmail}" is not registered yet. Redirecting to registration...`);
      setTimeout(() => {
        navigateToRegister({
          email: normalizedEmail,
          name: name || "",
          unregisteredNotice: true,
        });
        setIsRedirecting(false);
      }, 1200);
      return;
    }

    setError(result.error || "Authentication failed. Please try again.");
    setStatusMessage(null);
  };

  // Real Google OAuth: verifies ID token via POST /api/auth/google (with optional reCAPTCHA)
  const handleGoogleCredential = async (idToken: string, recaptchaToken?: string | null) => {
    setError(null);
    setStatusMessage("Verifying Google identity...");

    // Quick client-side decode to pre-validate domain before hitting server
    try {
      const payload = JSON.parse(atob(idToken.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")));
      const email = String(payload.email || "").trim().toLowerCase();
      if (email && !isBuksuEmail(email)) {
        setError("Access Restricted: Only @student.buksu.edu.ph accounts are permitted.");
        setStatusMessage(null);
        return;
      }
    } catch {
      // ignore decode errors — server will validate
    }

    const result = await loginWithGoogleIdToken(idToken, recaptchaToken ?? undefined);

    if (result.success) {
      setShowGoogleModal(false);
      setStatusMessage("Google verified! Signing you in to BukSU SBO Portal...");
      setTimeout(() => {
        navigateToDashboard();
      }, 500);
      return;
    }

    if (result.isUnregistered) {
      // Extract email from token for registration prefill
      let emailFromToken = "";
      let nameFromToken = "";
      try {
        const payload = JSON.parse(atob(idToken.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")));
        emailFromToken = String(payload.email || "").trim().toLowerCase();
        nameFromToken = String(payload.name || "");
      } catch {
        // ignore
      }
      setIsRedirecting(true);
      setShowGoogleModal(false);
      setStatusMessage(`Email "${emailFromToken || "unknown"}" is not registered yet. Redirecting to registration...`);
      setTimeout(() => {
        navigateToRegister({
          email: emailFromToken,
          name: nameFromToken,
          unregisteredNotice: true,
        });
        setIsRedirecting(false);
      }, 1200);
      return;
    }

    setError(result.error || "Google authentication failed. Please try again.");
    setStatusMessage(null);
  };

  return {
    showGoogleModal,
    setShowGoogleModal,
    error,
    setError,
    statusMessage,
    setStatusMessage,
    isRedirecting,
    showHelp,
    setShowHelp,
    authLoading,
    isLoading: authLoading || isRedirecting,
    handleAuthenticate,
    handleGoogleCredential,
    navigateToRegister,
    navigateToDashboard,
  };
}

export default useAdminLogin;
