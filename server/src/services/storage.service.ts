import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { google } from "googleapis";
import { env } from "../config/env.js";

export interface StoredFileResult {
  storageType: "google_drive" | "local";
  storageFileId: string;
  storagePath: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  webViewLink?: string;
}

export interface IStorageProvider {
  uploadDocument(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    requestCode: string
  ): Promise<StoredFileResult>;
  getFileStream?(fileId: string, mimeTypeHint?: string): Promise<{ stream: Readable; mimeType: string }>;
}

/**
 * Google Drive Storage Providers
 * Organizes files into: YYYY -> Month -> RequestCode -> File under GOOGLE_DRIVE_ROOT_FOLDER_ID
 *
 * FOLDER 1IceTcwyPoV8qIgZmT7qDzWPDS5CT-PLp is a My Drive folder owned by u7382361@gmail.com.
 * Service Accounts have NO quota in My Drive -> they must use Shared Drive OR OAuth as the owner.
 * This file implements BOTH paths so that exact folder ID works:
 *  - OAuthDriveProvider (personal Gmail): acts as the owner using a refresh token, so quota = owner's My Drive.
 *  - GoogleDriveStorageProvider (service account): for Shared Drives (requires Workspace Shared Drive where service account is Manager).
 * Priority: OAuth (My Drive) -> Service Account (Shared Drive) -> Local.
 */
export class GoogleDriveStorageProvider implements IStorageProvider {
  private driveClient: any = null;
  private rootFolderId: string | null = null;
  private isConfigured = false;

  constructor() {
    this.initDrive();
  }

  private initDrive() {
    const serviceAccountEmail = process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"];
    const privateKey = process.env["GOOGLE_PRIVATE_KEY"]?.replace(/\\n/g, "\n");
    const rootId = process.env["GOOGLE_DRIVE_ROOT_FOLDER_ID"];

    if (serviceAccountEmail && privateKey) {
      try {
        const auth = new google.auth.JWT({
          email: serviceAccountEmail,
          key: privateKey,
          scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"],
        });
        this.driveClient = google.drive({ version: "v3", auth });
        this.rootFolderId = rootId || null;
        this.isConfigured = true;
        console.log(" Google Drive Storage Provider initialized (Service Account)");
        if (rootId) {
          // async probe: warn if root is My Drive (no quota) vs Shared Drive
          this.probeRootFolder(rootId).catch(() => {});
        }
      } catch (err) {
        console.error("❌ Failed to initialize Google Drive client:", err);
      }
    } else {
      console.log("ℹ️ Google Drive service account not configured. Local structured storage active.");
    }
  }

  private async probeRootFolder(rootId: string) {
    try {
      const res = await this.driveClient.files.get({
        fileId: rootId,
        fields: "id, name, mimeType, driveId, owners",
        supportsAllDrives: true,
      });
      const driveId = (res.data as any).driveId;
      if (!driveId) {
        console.warn(
          "⚠️ Drive root is in My Drive (owners: " +
            ((res.data as any).owners?.[0]?.emailAddress || "unknown") +
            "). Service Accounts have no storage quota in My Drive and will fall back to local. Create a Shared Drive, move the folder there, and set GOOGLE_DRIVE_ROOT_FOLDER_ID to the Shared Drive folder ID. See storage.service.ts header."
        );
      } else {
        console.log(`✓ Drive root is in Shared Drive ${driveId} - Google Drive uploads will use Shared Drive quota.`);
      }
    } catch {}
  }

  isAvailable(): boolean {
    return this.isConfigured && this.driveClient !== null;
  }

  private async getOrCreateFolder(folderName: string, parentFolderId?: string): Promise<string> {
    const queryParts = [
      `name = '${folderName}'`,
      `mimeType = 'application/vnd.google-apps.folder'`,
      `trashed = false`,
    ];
    if (parentFolderId) {
      queryParts.push(`'${parentFolderId}' in parents`);
    }

    const res = await this.driveClient.files.list({
      q: queryParts.join(" and "),
      fields: "files(id, name)",
      spaces: "drive",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id;
    }

    const fileMetadata: any = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };
    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }

    const folder = await this.driveClient.files.create({
      requestBody: fileMetadata,
      fields: "id",
      supportsAllDrives: true,
    });

    return folder.data.id;
  }

  async uploadDocument(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    requestCode: string
  ): Promise<StoredFileResult> {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = now.toLocaleString("en-US", { month: "long" });

    // Hierarchy: Root -> Year -> Month -> RequestCode
    let currentParentId = this.rootFolderId || (await this.getOrCreateFolder("SBO Printing Documents"));
    const yearFolderId = await this.getOrCreateFolder(year, currentParentId);
    const monthFolderId = await this.getOrCreateFolder(month, yearFolderId);
    const requestFolderId = await this.getOrCreateFolder(requestCode, monthFolderId);

    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);

    const response = await this.driveClient.files.create({
      requestBody: {
        name: originalName,
        parents: [requestFolderId],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: "id, name, webViewLink, webContentLink",
      supportsAllDrives: true,
    });

    const fileId = response.data.id;
    const webViewLink = response.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

    return {
      storageType: "google_drive",
      storageFileId: fileId,
      storagePath: `SBO Printing Documents/${year}/${month}/${requestCode}/${originalName}`,
      originalName,
      mimeType,
      sizeBytes: fileBuffer.length,
      webViewLink,
    };
  }

  async getFileStream(fileId: string): Promise<{ stream: Readable; mimeType: string }> {
    const res = await this.driveClient.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );
    const mimeType = (res.headers as any)["content-type"] || "application/octet-stream";
    return { stream: res.data as Readable, mimeType };
  }
}

/**
 * OAuth Drive Provider for My Drive folder 1IceTcwyPoV8qIgZmT7qDzWPDS5CT-PLp
 * Uses the OWNER's OAuth refresh token so quota = owner's 15GB, not service account's 0.
 * Set in .env: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN
 * Get refresh token via: npm run drive:auth  (see scripts/get-refresh-token.js)
 */
export class OAuthDriveProvider implements IStorageProvider {
  private driveClient: any = null;
  private rootFolderId: string | null = null;
  private isConfigured = false;

  constructor() {
    const clientId = process.env["GOOGLE_OAUTH_CLIENT_ID"] || process.env["GOOGLE_CLIENT_ID"] || process.env["VITE_GOOGLE_CLIENT_ID"];
    const clientSecret = process.env["GOOGLE_OAUTH_CLIENT_SECRET"];
    const refreshToken = process.env["GOOGLE_OAUTH_REFRESH_TOKEN"];
    const rootId = process.env["GOOGLE_DRIVE_ROOT_FOLDER_ID"];
    if (clientId && clientSecret && refreshToken) {
      try {
        const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
        oauth2.setCredentials({ refresh_token: refreshToken });
        this.driveClient = google.drive({ version: "v3", auth: oauth2 });
        this.rootFolderId = rootId || null;
        this.isConfigured = true;
        console.log(" Google Drive OAuth Provider initialized (owner quota) for My Drive folder");
      } catch (err) {
        console.error("❌ Failed to init OAuth Drive:", err);
      }
    }
  }

  isAvailable(): boolean {
    return this.isConfigured && this.driveClient !== null;
  }

  private async getOrCreateFolder(folderName: string, parentFolderId?: string): Promise<string> {
    const q = [`name = '${folderName}'`, `mimeType = 'application/vnd.google-apps.folder'`, `trashed = false`];
    if (parentFolderId) q.push(`'${parentFolderId}' in parents`);
    const res = await this.driveClient.files.list({
      q: q.join(" and "),
      fields: "files(id, name)",
      spaces: "drive",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    if (res.data.files?.length) return res.data.files[0].id;
    const meta: any = { name: folderName, mimeType: "application/vnd.google-apps.folder" };
    if (parentFolderId) meta.parents = [parentFolderId];
    const folder = await this.driveClient.files.create({ requestBody: meta, fields: "id", supportsAllDrives: true });
    return folder.data.id;
  }

  async uploadDocument(fileBuffer: Buffer, originalName: string, mimeType: string, requestCode: string): Promise<StoredFileResult> {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = now.toLocaleString("en-US", { month: "long" });
    let parentId = this.rootFolderId || (await this.getOrCreateFolder("SBO Printing Documents"));
    const yId = await this.getOrCreateFolder(year, parentId);
    const mId = await this.getOrCreateFolder(month, yId);
    const rId = await this.getOrCreateFolder(requestCode, mId);
    const stream = new Readable(); stream.push(fileBuffer); stream.push(null);
    const resp = await this.driveClient.files.create({
      requestBody: { name: originalName, parents: [rId] },
      media: { mimeType, body: stream },
      fields: "id, name, webViewLink",
      supportsAllDrives: true,
    });
    const fileId = resp.data.id;
    return {
      storageType: "google_drive",
      storageFileId: fileId,
      storagePath: `SBO Printing Documents/${year}/${month}/${requestCode}/${originalName}`,
      originalName,
      mimeType,
      sizeBytes: fileBuffer.length,
      webViewLink: resp.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
    };
  }

  async getFileStream(fileId: string): Promise<{ stream: Readable; mimeType: string }> {
    const res = await this.driveClient.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );
    const mimeType = (res.headers as any)["content-type"] || "application/octet-stream";
    return { stream: res.data as Readable, mimeType };
  }
}

/**
 * Local Structured Storage Provider (Fallback)
 * Mimics Google Drive folder hierarchy on disk: uploads/YYYY/Month/RequestCode/File
 */
export class LocalStorageProvider implements IStorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), "uploads");
  }

  async uploadDocument(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    requestCode: string
  ): Promise<StoredFileResult> {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = now.toLocaleString("en-US", { month: "long" });

    const dirPath = path.join(this.baseDir, year, month, requestCode);
    await fs.promises.mkdir(dirPath, { recursive: true });

    const filePath = path.join(dirPath, originalName);
    await fs.promises.writeFile(filePath, fileBuffer);

    const relativePath = path.join(year, month, requestCode, originalName).replace(/\\/g, "/");

    return {
      storageType: "local",
      storageFileId: `local_${requestCode}_${Date.now()}`,
      storagePath: relativePath,
      originalName,
      mimeType,
      sizeBytes: fileBuffer.length,
      webViewLink: `/api/printing-requests/document/${encodeURIComponent(requestCode)}`,
    };
  }

  async getFileStream(fileId: string, storagePath: string): Promise<{ stream: Readable; mimeType: string }> {
    // fileId is ignored for local; use storagePath
    const filePath = path.resolve(this.baseDir, storagePath);
    if (!fs.existsSync(filePath)) throw new Error(`Local file not found: ${storagePath}`);
    // try to infer mime from extension if needed, but caller provides hint
    const stream = fs.createReadStream(filePath) as unknown as Readable;
    return { stream, mimeType: "application/octet-stream" };
  }
}

/**
 * Master Storage Router
 * Selects Google Drive when available, otherwise falls back smoothly to Local Structured Storage
 */
class StorageService {
  private oauthProvider: OAuthDriveProvider;
  private googleDriveProvider: GoogleDriveStorageProvider;
  private localProvider: LocalStorageProvider;

  constructor() {
    this.oauthProvider = new OAuthDriveProvider();
    this.googleDriveProvider = new GoogleDriveStorageProvider();
    this.localProvider = new LocalStorageProvider();
  }

  async storeDocument(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    requestCode: string
  ): Promise<StoredFileResult> {
    // 1) Try OAuth as owner (works for My Drive folder 1IceTcwy...) - has quota
    if (this.oauthProvider.isAvailable()) {
      try {
        return await this.oauthProvider.uploadDocument(fileBuffer, originalName, mimeType, requestCode);
      } catch (err) {
        console.error("OAuth Drive upload failed, trying service account:", (err as Error).message);
      }
    }
    // 2) Try Service Account (works for Shared Drive)
    if (this.googleDriveProvider.isAvailable()) {
      try {
        return await this.googleDriveProvider.uploadDocument(
          fileBuffer,
          originalName,
          mimeType,
          requestCode
        );
      } catch (err: any) {
        const msg = err?.message || String(err);
        const details = err?.response?.data?.error?.message || "";
        if (msg.includes("storageQuotaExceeded") || details.includes("storageQuotaExceeded")) {
          console.error(
            "❌ Google Drive: Service Accounts have no quota in My Drive folder " +
              process.env["GOOGLE_DRIVE_ROOT_FOLDER_ID"] +
              ". Fix: either (A) Move that folder into a Shared Drive and share with " +
              process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"] +
              " OR (B) Keep this My Drive folder and set GOOGLE_OAUTH_REFRESH_TOKEN (uses your 15GB quota). Run: npm run drive:auth  See storage.service.ts header."
          );
        } else {
          console.error("Google Drive upload failed, falling back to local storage:", err);
        }
      }
    }
    return this.localProvider.uploadDocument(fileBuffer, originalName, mimeType, requestCode);
  }

  async getFileStream(
    storageType: string,
    storageFileId: string,
    storagePath: string,
    mimeHint?: string
  ): Promise<{ stream: Readable; mimeType: string }> {
    // Try OAuth first (My Drive), then Service Account (Shared Drive), then local
    if (storageType === "google_drive") {
      if (this.oauthProvider.isAvailable()) {
        try {
          return await this.oauthProvider.getFileStream(storageFileId);
        } catch (err) {
          console.error("OAuth getFileStream failed, trying service account:", (err as Error).message);
        }
      }
      if (this.googleDriveProvider.isAvailable()) {
        try {
          return await this.googleDriveProvider.getFileStream(storageFileId);
        } catch (err) {
          console.error("Service Account getFileStream failed:", (err as Error).message);
          throw err;
        }
      }
      throw new Error("Google Drive not configured for streaming");
    }
    // local
    return this.localProvider.getFileStream(storageFileId, storagePath);
  }

  /** For /api/printing-requests/health/storage probe */
  async getStatus(): Promise<{ provider: string; driveConfigured: boolean; rootIsSharedDrive: boolean | null }> {
    if (this.oauthProvider.isAvailable()) return { provider: "google_drive (OAuth My Drive)", driveConfigured: true, rootIsSharedDrive: false };
    const isConfigured = this.googleDriveProvider.isAvailable();
    let rootIsShared: boolean | null = null;
    if (isConfigured && (this.googleDriveProvider as any).rootFolderId) {
      try {
        const drive = (this.googleDriveProvider as any).driveClient;
        const res = await drive.files.get({
          fileId: (this.googleDriveProvider as any).rootFolderId,
          fields: "driveId",
          supportsAllDrives: true,
        });
        rootIsShared = !!res.data.driveId;
      } catch {}
    }
    return {
      provider: isConfigured && rootIsShared ? "google_drive" : isConfigured ? "google_drive (My Drive - will fallback to local)" : "local",
      driveConfigured: isConfigured || this.oauthProvider.isAvailable(),
      rootIsSharedDrive: rootIsShared,
    };
  }
}

export const storageService = new StorageService();
