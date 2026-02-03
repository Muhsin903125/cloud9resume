import { NextApiRequest, NextApiResponse } from "next";
import { dodoClient } from "../../../lib/payments/dodo";
import jwt from "jsonwebtoken";

// Helper to get token from header
function getTokenFromHeader(req: NextApiRequest): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.substring(7);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { productId, planId, discountCode } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.decode(token) as any;
    const userId = decoded?.sub || decoded?.userId;
    const userEmail = decoded?.email;
    const userName = decoded?.name || "User";

    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Determine which discount code to use
    // Priority: Custom coupon > Professional trial code
    let finalDiscountCode = discountCode;

    // Fallback to professional trial if no custom coupon provided
    if (!finalDiscountCode && planId === "professional") {
      finalDiscountCode = process.env.DODO_TRIAL_DISCOUNT_CODE || "TRIAL50";
    }

    const session = await dodoClient.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      customer: {
        email: userEmail,
        name: userName,
      },
      return_url: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/dashboard?payment=success`,
      discount_code: finalDiscountCode || undefined,
      metadata: {
        userId: userId,
        planId: planId || "professional",
      },
    });

    return res.status(200).json({
      url: session.checkout_url,
    });
  } catch (error: any) {
    console.error("Dodo Create Checkout Error:", error);
    return res.status(500).json({
      error: "Failed to create checkout session",
      message: error.message,
    });
  }
}
