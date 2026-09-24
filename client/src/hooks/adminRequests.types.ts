export type RequestStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PRINTING'
  | 'READY_FOR_CLAIM'
  | 'COMPLETED'
  | 'REJECTED';

export interface PrintingRequest {
  _id: string;
  id?: string;
  requestCode: string;
  student: {
    fullName: string;
    studentId: string;
    department: string;
    yearLevel: string;
    email: string;
  };
  document: {
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    storageType: 'google_drive' | 'local';
    storageFileId: string;
    storagePath: string;
    webViewLink?: string;
  };
  options: {
    paperSize: string;
    colorMode: string;
    printSides: string;
    copies: number;
    pageSelection: string;
    pageRange?: string;
    additionalInstructions?: string;
  };
  status: RequestStatus;
  rejectionReason?: string;
  processedBy?: string;
  claimedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConfirmAction {
  title: string;
  message: string;
  onConfirm: () => void;
}

export const STATUS_TABS: (RequestStatus | 'ALL')[] = [
  'ALL',
  'PENDING',
  'PROCESSING',
  'PRINTING',
  'READY_FOR_CLAIM',
  'COMPLETED',
  'REJECTED',
];
