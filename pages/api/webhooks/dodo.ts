import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { dodoClient } from "../../../lib/payments/dodo";
import { PLAN_LIMITS } from "../../../lib/subscription";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client for restricted operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const config = {
  api: {
    bodyParser: false, // Need raw body for webhook verification
  },
};

async function getRawBody(req: NextApiRequest) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = await getRawBody(req);
    const bodyString = rawBody.toString();

    // Verify Webhook Signature
    const event = dodoClient.webhooks.unwrap(bodyString, {
      headers: {
        "webhook-id": req.headers["webhook-id"] as string,
        "webhook-signature": req.headers["webhook-signature"] as string,
        "webhook-timestamp": req.headers["webhook-timestamp"] as string,
      },
    });

    console.log("Dodo Webhook received:", event.type);

    // Business Logic for fulfillment
    if (
      event.type === "subscription.active" ||
      event.type === "payment.succeeded"
    ) {
      const data = event.data as any;
      const metadata = data.metadata || {};
      const userId = metadata.userId;
      const planId = metadata.planId || "professional";

      if (!userId) {
        console.error("No userId in webhook metadata");
        return res
          .status(200)
          .json({ received: true, warning: "missing_user_id" });
      }

      // fulfillment
      const planMap: { [key: string]: number } = {
        free: 1,
        professional: 3,
        premium: 5,
        enterprise: 10,
      };

      const numericPlanId = planMap[planId] || 3;

      // Get current credits and update
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("credits, plan")
        .eq("id", userId)
        .single();

      const existingCredits = profile?.credits || 0;

      // Credit allocation mapping
      const creditMap: { [key: string]: number } = {
        professional: 200,
        premium: 500,
        credits_addon: 100,
      };

      const creditsToAdd = creditMap[planId] || 0;
      const isAddon = planId === "credits_addon";

      const updateData: any = {
        credits: existingCredits + creditsToAdd,
        updated_at: new Date().toISOString(),
        dodo_customer_id: data.customer?.customer_id,
        dodo_subscription_id: data.subscription_id || null,
      };

      if (!isAddon) {
        updateData.plan_id = numericPlanId;
        updateData.plan = planId;
      }

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (updateError) {
        console.error("Failed to update profile via webhook:", updateError);
        return res.status(500).json({ error: "DB Update Failed" });
      }

      // Log usage/payment
      await supabaseAdmin.from("credit_usage").insert({
        user_id: userId,
        action: `payment_${event.type}`,
        credits_used: -creditsToAdd,
        description: `Dodo Payment Fulfillment: ${planId}`,
      });
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook Handler Error:", error.message);
    return res
      .status(400)
      .json({ error: "Webhook Error", message: error.message });
  }
}
