import DodoPayments from "dodopayments";

export const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment:
    (process.env.DODO_PAYMENTS_ENV as any) ||
    (process.env.NODE_ENV === "production" ? "live_mode" : "test_mode"),
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
});
