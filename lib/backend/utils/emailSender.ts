import { Resend } from "resend";
import {
  welcomeTemplate,
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
      subject: "Welcome to Cloud9Profile! 🚀",
      html: welcomeTemplate(name),
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
      subject: "Plan Upgraded Successfully! 🎉",
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
}

export const emailSender = new EmailSender();
export default EmailSender;
