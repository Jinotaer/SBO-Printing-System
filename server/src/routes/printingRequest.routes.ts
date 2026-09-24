import { Router, type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { PrintingRequest, type PrintingRequestDoc } from "../models/PrintingRequest.model.js";
import { storageService } from "../services/storage.service.js";
import { emailService } from "../services/email.service.js";

const router = Router();

// Multer in-memory storage for stream processing (Max 25 MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      ".pdf",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
      ".xls",
      ".xlsx",
      ".jpg",
      ".jpeg",
      ".png",
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, `Unsupported file extension: ${ext}`));
    }
  },
});

function generateRequestCode(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `SBO-${year}-${randomSuffix}`;
}

// ========================================================================
// 1. PUBLIC: STUDENT SUBMISSION (Zero-Login + Google Drive / Local Storage + Email 1)
// ========================================================================
router.post(
  "/student-submit",
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(400, "Please upload a document to proceed with printing.");
    }

    let studentData: any = {};
    let optionsData: any = {};

    try {
      studentData = typeof req.body.student === "string" ? JSON.parse(req.body.student) : req.body.student || {};
      optionsData = typeof req.body.options === "string" ? JSON.parse(req.body.options) : req.body.options || {};
    } catch {
      throw new ApiError(400, "Invalid submission payload structure.");
    }

    const requestCode = req.body.requestCode?.trim() || generateRequestCode();

    // 1. Upload to Google Drive / Local Storage Hierarchy
    const storedFile = await storageService.storeDocument(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      requestCode
    );

    // 2. Persist to MongoDB
    const requestDoc = (await PrintingRequest.create({
      requestCode,
      student: {
        fullName: studentData.fullName?.trim() || "Student",
        studentId: studentData.studentId?.trim() || "N/A",
        department: studentData.department?.trim() || "College of Technologies",
        yearLevel: studentData.yearLevel || "1st Year",
        email: studentData.email?.trim().toLowerCase() || "",
      },
      document: {
        originalName: storedFile.originalName,
        mimeType: storedFile.mimeType,
        sizeBytes: storedFile.sizeBytes,
        storageType: storedFile.storageType,
        storageFileId: storedFile.storageFileId,
        storagePath: storedFile.storagePath,
        webViewLink: storedFile.webViewLink,
      },
      options: {
        paperSize: optionsData.paperSize || "A4",
        colorMode: optionsData.colorMode || "bw",
        printSides: optionsData.printSides || "single",
        copies: Number(optionsData.copies) || 1,
        pageSelection: optionsData.pageSelection || "all",
        pageRange: optionsData.pageRange,
        additionalInstructions: optionsData.additionalInstructions,
      },
      status: "PENDING",
    })) as unknown as PrintingRequestDoc;

    const nowFormatted = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // 3. Dispatch Email 1 (Request Received) asynchronously via SMTP
    emailService.sendRequestReceivedEmail({
      requestCode,
      studentName: requestDoc.student.fullName,
      studentEmail: requestDoc.student.email,
      department: requestDoc.student.department,
      documentName: requestDoc.document.originalName,
      copies: requestDoc.options.copies,
      paperSize: requestDoc.options.paperSize,
      colorMode: requestDoc.options.colorMode,
      submittedAt: nowFormatted,
    }).catch((err) => console.error("Async email dispatch failed:", err));

    res.status(201).json(
      successResponse({
        requestCode: requestDoc.requestCode,
        status: requestDoc.status,
        document: requestDoc.document,
        student: requestDoc.student,
        createdAt: requestDoc.createdAt,
      })
    );
  })
);

// ========================================================================
// 2. PUBLIC: STUDENT TRACKING LOOKUP (Zero-Login + Privacy Verifier)
// ========================================================================
router.get(
  "/track/:code",
  asyncHandler(async (req: Request, res: Response) => {
    const code = String(req.params["code"] || "").trim().toUpperCase();
    const verifier = (req.query["verifier"] as string)?.trim().toLowerCase();

    if (!code || !verifier) {
      throw new ApiError(400, "Request Code and Email/Student ID are required for tracking.");
    }

    const request = await PrintingRequest.findOne({
      requestCode: code,
      $or: [
        { "student.email": verifier },
        { "student.studentId": { $regex: new RegExp(`^${verifier}$`, "i") } },
      ],
    }).lean();

    if (!request) {
      throw new ApiError(404, "No matching printing request found. Please check your credentials.");
    }

    res.json(successResponse(request));
  })
);

// ========================================================================
// 3. STAFF: UPDATE REQUEST STATUS & AUTOMATIC NOTIFICATIONS
// ========================================================================
const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "PRINTING", "READY_FOR_CLAIM", "COMPLETED", "REJECTED"]),
  rejectionReason: z.string().optional(),
  staffName: z.string().optional(),
});

router.patch(
  "/:id/status",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params["id"];
    const { status, rejectionReason, staffName } = updateStatusSchema.parse(req.body);

    const updateData: Record<string, any> = { status };
    if (staffName) {
      if (status === "PROCESSING" || status === "PRINTING") updateData["processedBy"] = staffName;
      if (status === "COMPLETED") {
        updateData["claimedBy"] = staffName;
        updateData["claimedAt"] = new Date();
      }
    }
    if (status === "REJECTED" && rejectionReason) {
      updateData["rejectionReason"] = rejectionReason;
    }

    const updated = await PrintingRequest.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      throw new ApiError(404, "Printing request not found.");
    }

    const nowFormatted = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const emailDetails = {
      requestCode: updated.requestCode,
      studentName: updated.student.fullName,
      studentEmail: updated.student.email,
      department: updated.student.department,
      documentName: updated.document.originalName,
      copies: updated.options.copies,
      paperSize: updated.options.paperSize,
      colorMode: updated.options.colorMode,
      submittedAt: nowFormatted,
    };

    // Trigger Email 2: Ready for Claim
    if (status === "READY_FOR_CLAIM") {
      emailService.sendReadyForClaimEmail(emailDetails).catch((err) =>
        console.error("Failed to send Ready for Claim email:", err)
      );
    }

    // Trigger Email 3: Rejected
    if (status === "REJECTED") {
      emailService.sendRequestRejectedEmail(emailDetails, rejectionReason || "Unable to print document").catch((err) =>
        console.error("Failed to send Rejection email:", err)
      );
    }

    res.json(successResponse(updated));
  })
);

// ========================================================================
// 4. DOCUMENT VIEWER / STREAM (For Staff [ Open Document ] button)
// ========================================================================
router.get(
  "/document/:code",
  asyncHandler(async (req: Request, res: Response) => {
    const code = String(req.params["code"] || "").trim();
    const doc = await PrintingRequest.findOne({ requestCode: code }).lean();
    if (!doc) {
      throw new ApiError(404, "Document not found.");
    }

    try {
      // Stream through server so admin stays in-system (no redirect to drive.google.com)
      const { stream, mimeType: driveMime } = await storageService.getFileStream(
        doc.document.storageType,
        doc.document.storageFileId,
        doc.document.storagePath,
        doc.document.mimeType
      );
      // Prefer original mime from DB (correct for PDFs) over Drive's generic octet-stream
      const contentType = doc.document.mimeType || driveMime || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      // inline so PDF/images render inside the admin modal iframe - MUST be inline, not attachment
      res.setHeader("Content-Disposition", `inline; filename="${doc.document.originalName.replace(/"/g, "")}"`);
      // Allow iframe embedding from admin portal (5173) - override Helmet's SAMEORIGIN which blocks cross-port iframe
      res.removeHeader("X-Frame-Options");
      res.setHeader("X-Frame-Options", "ALLOWALL");
      res.setHeader("Content-Security-Policy", "frame-ancestors 'self' http://localhost:5173 http://localhost:3000 http://127.0.0.1:5173");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
      // Prevent caching issues for sensitive student docs
      res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");
      res.setHeader("Accept-Ranges", "bytes");
      (stream as any).on("error", (err: any) => {
        console.error("Stream error for", code, err);
        if (!res.headersSent) res.status(500).json({ success: false, error: "Failed to stream document" });
        else res.end();
      });
      stream.pipe(res);
    } catch (err: any) {
      console.error("Document stream failed for", code, err?.message || err);
      // Fallback: if Drive direct link exists, redirect as last resort (should not happen in normal in-system flow)
      if (doc.document.storageType === "google_drive" && doc.document.webViewLink) {
        return res.redirect(doc.document.webViewLink);
      }
      throw new ApiError(404, "Document file not accessible. " + (err?.message || ""));
    }
  })
);

// ========================================================================
// 5. STAFF: LIST & PAGINATE ALL REQUESTS
// ========================================================================
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query["limit"] as string) || 20));
    const status = req.query["status"] as string;
    const search = req.query["search"] as string;

    const filter: Record<string, any> = {};
    if (status && status !== "ALL") {
      filter["status"] = status.toUpperCase();
    }
    if (search) {
      filter.$or = [
        { requestCode: { $regex: search, $options: "i" } },
        { "student.fullName": { $regex: search, $options: "i" } },
        { "student.studentId": { $regex: search, $options: "i" } },
        { "student.email": { $regex: search, $options: "i" } },
        { "document.originalName": { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      PrintingRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      PrintingRequest.countDocuments(filter),
    ]);

    res.json(
      successResponse(data, {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      })
    );
  })
);

// ========================================================================
// 6. SMTP STATUS HEALTH CHECK
// ========================================================================
router.get(
  "/health/smtp",
  asyncHandler(async (_req: Request, res: Response) => {
    const verified = await emailService.verifyConnection();
    res.json(successResponse({ smtpConnected: verified }));
  })
);

export default router;
