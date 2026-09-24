import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Printer,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Info,
  ShieldCheck,
  Trash2,
  Search,
  Menu,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import SBOLogo from "../../assets/sbo.png";
import type { PrintingTimelineStep } from "../../services/printingService";
import {
  useStudentRequest,
  DEPARTMENTS,
  YEAR_LEVELS,
} from "../../hooks/useStudentRequest";

export default function StudentRequestPage() {
  const {
    activeTab,
    setActiveTab,
    currentStep,
    setCurrentStep,
    studentInfo,
    setStudentInfo,
    infoConfirmed,
    setInfoConfirmed,
    document,
    setDocument,
    fileError,
    isDragging,
    setIsDragging,
    fileInputRef,
    options,
    setOptions,
    reviewConfirmed,
    setReviewConfirmed,
    isSubmitting,
    submittedRecord,
    copiedCode,
    errors,
    trackCode,
    setTrackCode,
    trackVerifier,
    setTrackVerifier,
    trackResult,
    trackError,
    handleNextStep1,
    handleFileSelection,
    handleDrop,
    handleNextStep2,
    handleNextStep3,
    handleSubmitRequest,
    handleCopyCode,
    resetForm,
    handleTrackSubmit,
    formatFileSize,
  } = useStudentRequest();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] w-full bg-[#FAFAF9] font-sans text-[#2A1400] flex flex-col selection:bg-[#FF7701]/20">
      {/* Main Header - similar to welcome page */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden">
              <img
                src={SBOLogo}
                alt="BukSU SBO Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-1">
                <span className="text-[17px] font-black tracking-tight text-[#0a469b]">
                  BukSU SBO
                </span>
                <span className="text-[17px] font-black tracking-tight text-slate-900">
                  Printing System
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 tracking-wide mt-0.5">
                Bukidnon State University
              </p>
            </div>
          </Link>

          {/* Desktop Mode Switcher - hidden on mobile, visible sm+ */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("request")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "request"
                  ? "bg-white text-[#0a469b] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-[#FF7701]" />
              <span>Submit Request</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("track")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "track"
                  ? "bg-white text-[#0a469b] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#FF7701]" />
              <span>Track Request</span>
            </button>
          </div>

          {/* Mobile hamburger - similar to welcome */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 shrink-0"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Mobile menu - mode switcher full width */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("request");
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "request"
                    ? "bg-white text-[#0a469b] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Printer className="w-3.5 h-3.5 text-[#FF7701] shrink-0" />
                <span>Submit</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("track");
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "track"
                    ? "bg-white text-[#0a469b] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Search className="w-3.5 h-3.5 text-[#FF7701] shrink-0" />
                <span>Track</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area - fully responsive */}
      <main className="flex-1 max-w-[1000px] w-full mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {activeTab === "track" ? (
          /* =========================================================
             TRACK REQUEST SECTION
             ========================================================= */
          <div className="max-w-[700px] mx-auto space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FFF1E6] flex items-center justify-center text-[#FF7701] shrink-0">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-black text-[#1A140B] leading-tight">
                    Track Printing Request
                  </h1>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Check the current status and pickup readiness of your
                    document
                  </p>
                </div>
              </div>

              <form onSubmit={handleTrackSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Request Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SBO-2026-00042"
                    value={trackCode}
                    onChange={(e) => setTrackCode(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a469b]/20 focus:border-[#0a469b] text-sm uppercase font-mono font-semibold"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Given to you upon request submission
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address or Student ID
                  </label>
                  <input
                    type="text"
                    placeholder="student@buksu.edu.ph or 2025-12345"
                    value={trackVerifier}
                    onChange={(e) => setTrackVerifier(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a469b]/20 focus:border-[#0a469b] text-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Used for privacy verification
                  </p>
                </div>

                {trackError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{trackError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#0a469b] hover:bg-[#052554] text-white font-bold rounded-xl text-sm shadow-sm flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Check Status
                </Button>
              </form>
            </div>

            {/* Tracking Result Card - responsive */}
            {trackResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs space-y-5 sm:space-y-6 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Request Code
                    </span>
                    <h2 className="text-lg sm:text-xl font-mono font-black text-[#0a469b] break-all">
                      {trackResult.requestCode}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                        trackResult.status === "READY_FOR_CLAIM"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : trackResult.status === "COMPLETED"
                            ? "bg-slate-100 text-slate-700 border-slate-300"
                            : trackResult.status === "PRINTING" ||
                                trackResult.status === "PROCESSING"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : trackResult.status === "REJECTED"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {trackResult.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Status Guidance Banner */}
                {trackResult.status === "READY_FOR_CLAIM" && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="block text-sm font-bold text-emerald-900 mb-0.5">
                        Your prints are ready for pickup!
                      </strong>
                      Please visit the COT SBO Desk, show your Request Code{" "}
                      <strong>{trackResult.requestCode}</strong>, and present
                      your student ID.
                    </div>
                  </div>
                )}

                {trackResult.status === "REJECTED" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="block text-sm font-bold text-red-900 mb-0.5">
                        Request Could Not Be Processed
                      </strong>
                      Reason:{" "}
                      {trackResult.rejectionReason ||
                        "Please contact SBO office for clarification."}
                    </div>
                  </div>
                )}

                {/* Document & Specs Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-medium">
                      Student Name:
                    </span>
                    <p className="font-bold text-slate-800">
                      {trackResult.student.fullName}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">
                      Department:
                    </span>
                    <p className="font-bold text-slate-800">
                      {trackResult.student.department ||
                        "College of Technologies"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">
                      Document:
                    </span>
                    <p className="font-bold text-slate-800 truncate">
                      {trackResult.document.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">
                      Specifications:
                    </span>
                    <p className="font-bold text-slate-800">
                      {trackResult.options.paperSize} •{" "}
                      {trackResult.options.colorMode === "color"
                        ? "Colored"
                        : "Black & White"}{" "}
                      •{" "}
                      {trackResult.options.printSides === "double"
                        ? "Double-sided"
                        : "Single-sided"}{" "}
                      • {trackResult.options.copies}{" "}
                      {trackResult.options.copies === 1 ? "copy" : "copies"}
                    </p>
                  </div>
                </div>

                {/* Visual Timeline */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    Progress Timeline
                  </h3>
                  <div className="space-y-3">
                    {trackResult.timeline.map(
                      (step: PrintingTimelineStep, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ${
                              step.completed
                                ? "bg-emerald-500 text-white"
                                : step.current
                                  ? "bg-[#0a469b] text-white ring-4 ring-blue-100"
                                  : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {step.completed ? "✓" : idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs">
                              <span
                                className={`font-bold ${step.completed || step.current ? "text-slate-900" : "text-slate-400"}`}
                              >
                                {step.title}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {step.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* =========================================================
             MULTI-STEP PRINTING REQUEST FORM
             ========================================================= */
          <div className="space-y-6">
            {/* Stepper Progress Bar (Only show if not on step 5) - responsive */}
            {currentStep < 5 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-5 shadow-xs overflow-hidden">
                <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center">
                  {[
                    { step: 1, label: "Student Info", short: "Info" },
                    { step: 2, label: "Upload Document", short: "Upload" },
                    { step: 3, label: "Print Options", short: "Options" },
                    { step: 4, label: "Review Request", short: "Review" },
                  ].map((s) => {
                    const isPassed = currentStep > s.step;
                    const isCurrent = currentStep === s.step;
                    return (
                      <div
                        key={s.step}
                        className="flex flex-col items-center min-w-0"
                      >
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold mb-1 sm:mb-1.5 transition-all shrink-0 ${
                            isPassed
                              ? "bg-emerald-500 text-white"
                              : isCurrent
                                ? "bg-[#0a469b] text-white ring-4 ring-[#0a469b]/15"
                                : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {isPassed ? (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          ) : (
                            s.step
                          )}
                        </div>
                        <span
                          className={`text-[9px] sm:text-[11px] font-semibold truncate max-w-full px-1 leading-tight ${
                            isCurrent
                              ? "text-[#0a469b] font-bold"
                              : isPassed
                                ? "text-slate-700"
                                : "text-slate-400"
                          }`}
                        >
                          <span className="hidden sm:inline">{s.label}</span>
                          <span className="sm:hidden">{s.short}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 1: Student Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs space-y-5 sm:space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#FF7701] bg-[#FFF1E6] px-2.5 py-0.5 rounded-full mb-1">
                    College of Technologies (COT)
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-[#1A140B]">
                    Step 1: Student Information
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                    No login or account needed. Please provide your student
                    details for pickup verification.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maria Santos Dela Cruz"
                      value={studentInfo.fullName}
                      onChange={(e) =>
                        setStudentInfo({
                          ...studentInfo,
                          fullName: e.target.value,
                        })
                      }
                      className={`w-full h-11 px-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        errors.fullName
                          ? "border-red-400 bg-red-50/30 focus:ring-red-200"
                          : "border-slate-300 focus:border-[#0a469b] focus:ring-[#0a469b]/15"
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Student ID */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Student ID Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2025-12345"
                      value={studentInfo.studentId}
                      onChange={(e) =>
                        setStudentInfo({
                          ...studentInfo,
                          studentId: e.target.value,
                        })
                      }
                      className={`w-full h-11 px-3.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 ${
                        errors.studentId
                          ? "border-red-400 bg-red-50/30 focus:ring-red-200"
                          : "border-slate-300 focus:border-[#0a469b] focus:ring-[#0a469b]/15"
                      }`}
                    />
                    {errors.studentId && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {errors.studentId}
                      </p>
                    )}
                  </div>

                  {/* Year Level */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Year Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={studentInfo.yearLevel}
                      onChange={(e) =>
                        setStudentInfo({
                          ...studentInfo,
                          yearLevel: e.target.value,
                        })
                      }
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:border-[#0a469b] focus:ring-2 focus:ring-[#0a469b]/15"
                    >
                      {YEAR_LEVELS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={studentInfo.department}
                      onChange={(e) =>
                        setStudentInfo({
                          ...studentInfo,
                          department: e.target.value,
                        })
                      }
                      className={`w-full h-11 px-3 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 ${
                        errors.department
                          ? "border-red-400 bg-red-50/30 focus:ring-red-200"
                          : "border-slate-300 focus:border-[#0a469b] focus:ring-[#0a469b]/15"
                      }`}
                    >
                      <option value="">-- Select Your Department --</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {errors.department}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. student@buksu.edu.ph"
                      value={studentInfo.email}
                      onChange={(e) =>
                        setStudentInfo({
                          ...studentInfo,
                          email: e.target.value,
                        })
                      }
                      className={`w-full h-11 px-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "border-red-400 bg-red-50/30 focus:ring-red-200"
                          : "border-slate-300 focus:border-[#0a469b] focus:ring-[#0a469b]/15"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Confirm Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Confirm Email Address{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Re-enter your email address"
                      value={studentInfo.confirmEmail}
                      onChange={(e) =>
                        setStudentInfo({
                          ...studentInfo,
                          confirmEmail: e.target.value,
                        })
                      }
                      className={`w-full h-11 px-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        errors.confirmEmail
                          ? "border-red-400 bg-red-50/30 focus:ring-red-200"
                          : "border-slate-300 focus:border-[#0a469b] focus:ring-[#0a469b]/15"
                      }`}
                    />
                    {errors.confirmEmail && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {errors.confirmEmail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Notice */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-amber-900 text-xs">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Make sure your email address is correct because important
                    request notifications (including your pickup alert) will be
                    sent there.
                  </span>
                </div>

                {/* Confirmation Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={infoConfirmed}
                      onChange={(e) => setInfoConfirmed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded text-[#0a469b] border-slate-300 focus:ring-[#0a469b]"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      I confirm that the information I provided is correct and
                      matches my University Student ID.
                    </span>
                  </label>
                  {errors.infoConfirmed && (
                    <p className="text-[11px] text-red-500 mt-1 pl-7">
                      {errors.infoConfirmed}
                    </p>
                  )}
                </div>

                {/* Navigation Buttons - responsive */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-slate-100">
                  <Link to="/" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto h-11 px-5 rounded-xl text-xs font-bold text-slate-600"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    onClick={handleNextStep1}
                    className="w-full sm:w-auto h-11 px-5 sm:px-6 bg-[#0a469b] hover:bg-[#052554] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span className="hidden sm:inline">
                      Next: Document Upload
                    </span>
                    <span className="sm:hidden">Next</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Document Upload */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs space-y-5 sm:space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg sm:text-xl font-black text-[#1A140B]">
                    Step 2: Upload Document
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                    Upload the exact document you want printed. Maximum file
                    size is 25 MB.
                  </p>
                </div>

                {/* Upload Zone - responsive */}
                {!document ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 lg:p-12 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-[#0a469b] bg-blue-50/50 scale-[0.99]"
                        : "border-slate-300 hover:border-[#0a469b]/50 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileSelection(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />

                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#0a469b] shadow-xs mb-3 sm:mb-4">
                      <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF7701]" />
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-800 px-2">
                      Drag & Drop Your File Here
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 px-2">
                      or click to browse from your device
                    </p>

                    <div className="mt-6 inline-block bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#0a469b] shadow-xs">
                      Choose File
                    </div>

                    <div className="mt-6 text-[11px] text-slate-400">
                      Supported formats:{" "}
                      <strong>
                        PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG
                      </strong>{" "}
                      (Max 25 MB)
                    </div>
                  </div>
                ) : (
                  /* Active File Card */
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0a469b] shrink-0 shadow-xs">
                          <FileText className="w-6 h-6 text-[#FF7701]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 truncate">
                            {document.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatFileSize(document.size)} •{" "}
                            {document.type || "Document"}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                        <Check className="w-3.5 h-3.5" /> Ready
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto h-9 px-3 rounded-xl text-xs font-bold text-slate-700 bg-white flex items-center justify-center"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1 text-[#FF7701] shrink-0" />
                        Replace File
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDocument(null)}
                        className="w-full sm:w-auto h-9 px-3 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 bg-white border-red-200 hover:bg-red-50 flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1 shrink-0" />
                        Remove File
                      </Button>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileSelection(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                  </div>
                )}

                {/* Error Banner */}
                {fileError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}

                {/* Notice */}
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#0a469b] shrink-0 mt-0.5" />
                  <span>
                    Your uploaded file is transmitted securely and organized
                    directly into the COT SBO student printing queue. Only
                    authorized staff members can view it for printing.
                  </span>
                </div>

                {/* Navigation Buttons - responsive */}
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto h-11 px-5 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep2}
                    className="w-full sm:w-auto h-11 px-5 sm:px-6 bg-[#0a469b] hover:bg-[#052554] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span className="hidden sm:inline">
                      Next: Printing Options
                    </span>
                    <span className="sm:hidden">Next</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Printing Options */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs space-y-5 sm:space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg sm:text-xl font-black text-[#1A140B]">
                    Step 3: Printing Options
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                    Specify how you want your document printed by the COT SBO
                    office.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Paper Size */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Paper Size
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["A4", "Letter", "Legal", "Other"] as const).map(
                        (size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() =>
                              setOptions({ ...options, paperSize: size })
                            }
                            className={`h-11 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                              options.paperSize === size
                                ? "border-[#0a469b] bg-[#0a469b] text-white shadow-xs"
                                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                            }`}
                          >
                            {size}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Color Mode */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Color Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOptions({ ...options, colorMode: "bw" })
                        }
                        className={`h-11 px-3 rounded-xl border text-xs font-bold transition-all ${
                          options.colorMode === "bw"
                            ? "border-[#0a469b] bg-[#0a469b] text-white shadow-xs"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        Black & White
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setOptions({ ...options, colorMode: "color" })
                        }
                        className={`h-11 px-3 rounded-xl border text-xs font-bold transition-all ${
                          options.colorMode === "color"
                            ? "border-[#0a469b] bg-[#0a469b] text-white shadow-xs"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        Colored
                      </button>
                    </div>
                  </div>

                  {/* Print Sides */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Print Sides
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOptions({ ...options, printSides: "single" })
                        }
                        className={`h-11 px-3 rounded-xl border text-xs font-bold transition-all ${
                          options.printSides === "single"
                            ? "border-[#0a469b] bg-[#0a469b] text-white shadow-xs"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        Single-sided
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setOptions({ ...options, printSides: "double" })
                        }
                        className={`h-11 px-3 rounded-xl border text-xs font-bold transition-all ${
                          options.printSides === "double"
                            ? "border-[#0a469b] bg-[#0a469b] text-white shadow-xs"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        Double-sided
                      </button>
                    </div>
                  </div>

                  {/* Copies Stepper */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Number of Copies
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setOptions({
                            ...options,
                            copies: Math.max(1, options.copies - 1),
                          })
                        }
                        className="w-11 h-11 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-lg flex items-center justify-center"
                      >
                        -
                      </button>
                      <div className="flex-1 h-11 rounded-xl border border-slate-300 bg-white flex items-center justify-center font-mono font-bold text-base text-slate-800">
                        {options.copies}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setOptions({
                            ...options,
                            copies: Math.min(50, options.copies + 1),
                          })
                        }
                        className="w-11 h-11 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-lg flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pages to Print */}
                  <div className="sm:col-span-2 space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Pages to Print
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="radio"
                          name="pageSelection"
                          checked={options.pageSelection === "all"}
                          onChange={() =>
                            setOptions({ ...options, pageSelection: "all" })
                          }
                          className="h-4 w-4 text-[#0a469b]"
                        />
                        <span>All Pages</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="radio"
                          name="pageSelection"
                          checked={options.pageSelection === "specific"}
                          onChange={() =>
                            setOptions({
                              ...options,
                              pageSelection: "specific",
                            })
                          }
                          className="h-4 w-4 text-[#0a469b]"
                        />
                        <span>Specific Pages</span>
                      </label>
                    </div>

                    {options.pageSelection === "specific" && (
                      <div>
                        <input
                          type="text"
                          placeholder="e.g. 1-5, 8, 10-12"
                          value={options.pageRange || ""}
                          onChange={(e) =>
                            setOptions({
                              ...options,
                              pageRange: e.target.value,
                            })
                          }
                          className={`w-full h-11 px-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                            errors.pageRange
                              ? "border-red-400 bg-red-50/30 focus:ring-red-200"
                              : "border-slate-300 focus:border-[#0a469b] focus:ring-[#0a469b]/15"
                          }`}
                        />
                        {errors.pageRange && (
                          <p className="text-[11px] text-red-500 mt-1">
                            {errors.pageRange}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1">
                          Specify comma-separated pages or page ranges.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Additional Instructions */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Additional Instructions{" "}
                      <span className="text-slate-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Please staple top-left corner, or handle cover page carefully."
                      value={options.additionalInstructions || ""}
                      onChange={(e) =>
                        setOptions({
                          ...options,
                          additionalInstructions: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0a469b] focus:ring-2 focus:ring-[#0a469b]/15"
                    />
                  </div>
                </div>

                {/* Navigation Buttons - responsive */}
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="w-full sm:w-auto h-11 px-5 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep3}
                    className="w-full sm:w-auto h-11 px-5 sm:px-6 bg-[#0a469b] hover:bg-[#052554] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span className="hidden sm:inline">
                      Next: Review Request
                    </span>
                    <span className="sm:hidden">Next</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Review Request */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs space-y-5 sm:space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg sm:text-xl font-black text-[#1A140B]">
                    Step 4: Review Your Request
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                    Please review all your information and printing instructions
                    before final submission.
                  </p>
                </div>

                {/* Section 1: Student Information */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0a469b]">
                      Student Information
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-bold text-[#FF7701] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Name:</span>{" "}
                      <strong className="text-slate-900">
                        {studentInfo.fullName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Student ID:</span>{" "}
                      <strong className="text-slate-900 font-mono">
                        {studentInfo.studentId}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Department:</span>{" "}
                      <strong className="text-slate-900">
                        {studentInfo.department}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Year Level:</span>{" "}
                      <strong className="text-slate-900">
                        {studentInfo.yearLevel}
                      </strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">Email Address:</span>{" "}
                      <strong className="text-slate-900">
                        {studentInfo.email}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Section 2: Document */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0a469b]">
                      Document
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-[#FF7701] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Document Name:</span>
                      <p className="font-bold text-slate-900 truncate mt-0.5">
                        {document?.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">File Type:</span>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {document?.type || "Document"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">File Size:</span>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {document ? formatFileSize(document.size) : "0 B"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Printing Options */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0a469b]">
                      Printing Specifications
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs font-bold text-[#FF7701] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Paper Size:</span>
                      <p className="font-bold text-slate-900">
                        {options.paperSize}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Color:</span>
                      <p className="font-bold text-slate-900">
                        {options.colorMode === "color"
                          ? "Colored"
                          : "Black & White"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Sides:</span>
                      <p className="font-bold text-slate-900">
                        {options.printSides === "single"
                          ? "Single-sided"
                          : "Double-sided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Copies:</span>
                      <p className="font-bold text-slate-900 font-mono">
                        {options.copies}
                      </p>
                    </div>
                    <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                      <span className="text-slate-500">Pages:</span>
                      <p className="font-bold text-slate-900 break-words">
                        {options.pageSelection === "all"
                          ? "All Pages"
                          : `Specific Pages: ${options.pageRange}`}
                      </p>
                    </div>
                    {options.additionalInstructions && (
                      <div className="col-span-1 sm:col-span-2 lg:col-span-4 pt-1">
                        <span className="text-slate-500">Instructions:</span>
                        <p className="font-medium text-slate-800 italic">
                          "{options.additionalInstructions}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Confirmation Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reviewConfirmed}
                      onChange={(e) => setReviewConfirmed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded text-[#0a469b] border-slate-300 focus:ring-[#0a469b]"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      I have reviewed my request and confirm that all
                      information and printing instructions are correct.
                    </span>
                  </label>
                </div>

                {/* Navigation Buttons - responsive */}
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto h-11 px-5 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmitRequest}
                    disabled={!reviewConfirmed || isSubmitting}
                    className="w-full sm:w-auto h-11 px-5 sm:px-7 bg-[#FF7701] hover:bg-[#E66A00] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#FF7701]/20 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                        <span className="hidden sm:inline">
                          Submitting Request...
                        </span>
                        <span className="sm:hidden">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Printer className="w-4 h-4 shrink-0" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Success & Confirmation Page - responsive */}
            {currentStep === 5 && submittedRecord && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-[650px] mx-auto bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs text-center space-y-5 sm:space-y-6 overflow-hidden"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>

                <div className="px-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Status: PENDING REVIEW
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#1A140B] leading-tight">
                    REQUEST SUBMITTED SUCCESSFULLY
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-[42ch] mx-auto leading-relaxed">
                    Your printing request has been received by the COT SBO
                    office and placed in the processing queue.
                  </p>
                </div>

                {/* Prominent Request Code Box - responsive, prevents overflow */}
                <div className="bg-[#0a469b] text-white rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#FF7701]">
                    Your Unique Request Code
                  </span>
                  <div className="text-2xl min-[375px]:text-3xl sm:text-4xl font-mono font-black tracking-wide sm:tracking-wider my-2 break-all px-2">
                    {submittedRecord.requestCode}
                  </div>
                  <p className="text-xs text-blue-100 max-w-[40ch] mx-auto">
                    Present this code at the COT SBO Office counter when
                    claiming your printed documents.
                  </p>

                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyCode(submittedRecord.requestCode)
                      }
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/20 transition-colors"
                    >
                      {copiedCode ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>
                        {copiedCode
                          ? "Copied to Clipboard!"
                          : "Copy Request Code"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Summary Metadata */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <strong className="text-slate-900">
                      {submittedRecord.student.department}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Document:</span>
                    <strong className="text-slate-900 truncate max-w-[200px]">
                      {submittedRecord.document.name}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Copies:</span>
                    <strong className="text-slate-900 font-mono">
                      {submittedRecord.options.copies}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Confirmation Sent To:
                    </span>
                    <strong className="text-slate-900">
                      {submittedRecord.student.email}
                    </strong>
                  </div>
                </div>

                {/* Important Next Steps */}
                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-left text-xs text-amber-950 space-y-1.5">
                  <strong className="block text-sm font-bold text-amber-900">
                    📌 Important Claiming Instructions:
                  </strong>
                  <p>
                    1. Please check your email for the official submission
                    confirmation.
                  </p>
                  <p>
                    2. Wait until you receive our{" "}
                    <strong>"Ready for Claim"</strong> email before going to the
                    COT SBO office.
                  </p>
                  <p>
                    3. Bring your <strong>Valid Student ID</strong> and mention
                    code <strong>{submittedRecord.requestCode}</strong> at the
                    counter.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1 h-11 rounded-xl text-xs font-bold text-slate-700"
                  >
                    Submit Another Request
                  </Button>
                  <Link to="/" className="flex-1">
                    <Button className="w-full h-11 bg-[#0a469b] hover:bg-[#052554] text-white rounded-xl text-xs font-bold">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} Bukidnon State University • College of
            Technologies SBO. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
            <Link to="/" className="hover:text-[#0a469b]">
              Home
            </Link>
            <button
              type="button"
              onClick={() => setActiveTab("track")}
              className="hover:text-[#0a469b]"
            >
              Track Request
            </button>
            <Link to="/login" className="hover:text-[#0a469b]">
              Staff Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
