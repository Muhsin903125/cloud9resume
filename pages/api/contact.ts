import { NextApiRequest, NextApiResponse } from "next";
import { emailSender } from "../../lib/backend/utils/emailSender";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await emailSender.sendContactEmail(
      name,
      email,
      subject || "General Inquiry",
      message
    );

    return res.status(200).json({ message: "Message sent successfully" });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return res
      .status(500)
      .json({ message: "Failed to send message", error: error.message });
  }
}
