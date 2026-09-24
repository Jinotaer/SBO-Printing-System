import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  Printer,
  Search,
  ShieldCheck,
  Clock,
  FileText,
  Copy,
  Layers,
  Palette,
  Hash,
  MessageSquare,
  Menu,
  X,
  LogIn,
} from "lucide-react";
import { Button } from "../components/ui/button";
import SBOLogo from "../assets/sbo.png";
import heroIllustration from "../assets/1.png";

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const [trackQuery, setTrackQuery] = useState("");
  const [trackError, setTrackError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) {
      setTrackError("Please enter your request code.");
      return;
    }
    setTrackError(null);
    navigate(
      `/request?tab=track&code=${encodeURIComponent(trackQuery.trim())}`,
    );
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#FCFCFB] font-sans text-[#1A140B] flex flex-col selection:bg-[#FF7701]/20 selection:text-[#1A140B] overflow-x-hidden">
      {/* Header - fixed, always stuck to top */}
      <header className="fixed top-0 inset-x-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden">
              <img
                src={SBOLogo}
                alt="COT SBO Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-1">
                <span className="text-[17px] font-black tracking-tight text-[#073474]">
                  COT SBO
                </span>
                <span className="text-[17px] font-black tracking-tight text-[#FF7701]">
                  Printing System
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 tracking-wide mt-0.5">
                Bukidnon State University
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-slate-600">
            <a
              href="#how-it-works"
              className="hover:text-[#073474] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#guidelines"
              className="hover:text-[#073474] transition-colors"
            >
              Guidelines
            </a>
            <a
              href="#track"
              className="hover:text-[#073474] transition-colors inline-flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-[#073474]" />
              Track Request
            </a>
          </nav>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link to="/login">
              <Button
                type="button"
                className="h-9 px-4 bg-white hover:bg-slate-50 text-[#073474] text-[13px] font-bold rounded-xl border border-slate-200 shadow-sm flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Admin Sign In
              </Button>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-semibold text-slate-700 py-2"
            >
              How It Works
            </a>
            <a
              href="#guidelines"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-semibold text-slate-700 py-2"
            >
              Guidelines
            </a>
            <a
              href="#track"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-semibold text-slate-700 py-2"
            >
              Track Request
            </a>
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block"
            >
              <Button className="w-full h-10 bg-[#073474] text-white font-bold rounded-xl">
                Admin Sign In
              </Button>
            </Link>
          </div>
        )}
      </header>
      {/* Spacer for fixed header - keeps content below nav */}
      <div className="h-16 shrink-0" aria-hidden="true" />

      {/* Hero - exact same shape, position, and 50/50 split as login page */}
      <section className="relative w-full bg-[#FCFCFB] overflow-hidden border-b border-slate-100">
        <div className="w-full flex flex-col lg:flex-row items-center">
          {/* ======================================================== */}
          {/* LEFT HALF: Deep Navy Organic Wave & Adaptive Illustration */}
          {/* Exactly matching loginAdmin.tsx                          */}
          {/* ======================================================== */}
          <div className="w-full lg:w-1/2 h-[320px] sm:h-[380px] md:h-[460px] lg:min-h-[560px] xl:min-h-[620px] relative bg-white flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 lg:p-10 shrink-0 overflow-hidden select-none">
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
                    id="waveGradFullWelcome"
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
                  fill="url(#waveGradFullWelcome)"
                />
              </svg>
            </div>

            {/* Center Vector Desk Illustration (Responsive Scaling) - increased for tablet/mobile */}
            <div className="relative z-10 my-auto py-2 sm:py-3 flex items-center justify-center w-full flex-1 min-h-0">
              <div className="relative w-full h-full max-w-[340px] sm:max-w-[440px] md:max-w-[560px] lg:max-w-[580px] xl:max-w-[660px] flex items-center justify-center">
                <img
                  src={heroIllustration}
                  alt="COT SBO Illustration"
                  className="w-full h-full max-h-[36vh] sm:max-h-[46vh] md:max-h-[52vh] lg:max-h-[480px] xl:max-h-[530px] object-contain transition-transform duration-500 hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT HALF: Content Panel                                */}
          {/* ======================================================== */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-10 lg:py-16">
            <div className="w-full max-w-xl flex flex-col gap-4 sm:gap-5">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-[30px] min-[375px]:text-4xl sm:text-[44px] lg:text-[44px] xl:text-[48px] font-black tracking-tighter leading-[0.95] text-[#0F172A]">
                  Academic printing
                  <br />
                  <span className="text-[#0a469b]">made simple</span>
                </h1>
                <p className="text-[14px] sm:text-[15px] leading-relaxed text-slate-600 max-w-[48ch] font-medium">
                  Submit your document online, choose your printing preferences,
                  and pick it up at the COT SBO desk once it is ready.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link to="/request" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-11 px-6 bg-[#FF7701] hover:bg-[#E66A00] text-white font-bold text-[14px] rounded-xl shadow-md shadow-[#FF7701]/20 flex items-center justify-center gap-2">
                    <Printer className="w-4 h-4" />
                    Submit a Print Request
                  </Button>
                </Link>
                <Link to="/request?tab=track" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-11 px-6 bg-white hover:bg-slate-50 text-[#073474] font-bold text-[14px] rounded-xl border border-slate-200 flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4 text-[#073474]" />
                    Track Request
                  </Button>
                </Link>
              </div>

              <p className="flex items-center gap-2 text-[12px] sm:text-xs font-medium text-slate-500">
                <ShieldCheck className="w-4 h-4 text-[#0EA37A] shrink-0" />
                No account required. Submit your document directly online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 4 steps, distinct from hero, with dotted paths between steps */}
      <section
        id="how-it-works"
        className="w-full py-14 lg:py-16 bg-white border-t border-slate-200 scroll-mt-20"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#0F172A] leading-none">
              How It Works
            </h2>
            <p className="text-[14px] leading-relaxed text-slate-600 font-medium mt-3 max-w-[56ch]">
              Four simple steps from upload to pickup. No queues, no confusion.
            </p>
          </div>

          <div className="relative mt-10">
            {/* Dotted connector - desktop only, subtle */}
            <div
              className="hidden lg:block absolute top-[32px] left-[12%] right-[12%] h-px pointer-events-none"
              aria-hidden="true"
            >
              <svg
                className="w-full h-[40px]"
                viewBox="0 0 800 40"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 20 C 200 0 400 40 800 20"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 relative">
              {[
                {
                  n: "01",
                  title: "Submit Your Request",
                  body: "Upload your document and enter your printing preferences.",
                  icon: FileText,
                },
                {
                  n: "02",
                  title: "We Process It",
                  body: "The SBO team reviews and processes your printing request.",
                  icon: Layers,
                },
                {
                  n: "03",
                  title: "Get Notified",
                  body: "Receive an email when your document is ready for pickup.",
                  icon: Clock,
                },
                {
                  n: "04",
                  title: "Pick Up Your Document",
                  body: "Claim your printed document at the COT SBO desk.",
                  icon: Search,
                },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <Reveal key={step.n} delay={i * 0.08}>
                    <div className="relative bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#073474] text-white flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-mono font-bold tracking-widest text-[#FF7701]">
                          {step.n}
                        </span>
                      </div>
                      <h3 className="text-[15px] font-bold text-[#0F172A] leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-[13px] leading-relaxed text-slate-500 font-medium mt-2 flex-1">
                        {step.body}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Guidelines - card grid, not 3-equal feature row repetition */}
      <section id="guidelines" className="w-full py-14 lg:py-16 bg-[#FCFCFB]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#0F172A] leading-none">
              Printing Guidelines
            </h2>
            <p className="text-[14px] leading-relaxed text-slate-600 font-medium mt-3">
              Everything you need to prepare your file for the SBO printer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <Reveal delay={0}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-full">
                <div className="w-9 h-9 rounded-xl bg-[#EBEFF8] flex items-center justify-center text-[#073474] mb-3">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-[13px] font-bold text-[#0F172A]">
                  Accepted Documents
                </h3>
                <p className="text-[13px] leading-relaxed text-slate-500 font-medium mt-1">
                  PDF and other supported document formats.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-full">
                <div className="w-9 h-9 rounded-xl bg-[#EBEFF8] flex items-center justify-center text-[#073474] mb-3">
                  <Copy className="w-4 h-4" />
                </div>
                <h3 className="text-[13px] font-bold text-[#0F172A]">
                  Paper Size
                </h3>
                <p className="text-[13px] leading-relaxed text-slate-500 font-medium mt-1">
                  A4, Letter, Legal, and other available sizes.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-full">
                <div className="w-9 h-9 rounded-xl bg-[#FFF1E6] flex items-center justify-center text-[#FF7701] mb-3">
                  <Palette className="w-4 h-4" />
                </div>
                <h3 className="text-[13px] font-bold text-[#0F172A]">
                  Printing Options
                </h3>
                <p className="text-[13px] leading-relaxed text-slate-500 font-medium mt-1">
                  Black and White or Colored.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-full">
                <div className="w-9 h-9 rounded-xl bg-[#EBEFF8] flex items-center justify-center text-[#073474] mb-3">
                  <Hash className="w-4 h-4" />
                </div>
                <h3 className="text-[13px] font-bold text-[#0F172A]">Pages</h3>
                <p className="text-[13px] leading-relaxed text-slate-500 font-medium mt-1">
                  Print all pages or specify selected pages.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-full">
                <div className="w-9 h-9 rounded-xl bg-[#EBEFF8] flex items-center justify-center text-[#073474] mb-3">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-[13px] font-bold text-[#0F172A]">Copies</h3>
                <p className="text-[13px] leading-relaxed text-slate-500 font-medium mt-1">
                  Specify the number of copies needed.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-full">
                <div className="w-9 h-9 rounded-xl bg-[#FFF1E6] flex items-center justify-center text-[#FF7701] mb-3">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-[13px] font-bold text-[#0F172A]">
                  Instructions
                </h3>
                <p className="text-[13px] leading-relaxed text-slate-500 font-medium mt-1">
                  Add additional printing instructions when necessary.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Track Request - distinct organic shape behind */}
      <section
        id="track"
        className="relative w-full py-12 lg:py-16 bg-white border-t border-slate-200 overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -right-[10%] top-[-20%] w-[55%] h-[140%] hidden lg:block">
            <svg
              viewBox="0 0 600 400"
              className="w-full h-full"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M 80 0 L 600 0 L 600 400 L 0 400 C 40 320 60 220 120 160 C 180 100 40 40 80 0 Z"
                fill="#073474"
                opacity="0.96"
              />
            </svg>
          </div>
          <svg
            className="absolute right-[18%] top-[18%] w-[320px] h-[140px] hidden lg:block"
            viewBox="0 0 320 140"
            fill="none"
          >
            <path
              d="M 10 100 C 100 10 200 10 300 40"
              stroke="white"
              strokeWidth="1.5"
              strokeDasharray="7 8"
              strokeLinecap="round"
              opacity="0.35"
            />
          </svg>
          <svg
            className="absolute right-[22%] top-[52%] w-[260px] h-[120px] hidden lg:block"
            viewBox="0 0 260 120"
            fill="none"
          >
            <path
              d="M 10 20 C 80 70 160 90 240 30"
              stroke="#0EA37A"
              strokeWidth="1.8"
              strokeDasharray="6 10"
              strokeLinecap="round"
              opacity="0.9"
            />
          </svg>
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <h2 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#0F172A] leading-none">
                Track Your Request
              </h2>
              <p className="text-[14px] leading-relaxed text-slate-600 font-medium mt-3 max-w-[42ch]">
                Already submitted a request? Check its current status using your
                request code.
              </p>
            </div>

            <div className="lg:col-span-7">
              <form
                onSubmit={handleTrackSubmit}
                className="bg-white rounded-2xl border border-slate-200 p-2 flex items-center gap-2 shadow-sm focus-within:border-[#073474] focus-within:ring-2 focus-within:ring-[#073474]/10 transition-all"
              >
                <div className="pl-3 text-slate-400 hidden sm:block">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Enter request code  SBO-2026-00042"
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#0F172A] placeholder:text-slate-400 font-medium px-2 sm:px-1 h-10"
                  aria-label="Request code"
                />
                <Button
                  type="submit"
                  className="h-10 px-5 bg-[#073474] hover:bg-[#052655] text-white text-[13px] font-bold rounded-xl shrink-0"
                >
                  Track Request
                </Button>
              </form>
              {trackError && (
                <p
                  className="text-xs text-red-600 mt-2 font-medium"
                  role="alert"
                >
                  {trackError}
                </p>
              )}
              <p className="text-[11px] text-slate-400 font-medium mt-2">
                Example: SBO-2026-00042 • You received this code after
                submission
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - simple, single theme */}
      <footer className="w-full bg-[#FCFCFB] border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src={SBOLogo}
                alt="SBO Logo"
                className="w-8 h-8 object-contain"
              />
              <div>
                <p className="text-xs font-bold text-[#0F172A] leading-none">
                  COT SBO Printing System
                </p>
                <p className="text-[11px] font-medium text-slate-500">
                  Bukidnon State University • COT SBO Printing Service • ©{" "}
                  {new Date().getFullYear()}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-600">
              <a
                href="#how-it-works"
                className="hover:text-[#073474] transition-colors"
              >
                How It Works
              </a>
              <a
                href="#guidelines"
                className="hover:text-[#073474] transition-colors"
              >
                Guidelines
              </a>
              <a
                href="#track"
                className="hover:text-[#073474] transition-colors"
              >
                Track Request
              </a>
              <Link
                to="/login"
                className="hover:text-[#073474] transition-colors"
              >
                Admin Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
