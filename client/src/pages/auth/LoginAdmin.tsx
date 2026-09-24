import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import ReCAPTCHA from "react-google-recaptcha";
import { Skeleton } from "boneyard-js/react";
import { ShimmeringText } from "@/components/shimmering-text";
import { ErrorToast } from "@/common/ErrorToast";
import { useAdminLogin } from "../../hooks/useAdminLogin";
import loginIllustration from "../../assets/1.png";
import SBOLogo from "../../assets/sbo.png";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as
  | string
  | undefined;
const hasGoogleConfig = Boolean(
  GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.length > 10,
);
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as
  | string
  | undefined;
const hasRecaptchaConfig = Boolean(
  RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY.length > 10,
);

export default function LoginAdmin() {
  const {
    error,
    setError,
    statusMessage,
    showHelp,
    setShowHelp,
    isLoading,
    handleGoogleCredential,
  } = useAdminLogin();
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleGoogleSuccess = async (resp: CredentialResponse) => {
    setGoogleError(null);
    if (hasRecaptchaConfig && !recaptchaToken) {
      setGoogleError("Please complete the reCAPTCHA first.");
      return;
    }
    const idToken = resp.credential;
    if (!idToken) {
      setGoogleError("Google did not return a credential. Please try again.");
      return;
    }
    await handleGoogleCredential(idToken, recaptchaToken);
    // reset captcha after attempt (token is one-time)
    if (hasRecaptchaConfig) {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  const handleGoogleError = () => {
    setGoogleError("Google sign-in was cancelled or failed. Please try again.");
  };

  const dismissPopup = () => {
    setGoogleError(null);
    setError(null);
  };

  const popupMessage = googleError || error;

  return (
    <div className="min-h-screen min-h-[100dvh] lg:h-screen w-full flex flex-col lg:flex-row bg-[#FAFAF9] overflow-y-auto lg:overflow-hidden font-sans text-[#2A1400]">
      {/* ======================================================== */}
      {/* LEFT HALF: Deep Navy Organic Wave & Adaptive Illustration */}
      {/* ======================================================== */}
      <div className="w-full lg:w-1/2 h-56 sm:h-72 md:h-80 lg:h-full relative bg-white flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-10 shrink-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-100 select-none">
        {/* Dynamic Curved Deep Navy Wave Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <svg
            className="absolute -top-10 -left-10 w-[130%] h-[130%]"
            viewBox="0 0 600 600"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient
                id="waveGradFull"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
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

        {/* Top Header Floating Badge */}
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

        {/* Center Vector Desk Illustration (Responsive Scaling) */}
        <div className="relative z-10 my-auto py-1 sm:py-2 flex items-center justify-center w-full flex-1 min-h-0">
          <div className="relative w-full h-full max-w-[340px] sm:max-w-[440px] md:max-w-[560px] lg:max-w-[580px] xl:max-w-[660px] flex items-center justify-center">
            <img
              src={loginIllustration}
              alt="BukSU SBO Illustration"
              className="w-full h-full max-h-[36vh] sm:max-h-[46vh] md:max-h-[52vh] lg:max-h-[480px] xl:max-h-[530px] object-contain transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT HALF: Responsive Authentication Panel               */}
      {/* ======================================================== */}
      <div className="w-full lg:w-1/2 flex-1 lg:h-full bg-white flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-10 xl:px-20 py-6 sm:py-8 md:py-12 overflow-y-auto">
        <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col justify-center my-auto">
          {/* Top Brand Logo */}
          <div>
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Modern SBO emblem logo */}
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

              {/* Help button */}
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-slate-400 hover:text-[#073474] p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                title="Help & Domain Info"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-4 sm:mb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A1400] tracking-tight leading-tight">
                Login
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Sign in with your verified BukSU student Google account
              </p>
            </div>

            {/* Help guidelines drawer */}
            {showHelp && (
              <div className="mb-4 p-3.5 rounded-2xl bg-[#073474]/5 border border-[#073474]/20 text-xs text-[#2A1400] animate-in fade-in duration-200 shadow-xs">
                <div className="font-bold text-[#073474] flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#FF7701]" />
                  Authorized Access Guidelines
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Only accounts with the official institutional domain{" "}
                  <span className="bg-white px-1.5 py-0.5 rounded-md font-bold text-[#073474] border border-[#073474]/20">
                    @student.buksu.edu.ph
                  </span>{" "}
                  are authorized to sign in.
                </p>
              </div>
            )}

            {/* Status / Redirection Banner with ShimmeringText — kept inline as success */}

            {statusMessage && (
              <div className="mb-4 p-3.5 rounded-2xl border border-[#FF7701]/30 bg-orange-50/80 text-[#2A1400] flex items-start gap-3 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-[#FF7701] shrink-0 mt-0.5" />
                <div className="text-xs font-semibold leading-relaxed">
                  <ShimmeringText text={statusMessage} duration={1.8} />
                </div>
              </div>
            )}

            {/* Original Continue with BukSU Google button — now wired directly to Google (no modal) */}
            <Skeleton
              loading={isLoading}
              animate="shimmer"
              stagger={true}
              transition={true}
              fallback={
                <div className="space-y-3 animate-pulse py-2">
                  <div className="h-12 bg-slate-100 rounded-2xl w-full" />
                  <div className="h-4 bg-slate-100 rounded w-20 mx-auto" />
                </div>
              }
            >
              <div className="space-y-4">
                {hasGoogleConfig ? (
                  <>
                    <div className="relative w-full">
                      <button
                        type="button"
                        disabled={isLoading}
                        className="w-full h-12 bg-white hover:bg-[#FF7701]/5 text-[#2A1400] font-semibold rounded-xl border border-slate-200 hover:border-[#FF7701] focus:ring-2 focus:ring-[#FF7701]/20 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 text-xs sm:text-sm group"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#FF7701]" />
                        ) : (
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.87c2.26-2.09 3.675-5.17 3.675-9.12z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.24v3.12C3.26 21.36 7.35 24 12 24z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.27 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.61H1.24C.45 8.24 0 10.06 0 12s.45 3.76 1.24 5.39l4.03-3.12z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.24 6.61l4.03 3.12c.95-2.85 3.6-4.98 6.73-4.98z"
                            />
                          </svg>
                        )}
                        <span className="group-hover:text-[#FF7701] transition-colors">
                          {isLoading
                            ? "Signing In..."
                            : "Continue with BukSU Google"}
                        </span>
                      </button>
                      {/* Invisible GoogleLogin overlay — keeps 100% original button design while using real OAuth */}
                      <div
                        className={
                          isLoading || (hasRecaptchaConfig && !recaptchaToken)
                            ? "absolute inset-0 opacity-0 pointer-events-none overflow-hidden"
                            : "absolute inset-0 opacity-0 overflow-hidden"
                        }
                      >
                        <div className="w-full h-full [&>div]:w-full [&>div]:h-full [&_iframe]:!w-full [&_iframe]:!h-full">
                          <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap={false}
                            theme="outline"
                            size="large"
                            width="400"
                            text="continue_with"
                            shape="pill"
                            logo_alignment="left"
                          />
                        </div>
                      </div>
                    </div>
                    {/* reCAPTCHA — now BELOW the Continue button per request */}
                    {hasRecaptchaConfig && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex justify-center w-full">
                          <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={RECAPTCHA_SITE_KEY!}
                            onChange={(token) => {
                              setRecaptchaToken(token);
                              setGoogleError(null);
                              setError(null);
                            }}
                            onExpired={() => setRecaptchaToken(null)}
                            onErrored={() => setRecaptchaToken(null)}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <div className="font-bold flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Google Client ID not configured
                    </div>
                    <p className="mt-1 leading-relaxed">
                      Set{" "}
                      <code className="bg-white px-1 py-0.5 rounded border text-[11px]">
                        VITE_GOOGLE_CLIENT_ID
                      </code>{" "}
                      in{" "}
                      <code className="bg-white px-1 py-0.5 rounded border text-[11px]">
                        client/.env
                      </code>{" "}
                      to enable Google sign-in.
                    </p>
                  </div>
                )}
              </div>
            </Skeleton>

            {/* Footer Navigation - Google Auth only, no password reset */}
            <div className="mt-5 border-t pt-5 border-slate-200/70 sm:mt-6 flex items-center justify-center text-xs font-semibold gap-2">
              <Link to="/register" className="text-slate-500">
                Need an account?{" "}
                <span className="text-[#073474] hover:text-[#FF7701] underline underline-offset-2">
                  Register
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Errors (hook + Google + reCAPTCHA) → common bottom-right toast */}
      <ErrorToast
        message={popupMessage}
        title="Authentication Error"
        variant="error"
        durationMs={5000}
        onDismiss={dismissPopup}
      />
    </div>
  );
}
