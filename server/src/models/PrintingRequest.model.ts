import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface PrintingRequestDoc extends Document {
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
    storageType: "google_drive" | "local";
    storageFileId: string;
    storagePath: string;
    webViewLink?: string | undefined;
  };
  options: {
    paperSize: string;
    colorMode: string;
    printSides: string;
    copies: number;
    pageSelection: string;
    pageRange?: string | undefined;
    additionalInstructions?: string | undefined;
  };
  status:
    | "PENDING"
    | "PROCESSING"
    | "PRINTING"
    | "READY_FOR_CLAIM"
    | "COMPLETED"
    | "REJECTED"
    | "pending"
    | "approved"
    | "rejected"
    | "completed";
  rejectionReason?: string | undefined;
  processedBy?: string | undefined;
  claimedBy?: string | undefined;
  claimedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

const printingRequestSchema = new Schema<PrintingRequestDoc>(
  {
    requestCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    student: {
      fullName: { type: String, required: true, trim: true },
      studentId: { type: String, required: true, trim: true, index: true },
      department: { type: String, required: true, trim: true },
      yearLevel: { type: String, required: true },
      email: { type: String, required: true, trim: true, index: true },
    },
    document: {
      originalName: { type: String, required: true },
      mimeType: { type: String, required: true },
      sizeBytes: { type: Number, required: true },
      storageType: { type: String, enum: ["google_drive", "local"], default: "local" },
      storageFileId: { type: String, required: true },
      storagePath: { type: String, required: true },
      webViewLink: { type: String },
    },
    options: {
      paperSize: { type: String, required: true, default: "A4" },
      colorMode: { type: String, required: true, default: "bw" },
      printSides: { type: String, required: true, default: "single" },
      copies: { type: Number, required: true, min: 1, default: 1 },
      pageSelection: { type: String, required: true, default: "all" },
      pageRange: { type: String },
      additionalInstructions: { type: String },
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "PROCESSING",
        "PRINTING",
        "READY_FOR_CLAIM",
        "COMPLETED",
        "REJECTED",
        "pending",
        "approved",
        "rejected",
        "completed",
      ],
      default: "PENDING",
      index: true,
    },
    rejectionReason: { type: String },
    processedBy: { type: String },
    claimedBy: { type: String },
    claimedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret["id"] = ret["_id"];
        delete ret["_id"];
        return ret;
      },
    },
  }
);

printingRequestSchema.index({ status: 1, createdAt: -1 });
printingRequestSchema.index({ "student.email": 1, requestCode: 1 });

export const PrintingRequest: Model<PrintingRequestDoc> =
  mongoose.models["PrintingRequest"] ??
  mongoose.model<PrintingRequestDoc>("PrintingRequest", printingRequestSchema);
