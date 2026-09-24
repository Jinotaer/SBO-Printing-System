import { Link } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { ShimmeringText } from "@/components/shimmering-text";
import { ErrorToast } from "@/common/ErrorToast";
import { useForgotPassword } from "../../hooks/useForgotPassword";
import loginIllustration from "../../assets/icon.png";
import SBOLogo from "../../assets/sbo.png";

export default function ForgotPassword() {
  const {
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
  } = useForgotPassword();

  return (
    <div className="min-h-screen min-h-[100dvh] lg:h-screen w-full flex flex-col lg:flex-row bg-[#FAFAF9] overflow-y-auto lg:overflow-hidden font-sans text-[#2A1400] selection:bg-[#FF7701]/20 selection:text-[#2A1400]">
      {/* ======================================================== */}
      {/* LEFT HALF: Deep Navy Organic Wave & Adaptive Illustration - same as Login/Register */}
      {/* ======================================================== */}
      <div className="w-full lg:w-1/2 h-56 sm:h-72 md:h-80 lg:h-full relative bg-white flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-10 shrink-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-100 select-none">
        {/* Dynamic Curved Deep Navy Wave Backdrop - identical to Login/Register */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <svg
            className="absolute -top-10 -left-10 w-[130%] h-[130%]"
            viewBox="0 0 600 600"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="waveGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0a469b" />
                <stop offset="50%" stopColor="#0a469b" />
                <stop offset="100%" stopColor="#0a469b" />
              </linearGradient>
            </defs>
            <path
              d="M 0,0 
                 L 460,0 
                 C 430,130 380,220 280,300 
                 C 180,380 130,460 90,600 
                 L 0,600 Z"
              fill="url(#waveGradFull)"
            />
          </svg>
        </div>

        {/* Top Header Floating Badge - identical to Login/Register */}
        <div className="relative z-10 w-full flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-xs border border-white/70">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#FFB647] animate-pulse" />
            <ShimmeringText
              text="BukSU SBO System"
              duration={3}
              className="text-[11px] sm:text-xs font-bold text-[#073474] tracking-wide"
            />
          </div>
        </div>

        {/* Center Vector Desk Illustration - identical sizing to Login/Register */}
        <div className="relative z-10 my-auto py-1 sm:py-2 flex items-center justify-center w-full flex-1 min-h-0">
          <div className="relative w-full h-full max-w-[280px] sm:max-w-[380px] md:max-w-[460px] lg:max-w-[640px] xl:max-w-[800px] flex items-center justify-center">
            <img
              src={loginIllustration}
              alt="BukSU SBO Illustration"
              className="w-full h-full max-h-[30vh] sm:max-h-[36vh] md:max-h-[42vh] lg:max-h-[74vh] xl:max-h-[82vh] object-contain transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT HALF: Form panel - same outer proportions as Login/Register */}
      {/* ======================================================== */}
      <div className="w-full lg:w-1/2 flex-1 lg:h-full bg-white flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-10 xl:px-20 py-6 sm:py-8 md:py-12 overflow-y-auto">
        <div className="w-full max-w-[480px] mx-auto">
          {/* Brand header - identical to Register/Login */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src={SBOLogo}
                alt="SBO LOGO"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
              />
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#073474]">
                  SBO
                </span>
                <span className="text-xl font-black tracking-tight text-[#FF7701]">
                  Printing System
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 tracking-wide mt-1 uppercase">
                Bukidnon State University
              </p>
            </div>
          </div>

          {/* Title block */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-[28px] font-black tracking-tighter leading-none text-[#1A140B]">
              Reset Password
            </h1>
            <p className="text-[13px] leading-relaxed text-slate-600 font-medium mt-2 max-w-[42ch]">
              Enter your institutional BukSU email to receive recovery instructions.
            </p>
          </div>

          {/* Success / Recovery Sent State - inline, keep WCAG */}
          {success && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed text-emerald-800">{success}</p>
            </div>
          )}

          {!isSubmitted ? (
            <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-[11px] font-bold tracking-wide text-slate-700"
                >
                  BukSU student email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@student.buksu.edu.ph"
                    autoComplete="email"
                    autoFocus
                    className={`w-full h-11 pl-10 pr-10 rounded-xl border bg-white text-[13px] font-medium text-[#1A140B] placeholder:text-slate-500 outline-none transition-all ${
                      email && isBuksuDomain
                        ? "border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15"
                        : "border-slate-200 focus:border-[#FF7701] focus:ring-1 focus:ring-[#FF7701]/15"
                    }`}
                    required
                  />
                  {email && isBuksuDomain && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#073474] hover:bg-[#052655] text-white font-bold text-[14px] rounded-xl shadow-md shadow-[#073474]/10 flex items-center justify-center gap-2 active:translate-y-[1px] active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying Account...
                    </>
                  ) : (
                    <>
                      Send Recovery Instructions
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-[11px] font-medium text-slate-500 mt-3">
                  Recovery link expires in 15 minutes for security.
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#073474]/5 border border-[#073474]/15 text-xs text-[#2A1400] space-y-2">
                <div className="font-bold text-[#073474] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF7701]" />
                  Next Steps
                </div>
                <p className="text-xs leading-relaxed font-medium text-slate-600">
                  Open your <strong className="text-[#073474]">@student.buksu.edu.ph</strong> Gmail inbox and click the secure password verification link.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleResend}
                disabled={loading || resendCooldown > 0}
                className="w-full h-11 bg-white hover:bg-slate-50 text-[#2A1400] font-bold rounded-xl border border-slate-200 hover:border-[#FF7701] transition-all flex items-center justify-center gap-2 active:translate-y-[1px] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none text-[13px] shadow-xs"
              >
                <RotateCcw className="w-4 h-4 text-[#FF7701]" />
                {resendCooldown > 0 ? `Resend link in ${resendCooldown}s` : "Resend Email Link"}
              </Button>
            </div>
          )}

          {/* Footer nav - consistent with Register/Login */}
          <div className="mt-6 pt-5 border-t border-slate-200/70 flex items-center justify-between text-xs">
            <Link
              to="/login"
              className="font-bold text-[#073474] hover:text-[#FF7701] inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
            <Link
              to="/register"
              className="font-medium text-slate-500 hover:text-[#073474] transition-colors"
            >
              Need an account? <span className="font-bold text-[#073474] hover:text-[#FF7701] underline underline-offset-2">Register</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Validation + API errors → common bottom-right toast */}
      <ErrorToast
        message={error}
        title="Recovery failed"
        variant="error"
        durationMs={5000}
        onDismiss={() => setError(null)}
      />
    </div>
  );
}
