export interface StudentInfo {
  fullName: string;
  studentId: string;
  department: string;
  yearLevel: string;
  email: string;
  confirmEmail: string;
}

export interface PrintingOptions {
  paperSize: 'A4' | 'Letter' | 'Legal' | 'Other';
  colorMode: 'bw' | 'color';
  printSides: 'single' | 'double';
  copies: number;
  pageSelection: 'all' | 'specific';
  pageRange?: string;
  additionalInstructions?: string;
}

export interface UploadedDocument {
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

export type RequestStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'PRINTING'
  | 'READY_FOR_CLAIM'
  | 'COMPLETED'
  | 'REJECTED';

export interface PrintingTimelineStep {
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
}

export interface PrintingRequestRecord {
  requestCode: string;
  student: Omit<StudentInfo, 'confirmEmail'>;
  document: {
    name: string;
    size: number;
    type: string;
  };
  options: PrintingOptions;
  status: RequestStatus;
  rejectionReason?: string;
  submittedAt: string;
  updatedAt: string;
  timeline: PrintingTimelineStep[];
}

const STORAGE_KEY = 'sbo_printing_requests_vault';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function generateRequestCode(): string {
  const year = new Date().getFullYear();
  const counterKey = `sbo_code_seq_${year}`;
  let seq = 42;
  try {
    const saved = localStorage.getItem(counterKey);
    seq = saved ? parseInt(saved, 10) + 1 : 42;
    localStorage.setItem(counterKey, seq.toString());
  } catch {
    seq = Math.floor(1000 + Math.random() * 9000);
  }
  const padded = seq.toString().padStart(5, '0');
  return `SBO-${year}-${padded}`;
}

function toRecordFromServer(data: any): PrintingRequestRecord {
  const nowFormatted = new Date(data.createdAt || Date.now()).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const status = (data.status as RequestStatus) || 'PENDING';
  const submittedAt = data.createdAt
    ? new Date(data.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : nowFormatted;
  return {
    requestCode: data.requestCode,
    student: {
      fullName: data.student.fullName,
      studentId: data.student.studentId,
      department: data.student.department,
      yearLevel: data.student.yearLevel,
      email: data.student.email,
    },
    document: {
      name: data.document.originalName || data.document.name,
      size: data.document.sizeBytes || data.document.size,
      type: data.document.mimeType || data.document.type,
    },
    options: {
      paperSize: data.options.paperSize,
      colorMode: data.options.colorMode,
      printSides: data.options.printSides,
      copies: data.options.copies,
      pageSelection: data.options.pageSelection,
      pageRange: data.options.pageRange,
      additionalInstructions: data.options.additionalInstructions,
    },
    status,
    rejectionReason: data.rejectionReason,
    submittedAt,
    updatedAt: submittedAt,
    timeline: [
      {
        title: 'Request Submitted',
        description: 'Received online and placed in queue.',
        timestamp: submittedAt,
        completed: true,
      },
      {
        title: 'Staff Processing',
        description: 'Staff reviews documents and prepares queue.',
        timestamp: status === 'PENDING' ? 'Pending review' : submittedAt,
        completed: ['PROCESSING', 'PRINTING', 'READY_FOR_CLAIM', 'COMPLETED'].includes(status),
        current: status === 'PROCESSING',
      },
      {
        title: 'Printing Document',
        description: 'Sent to physical printer.',
        timestamp: 'Pending',
        completed: ['PRINTING', 'READY_FOR_CLAIM', 'COMPLETED'].includes(status),
        current: status === 'PRINTING',
      },
      {
        title: 'Ready for Claim',
        description: 'Document ready at SBO office.',
        timestamp: 'Pending',
        completed: ['READY_FOR_CLAIM', 'COMPLETED'].includes(status),
        current: status === 'READY_FOR_CLAIM',
      },
      {
        title: 'Completed',
        description: 'Student claimed printed document.',
        timestamp: 'Pending',
        completed: status === 'COMPLETED',
      },
    ],
  };
}

export async function submitPrintingRequest(
  student: StudentInfo,
  document: UploadedDocument,
  options: PrintingOptions
): Promise<PrintingRequestRecord> {
  const requestCode = generateRequestCode();
  const now = new Date();
  const nowFormatted = now.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const record: PrintingRequestRecord = {
    requestCode,
    student: {
      fullName: student.fullName.trim(),
      studentId: student.studentId.trim(),
      department: student.department.trim(),
      yearLevel: student.yearLevel,
      email: student.email.trim(),
    },
    document: {
      name: document.name,
      size: document.size,
      type: document.type || 'application/octet-stream',
    },
    options: {
      ...options,
    },
    status: 'PENDING',
    submittedAt: nowFormatted,
    updatedAt: nowFormatted,
    timeline: [
      {
        title: 'Request Submitted',
        description: 'Received online and placed in queue.',
        timestamp: nowFormatted,
        completed: true,
      },
      {
        title: 'Staff Processing',
        description: 'Staff reviews documents and prepares queue.',
        timestamp: 'Pending review',
        completed: false,
        current: true,
      },
      {
        title: 'Printing Document',
        description: 'Sent to physical printer.',
        timestamp: 'Pending',
        completed: false,
      },
      {
        title: 'Ready for Claim',
        description: 'Document ready at SBO office.',
        timestamp: 'Pending',
        completed: false,
      },
      {
        title: 'Completed',
        description: 'Student claimed printed document.',
        timestamp: 'Pending',
        completed: false,
      },
    ],
  };

  // Try to persist to MongoDB via server (primary), fallback to local only if offline
  try {
    const formData = new FormData();
    formData.append('requestCode', requestCode);
    formData.append('student', JSON.stringify(record.student));
    formData.append('options', JSON.stringify(record.options));
    formData.append('file', document.file);

    const res = await fetch(`${API_BASE}/printing-requests/student-submit`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const body = await res.json().catch(() => null);
      const serverData = body?.data || body;
      if (serverData?.requestCode) {
        const serverRecord = toRecordFromServer({
          ...serverData,
          document: serverData.document || record.document,
          student: serverData.student || record.student,
          options: serverData.options || record.options,
          status: serverData.status || 'PENDING',
        });
        // cache server record locally as well for offline tracking
        try {
          const existingRaw = localStorage.getItem(STORAGE_KEY);
          const list: PrintingRequestRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
          list.unshift(serverRecord);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch {}
        return serverRecord;
      }
    } else {
      const errBody = await res.text().catch(() => '');
      console.warn('Server student-submit failed', res.status, errBody.slice(0, 500));
    }
  } catch (err) {
    console.warn('Server submit unreachable, using local fallback', err);
  }

  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY);
    const list: PrintingRequestRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    list.unshift(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to cache request locally', err);
  }

  return record;
}

export function getPrintingRequestByCodeAndVerifier(
  code: string,
  verifier: string
): PrintingRequestRecord | null {
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY);
    if (existingRaw) {
      const list: PrintingRequestRecord[] = JSON.parse(existingRaw);
      const cleanCode = code.trim().toUpperCase();
      const cleanVerifier = verifier.trim().toLowerCase();
      const match = list.find(
        (r) =>
          r.requestCode.toUpperCase() === cleanCode &&
          (r.student.email.toLowerCase() === cleanVerifier ||
            r.student.studentId.toLowerCase() === cleanVerifier)
      );
      if (match) return match;
    }
  } catch {}
  return null;
}

export async function getPrintingRequestFromServer(
  code: string,
  verifier: string
): Promise<PrintingRequestRecord | null> {
  try {
    const cleanCode = code.trim().toUpperCase();
    const cleanVerifier = verifier.trim().toLowerCase();
    const res = await fetch(
      `${API_BASE}/printing-requests/track/${encodeURIComponent(cleanCode)}?verifier=${encodeURIComponent(cleanVerifier)}`
    );
    if (!res.ok) return null;
    const body = await res.json().catch(() => null);
    const data = body?.data || body;
    if (!data?.requestCode) return null;
    return toRecordFromServer(data);
  } catch {
    return null;
  }
}
