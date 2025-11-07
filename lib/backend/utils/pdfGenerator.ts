import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    location: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

class PDFGenerator {
  async generateResumePDF(resumeData: ResumeData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          bufferPages: true
        });

        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header with name
        doc.fontSize(24).font('Helvetica-Bold').text(resumeData.personalInfo.name, { align: 'center' });
        doc.moveDown(0.5);

        // Contact information
        const contactInfo = [
          resumeData.personalInfo.email,
          resumeData.personalInfo.phone,
          resumeData.personalInfo.location
        ].filter(Boolean).join(' | ');

        doc.fontSize(10).font('Helvetica').text(contactInfo, { align: 'center' });

        if (resumeData.personalInfo.linkedin || resumeData.personalInfo.website) {
          const links = [
            resumeData.personalInfo.linkedin,
            resumeData.personalInfo.website
          ].filter(Boolean).join(' | ');
          doc.text(links, { align: 'center' });
        }

        doc.moveDown(1);

        // Summary
        if (resumeData.summary) {
          doc.fontSize(14).font('Helvetica-Bold').text('PROFESSIONAL SUMMARY');
          doc.moveDown(0.5);
          doc.fontSize(10).font('Helvetica').text(resumeData.summary);
          doc.moveDown(1);
        }

        // Experience
        if (resumeData.experience.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('PROFESSIONAL EXPERIENCE');
          doc.moveDown(0.5);

          resumeData.experience.forEach((exp, index) => {
            doc.fontSize(12).font('Helvetica-Bold').text(exp.title);
            doc.fontSize(10).font('Helvetica-Bold').text(exp.company);

            const dateRange = `${exp.startDate} - ${exp.endDate}`;
            doc.font('Helvetica').text(dateRange);

            doc.moveDown(0.3);
            doc.fontSize(10).text(exp.description);
            doc.moveDown(0.8);
          });
        }

        // Education
        if (resumeData.education.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('EDUCATION');
          doc.moveDown(0.5);

          resumeData.education.forEach((edu) => {
            doc.fontSize(12).font('Helvetica-Bold').text(edu.degree);
            doc.fontSize(10).font('Helvetica-Bold').text(edu.school);

            const eduInfo = [edu.location, edu.graduationDate].filter(Boolean).join(' | ');
            doc.font('Helvetica').text(eduInfo);

            if (edu.gpa) {
              doc.text(`GPA: ${edu.gpa}`);
            }

            doc.moveDown(0.5);
          });
        }

        // Skills
        if (resumeData.skills.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('SKILLS');
          doc.moveDown(0.5);
          doc.fontSize(10).font('Helvetica').text(resumeData.skills.join(' • '));
          doc.moveDown(1);
        }

        // Certifications
        if (resumeData.certifications && resumeData.certifications.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('CERTIFICATIONS');
          doc.moveDown(0.5);

          resumeData.certifications.forEach((cert) => {
            doc.fontSize(10).font('Helvetica-Bold').text(cert.name);
            doc.font('Helvetica').text(`${cert.issuer} | ${cert.date}`);
            doc.moveDown(0.3);
          });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generatePortfolioPDF(portfolioData: any): Promise<Buffer> {
    // Similar implementation for portfolio PDF generation
    // This would be more complex with images, layouts, etc.
    return this.generateResumePDF(portfolioData as ResumeData);
  }
}

export const pdfGenerator = new PDFGenerator();
export default PDFGenerator;