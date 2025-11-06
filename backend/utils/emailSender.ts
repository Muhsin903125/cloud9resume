import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailSender {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@cloud9resume.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendATSAnalysisReport(email: string, analysis: any): Promise<void> {
    const subject = 'Your ATS Analysis Report - Cloud9 Resume';
    const html = this.generateATSReportHTML(analysis);

    await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  private generateATSReportHTML(analysis: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>ATS Analysis Report</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .score { font-size: 48px; font-weight: bold; color: #2563eb; }
            .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .recommendations { background: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; }
            .issue { color: #dc2626; }
            .warning { color: #d97706; }
            .success { color: #16a34a; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Cloud9 Resume</h1>
            <h2>ATS Analysis Report</h2>
          </div>

          <div class="section">
            <h3>Overall ATS Score</h3>
            <div class="score">${analysis.score}/100</div>
          </div>

          <div class="section">
            <h3>Key Issues Found</h3>
            <ul>
              ${analysis.issues.map((issue: any) => `<li class="issue">${issue}</li>`).join('')}
            </ul>
          </div>

          <div class="section">
            <h3>Recommendations</h3>
            <div class="recommendations">
              <ul>
                ${analysis.recommendations.map((rec: any) => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="section">
            <h3>Keywords Found</h3>
            <p><strong>Present:</strong> ${analysis.keywords.present.join(', ')}</p>
            <p><strong>Missing:</strong> ${analysis.keywords.missing.join(', ')}</p>
          </div>
        </body>
      </html>
    `;
  }
}

export const emailSender = new EmailSender();
export default EmailSender;