import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  StudentInfo,
  PrintingOptions,
  UploadedDocument,
  PrintingRequestRecord,
} from '../services/printingService';
import {
  submitPrintingRequest,
  getPrintingRequestByCodeAndVerifier,
  getPrintingRequestFromServer,
} from '../services/printingService';

export const DEPARTMENTS = [
  'IT/EMC Department',
  'Electronics Department',
  'Food Technology Department',
  'Automotive Department',
] as const;

export const YEAR_LEVELS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
  'Graduate',
] as const;

export const ACCEPTED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.jpg',
  '.jpeg',
  '.png',
];

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export function useStudentRequest() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'track' ? 'track' : 'request';

  const [activeTab, setActiveTab] = useState<'request' | 'track'>(initialTab);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    fullName: '',
    studentId: '',
    department: '',
    yearLevel: '1st Year',
    email: '',
    confirmEmail: '',
  });
  const [infoConfirmed, setInfoConfirmed] = useState(false);

  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [options, setOptions] = useState<PrintingOptions>({
    paperSize: 'A4',
    colorMode: 'bw',
    printSides: 'single',
    copies: 1,
    pageSelection: 'all',
    pageRange: '',
    additionalInstructions: '',
  });

  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<PrintingRequestRecord | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Step 1 Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tracker State
  const [trackCode, setTrackCode] = useState('');
  const [trackVerifier, setTrackVerifier] = useState('');
  const [trackResult, setTrackResult] = useState<PrintingRequestRecord | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // ------------------ Step 1 Validation ------------------
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!studentInfo.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!studentInfo.studentId.trim()) newErrors.studentId = 'Student ID is required.';
    if (!studentInfo.department) newErrors.department = 'Please select your department.';
    if (!studentInfo.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentInfo.email)) {
      newErrors.email = 'Please provide a valid email address.';
    }
    if (!studentInfo.confirmEmail.trim()) {
      newErrors.confirmEmail = 'Please confirm your email address.';
    } else if (studentInfo.email.toLowerCase() !== studentInfo.confirmEmail.toLowerCase()) {
      newErrors.confirmEmail = 'Email addresses do not match.';
    }
    if (!infoConfirmed) {
      newErrors.infoConfirmed = 'You must confirm that the information is correct.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ------------------ Step 2: File Handling ------------------
  const handleFileSelection = (file: File) => {
    setFileError(null);
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setFileError(
        `Unsupported file type (${extension}). Please upload PDF, Word, PowerPoint, Excel, or Image files.`
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 25 MB limit. Please compress or optimize the file.`
      );
      return;
    }

    setDocument({
      file,
      name: file.name,
      size: file.size,
      type: file.type || 'Document',
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleNextStep2 = () => {
    if (!document) {
      setFileError('Please upload a document to proceed with printing.');
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ------------------ Step 3: Printing Options ------------------
  const handleNextStep3 = () => {
    if (options.pageSelection === 'specific' && !options.pageRange?.trim()) {
      setErrors({ pageRange: 'Please specify the page range (e.g., 1-5, 8, 10-12).' });
      return;
    }
    setErrors({});
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ------------------ Step 4: Submission ------------------
  const handleSubmitRequest = async () => {
    if (!reviewConfirmed || isSubmitting || !document) return;
    setIsSubmitting(true);
    try {
      const record = await submitPrintingRequest(studentInfo, document, options);
      setSubmittedRecord(record);
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('Something went wrong while submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setDocument(null);
    setSubmittedRecord(null);
    setInfoConfirmed(false);
    setReviewConfirmed(false);
  };

  // ------------------ Tracking Lookup (server first, then local fallback) ------------------
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    if (!trackCode.trim() || !trackVerifier.trim()) {
      setTrackError('Please provide both the Request Code and your Email or Student ID.');
      return;
    }

    // try server (MongoDB) first
    const serverMatch = await getPrintingRequestFromServer(trackCode, trackVerifier);
    if (serverMatch) {
      setTrackResult(serverMatch);
      setTrackError(null);
      return;
    }

    const match = getPrintingRequestByCodeAndVerifier(trackCode, trackVerifier);
    if (match) {
      setTrackResult(match);
      setTrackError(null);
    } else {
      setTrackResult(null);
      setTrackError(
        'No matching request found in MongoDB or local cache. Please verify that your Request Code and Email/Student ID are exact.'
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return {
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
    validateStep1,
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
  };
}
