import { useState } from "react";
import { isBuksuEmail, forgotPasswordApi } from "../services/authService";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const isBuksuDomain = email.trim().toLowerCase().endsWith("@student.buksu.edu.ph");

  const startCooldown = (seconds = 60) => {
    setResendCooldown(seconds);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter your BukSU student email.");
      return;
    }

    if (!isBuksuEmail(trimmedEmail)) {
      setError("Only official BukSU student emails (@student.buksu.edu.ph) are permitted.");
      return;
    }

    setLoading(true);

    try {
      const res = await forgotPasswordApi(trimmedEmail);

      if (!res.success) {
        setError(res.error || "Failed to send reset email. Please try again.");
        setLoading(false);
        return;
      }

      setIsSubmitted(true);
      setSuccess(res.message || `A password reset link & security instructions have been sent to ${trimmedEmail}.`);
      startCooldown(60);
      setLoading(false);
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Failed to send reset email. Please check your connection and try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await forgotPasswordApi(email.trim().toLowerCase());
      if (!res.success) {
        setError(res.error || "Unable to resend email right now.");
      } else {
        setSuccess(`A new recovery link was resent to ${email}. Please check your inbox.`);
        startCooldown(60);
      }
      setLoading(false);
    } catch {
      setError("Unable to resend email right now. Please try again later.");
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    error,
    setError,
    success,
    isSubmitted,
    resendCooldown,
    isBuksuDomain,
    handleResetPassword,
    handleResend,
  };
}

export default useForgotPassword;
