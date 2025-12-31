import { Resend } from "resend";
import {
  welcomeTemplate,
  registrationSuccessTemplate,
  forgotPasswordTemplate,
  planUpgradeTemplate,
  atsReportTemplate,
  exportConfirmationTemplate,
} from "../templates/emailTemplates";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

class EmailSender {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const from =
        options.from ||
        process.env.FROM_EMAIL ||
        "Cloud9Profile <reply@cloud9profile.com>";

      console.log(`[EmailSender] Sending email from: ${from}`);

      const { error } = await this.resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        console.error("Resend error:", error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Email sending failed:", error);
      throw new Error("Failed to send email");
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: "Welcome to Cloud9Profile",
      html: welcomeTemplate(name),
    });
  }

  async sendRegistrationEmail(
    email: string,
    name: string,
    planId: string = "free"
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: "Welcome to Cloud9Profile - Registration Successful",
      html: registrationSuccessTemplate(name, email, planId),
    });
  }

  async sendForgotPasswordEmail(
    email: string,
    resetUrl: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: "Reset your Cloud9Profile password",
      html: forgotPasswordTemplate(resetUrl),
    });
  }

  async sendPlanUpgradeEmail(
    email: string,
    name: string,
    planName: string,
    credits: number
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: "Plan Upgraded Successfully",
      html: planUpgradeTemplate(name, planName, credits),
    });
  }

  async sendATSAnalysisReport(
    email: string,
    name: string,
    analysis: any
  ): Promise<void> {
    const subject = "Your ATS Analysis Report - Cloud9Profile";
    const html = atsReportTemplate(name, analysis);

    await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  async sendExportEmail(
    email: string,
    resumeTitle: string,
    fileUrl: string,
    format: string
  ): Promise<void> {
    const subject = `Your Resume Export is Ready - ${resumeTitle}`;
    const html = exportConfirmationTemplate(resumeTitle, fileUrl, format);

    await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }
  async sendContactEmail(
    name: string,
    email: string,
    subject: string,
    message: string
  ): Promise<void> {
    const supportEmail = "Support@cloud9profile.com";
    const html = `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <br/>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${message}</p>
    `;

    await this.resend.emails.send({
      from: this.resend.apiKeys
        ? "Cloud9Profile Contact <contact@cloud9profile.com>"
        : "onboarding@resend.dev", // Use a valid sender
      to: supportEmail,
      replyTo: email, // Allow replying directly to the user
      subject: `[Contact Form] ${subject}`,
      html,
    });
  }
  async sendOTPEmail(email: string, otp: string): Promise<void> {
    const subject = "Verify your email address - Cloud9Profile";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Verify your email address</h2>
        <p style="color: #666; font-size: 16px;">
          Use the code below to verify your email address. This code will expire in 10 minutes.
        </p>
        <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111;">
            ${otp}
          </span>
        </div>
        <p style="color: #999; font-size: 14px;">
          If you didn't request this code, you can ignore this email.
        </p>
      </div>
    `;

    await this.resend.emails.send({
      from: this.resend.apiKeys
        ? "Cloud9Profile Security <security@cloud9profile.com>"
        : "onboarding@resend.dev",
      to: email,
      subject,
      html,
    });
  }
}

export const emailSender = new EmailSender();
export default EmailSender;
