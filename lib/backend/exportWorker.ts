import { createClient } from "@supabase/supabase-js";
import * as nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize email transporter (configure with your email service)
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Export Worker - Processes resume export jobs from queue
 * Supports: PDF, DOCX, JSON formats
 * Handles: File generation, storage upload, email delivery
 */
export class ExportWorker {
  private activeJobs: Map<string, boolean> = new Map();

  /**
   * Start processing export queue
   * Runs continuously polling for pending jobs
   */
  async startWorker() {
    console.log("Export Worker started");

    // Poll every 5 seconds for pending jobs
    setInterval(() => this.processPendingJobs(), 5000);
  }

  /**
   * Process all pending export jobs
   */
  private async processPendingJobs() {
    try {
      // Fetch pending exports
      const { data: pendingExports, error } = await supabase
        .from("resume_exports")
        .select("id, resume_id, user_id, format")
        .eq("export_status", "pending")
        .limit(5); // Process up to 5 jobs at a time

      if (error) throw error;
      if (!pendingExports || pendingExports.length === 0) return;

      // Process each job
      for (const job of pendingExports) {
        if (this.activeJobs.get(job.id)) continue; // Skip if already processing

        this.activeJobs.set(job.id, true);
        try {
          await this.processExportJob(job);
        } catch (err) {
          console.error(`Error processing export ${job.id}:`, err);
          await this.updateJobStatus(
            job.id,
            "failed",
            null,
            (err as Error).message
          );
        } finally {
          this.activeJobs.delete(job.id);
        }
      }
    } catch (err) {
      console.error("Error in processPendingJobs:", err);
    }
  }

  /**
   * Process single export job
   */
  private async processExportJob(job: any) {
    console.log(`Processing export job ${job.id} - Format: ${job.format}`);

    // Fetch resume and sections
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*, resume_sections(*)")
      .eq("id", job.resume_id)
      .single();

    if (resumeError || !resume) throw new Error("Resume not found");

    // Get user email
    const { data: user, error: userError } = await supabase
      .from("user_metadata")
      .select("email")
      .eq("user_id", job.user_id)
      .single();

    if (userError) throw new Error("User not found");

    // Generate file based on format
    let fileContent: Buffer;
    let mimeType: string;
    let fileName: string;

    switch (job.format) {
      case "pdf":
        fileContent = await this.generatePDF(resume);
        mimeType = "application/pdf";
        fileName = `${resume.title}.pdf`;
        break;

      case "docx":
        fileContent = await this.generateDOCX(resume);
        mimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        fileName = `${resume.title}.docx`;
        break;

      case "json":
        fileContent = Buffer.from(JSON.stringify(resume, null, 2));
        mimeType = "application/json";
        fileName = `${resume.title}.json`;
        break;

      default:
        throw new Error("Unsupported format");
    }

    // Upload to storage
    const fileUrl = await this.uploadFile(fileContent, fileName, job.resume_id);

    // Send email
    await this.sendExportEmail(user.email, resume.title, fileUrl, job.format);

    // Update job status
    await this.updateJobStatus(job.id, "completed", fileUrl);

    console.log(`Export job ${job.id} completed successfully`);
  }

  /**
   * Generate PDF file from resume data
   * TODO: Implement actual PDF generation (use pdf-lib or similar)
   */
  private async generatePDF(resume: any): Promise<Buffer> {
    // Placeholder - integrate with pdf-lib, pdfkit, or similar
    const pdfContent = `
    Resume: ${resume.title}
    Position: ${resume.job_title}
    
    ${resume.resume_sections
      .map((s: any) => `${s.section_type}: ${JSON.stringify(s.section_data)}`)
      .join("\n\n")}
    `;

    return Buffer.from(pdfContent);
  }

  /**
   * Generate DOCX file from resume data
   * TODO: Implement actual DOCX generation (use docx or similar)
   */
  private async generateDOCX(resume: any): Promise<Buffer> {
    // Placeholder - integrate with docx-generator library
    const docContent = `
    Resume: ${resume.title}
    Position: ${resume.job_title}
    
    ${resume.resume_sections
      .map((s: any) => `${s.section_type}: ${JSON.stringify(s.section_data)}`)
      .join("\n\n")}
    `;

    return Buffer.from(docContent);
  }

  /**
   * Upload generated file to Supabase Storage
   */
  private async uploadFile(
    fileContent: Buffer,
    fileName: string,
    resumeId: string
  ): Promise<string> {
    const filePath = `exports/${resumeId}/${Date.now()}_${fileName}`;

    const { data, error } = await supabase.storage
      .from("resume-exports")
      .upload(filePath, fileContent, {
        contentType: "application/octet-stream",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from("resume-exports")
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  }

  /**
   * Send export confirmation email
   */
  private async sendExportEmail(
    email: string,
    resumeTitle: string,
    fileUrl: string,
    format: string
  ) {
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: `Your Resume Export is Ready - ${resumeTitle}`,
      html: `
        <h2>Your Resume Export is Ready!</h2>
        <p>Your resume <strong>${resumeTitle}</strong> has been exported as ${format.toUpperCase()}.</p>
        <p>
          <a href="${fileUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
            Download Resume
          </a>
        </p>
        <p>This link will expire in 7 days.</p>
        <hr />
        <p style="color: #666; font-size: 12px;">© Cloud9Profile - Professional Resume Builder</p>
      `,
    };

    return new Promise((resolve, reject) => {
      emailTransporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Email send error:", error);
          reject(error);
        } else {
          console.log("Email sent:", info.response);
          resolve(info);
        }
      });
    });
  }

  /**
   * Update export job status in database
   */
  private async updateJobStatus(
    jobId: string,
    status: "completed" | "failed",
    fileUrl: string | null,
    errorMessage?: string
  ) {
    const updateData: any = {
      export_status: status,
      updated_at: new Date().toISOString(),
    };

    if (fileUrl) updateData.file_url = fileUrl;
    if (errorMessage) updateData.error_message = errorMessage;

    const { error } = await supabase
      .from("resume_exports")
      .update(updateData)
      .eq("id", jobId);

    if (error) throw error;
  }

  /**
   * Stop worker gracefully
   */
  async stopWorker() {
    console.log("Stopping Export Worker...");
    // Wait for all active jobs to complete
    while (this.activeJobs.size > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log("Export Worker stopped");
  }
}

// Export singleton instance
export const exportWorker = new ExportWorker();
