import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";

export interface EmailPrintingRequestDetails {
  requestCode: string;
  studentName: string;
  studentEmail: string;
  department: string;
  documentName: string;
  copies: number;
  paperSize: string;
  colorMode: string;
  submittedAt: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    if (env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST || "smtp.gmail.com",
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
      this.isConfigured = true;
    } else {
      console.warn("⚠️ SMTP credentials missing in .env. Outgoing emails will be logged to console.");
    }
  }

  /**
   * Verify SMTP connection handshake
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter || !this.isConfigured) return false;
    try {
      await this.transporter.verify();
      return true;
    } catch (err) {
      console.error("❌ SMTP connection verification failed:", err);
      return false;
    }
  }

  /**
   * EMAIL 1 — REQUEST RECEIVED
   * Sent immediately after successful submission
   */
  async sendRequestReceivedEmail(details: EmailPrintingRequestDetails): Promise<boolean> {
    const subject = `SBO Printing Request Received — ${details.requestCode}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #fafaf9; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #073474; margin: 0; font-size: 22px; font-weight: 800;">BukSU COT SBO Printing System</h1>
          <p style="color: #64748b; margin: 4px 0 0; font-size: 13px;">Official Student Printing Service</p>
        </div>

        <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; margin-bottom: 12px;">
            Status: Pending Review
          </div>

          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 12px;">Your Request Has Been Received</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px;">
            Hi <strong>${details.studentName}</strong>, your document printing request has been successfully submitted and queued for processing by the SBO team.
          </p>

          <div style="background-color: #073474; color: #ffffff; padding: 16px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #ff7701; text-transform: uppercase;">Your Request Code</span>
            <div style="font-family: monospace; font-size: 26px; font-weight: 800; letter-spacing: 2px; margin: 6px 0;">${details.requestCode}</div>
            <p style="margin: 0; font-size: 12px; color: #cbd5e1;">Please keep this code to claim your prints.</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b;">Department:</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #0f172a;">${details.department}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b;">Document:</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #0f172a;">${details.documentName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b;">Copies:</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #0f172a;">${details.copies}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b;">Specifications:</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #0f172a;">${details.paperSize}, ${details.colorMode === "color" ? "Colored" : "Black & White"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Submitted On:</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #0f172a;">${details.submittedAt}</td>
            </tr>
          </table>

          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #1e40af; line-height: 1.5;">
            <strong>What to do next:</strong> Please wait for our next email notification. We will notify you as soon as your document is printed and ready for pickup at the COT SBO Desk.
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #94a3b8;">
          <p style="margin: 0;">Bukidnon State University • College of Technologies Student Body Organization</p>
        </div>
      </div>
    `;

    return this.sendMail(details.studentEmail, subject, html);
  }

  /**
   * EMAIL 2 — READY FOR CLAIM
   * Sent automatically when staff marks request as READY FOR CLAIM
   */
  async sendReadyForClaimEmail(details: EmailPrintingRequestDetails): Promise<boolean> {
    const subject = `Your SBO Printing Request is Ready for Claim — ${details.requestCode}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #fafaf9; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #073474; margin: 0; font-size: 22px; font-weight: 800;">BukSU COT SBO Printing System</h1>
          <p style="color: #64748b; margin: 4px 0 0; font-size: 13px;">Official Student Printing Service</p>
        </div>

        <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="display: inline-block; background-color: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; margin-bottom: 12px;">
            ✓ Status: Ready for Claim
          </div>

          <h2 style="font-size: 18px; font-weight: 700; color: #065f46; margin: 0 0 12px;">Your Printed Document is Ready!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px;">
            Hi <strong>${details.studentName}</strong>, your printing request has been processed and printed. It is now waiting for you at the SBO Office desk.
          </p>

          <div style="background-color: #073474; color: #ffffff; padding: 16px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #ff7701; text-transform: uppercase;">Present This Code</span>
            <div style="font-family: monospace; font-size: 26px; font-weight: 800; letter-spacing: 2px; margin: 6px 0;">${details.requestCode}</div>
            <p style="margin: 0; font-size: 12px; color: #cbd5e1;">Document: ${details.documentName} (${details.copies} ${details.copies === 1 ? 'copy' : 'copies'})</p>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 10px; margin-bottom: 20px; font-size: 13px;">
            <h3 style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #0f172a;">📍 Claiming Information:</h3>
            <p style="margin: 4px 0; color: #475569;"><strong>Location:</strong> COT SBO Printing Desk, Main Campus</p>
            <p style="margin: 4px 0; color: #475569;"><strong>Office Hours:</strong> Monday – Friday, 8:00 AM – 5:00 PM</p>
            <p style="margin: 4px 0; color: #475569;"><strong>What to bring:</strong> Your Request Code and your Valid Student ID.</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #94a3b8;">
          <p style="margin: 0;">Bukidnon State University • College of Technologies Student Body Organization</p>
        </div>
      </div>
    `;

    return this.sendMail(details.studentEmail, subject, html);
  }

  /**
   * EMAIL 3 — REJECTED
   * Sent when staff rejects a request
   */
  async sendRequestRejectedEmail(details: EmailPrintingRequestDetails, reason: string): Promise<boolean> {
    const subject = `Update on your SBO Printing Request — ${details.requestCode}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #fafaf9; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #073474; margin: 0; font-size: 22px; font-weight: 800;">BukSU COT SBO Printing System</h1>
          <p style="color: #64748b; margin: 4px 0 0; font-size: 13px;">Official Student Printing Service</p>
        </div>

        <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="display: inline-block; background-color: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; margin-bottom: 12px;">
            Status: Request Rejected
          </div>

          <h2 style="font-size: 18px; font-weight: 700; color: #991b1b; margin: 0 0 12px;">Request Could Not Be Processed</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px;">
            Hi <strong>${details.studentName}</strong>, we regret to inform you that your printing request <strong>${details.requestCode}</strong> could not be processed.
          </p>

          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 10px; margin-bottom: 20px; font-size: 13px;">
            <p style="margin: 0 0 4px; font-weight: 700; color: #991b1b;">Reason for Rejection:</p>
            <p style="margin: 0; color: #7f1d1d;">${reason || "File format unreadable or does not conform to university printing policy."}</p>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">
            If you wish to submit another request with a revised document, please visit the online portal. You may also visit the SBO desk directly during office hours for inquiries.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #94a3b8;">
          <p style="margin: 0;">Bukidnon State University • College of Technologies Student Body Organization</p>
        </div>
      </div>
    `;

    return this.sendMail(details.studentEmail, subject, html);
  }

  /**
   * EMAIL 4 — PASSWORD RESET
   * Sent when a user requests a password reset
   */
  async sendPasswordResetEmail(to: string, recipientName: string, resetUrl: string): Promise<boolean> {
    const subject = `BukSU SBO Printing — Password Reset Request`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #fafaf9; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #073474; margin: 0; font-size: 22px; font-weight: 800;">BukSU COT SBO Printing System</h1>
          <p style="color: #64748b; margin: 4px 0 0; font-size: 13px;">Official Account Security</p>
        </div>

        <div style="background-color: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; margin-bottom: 12px;">
            Security Notification
          </div>

          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 12px;">Reset Your Account Password</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px;">
            Hi <strong>${recipientName || "Admin"}</strong>, we received a request to reset your password for the BukSU COT SBO Printing Request Portal.
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #073474; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(7,52,116,0.25);">
              Reset Password Now →
            </a>
          </div>

          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #92400e; line-height: 1.5; margin-bottom: 20px;">
            <strong>Important:</strong> This link will expire in <strong>1 hour</strong> for your security. If you did not initiate this request, you can safely ignore this email.
          </div>

          <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px;">If the button above does not work, copy and paste this URL into your browser:</p>
          <p style="font-size: 11px; word-break: break-all; color: #073474; background-color: #f1f5f9; padding: 10px; border-radius: 6px; margin: 0;">
            ${resetUrl}
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #94a3b8;">
          <p style="margin: 0;">Bukidnon State University • College of Technologies Student Body Organization</p>
        </div>
      </div>
    `;

    return this.sendMail(to, subject, html);
  }

  private async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter || !this.isConfigured) {
      console.log(`[Email Mock Dispatch] To: ${to} | Subject: ${subject}`);
      return true;
    }

    try {
      const from = env.SMTP_FROM || `"SBO Printing System" <${env.SMTP_USER}>`;
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.log(`[Email Sent] Successfully sent "${subject}" to ${to}`);
      return true;
    } catch (err) {
      console.error(`[Email Failed] Could not send to ${to}:`, err);
      // Return false but do not throw, avoiding disruption to the main request pipeline
      return false;
    }
  }
}

export const emailService = new EmailService();
