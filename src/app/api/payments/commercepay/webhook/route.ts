import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/payments/app-url";
import { verifyWebhookSignature } from "@/lib/payments/commercepay/verify-webhook";
import type { CommercePayWebhookPayload } from "@/lib/payments/commercepay/types";
import { fulfillPaymentOrder } from "@/lib/payments/fulfill-order";
import { getCommercePayConfig } from "@/lib/payments/settings";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("cap-signature") ?? "";
  const config = await getCommercePayConfig();

  if (!config) {
    return new Response("Payments not configured", { status: 503 });
  }

  const callbackUrl = `${getAppUrl()}/api/payments/commercepay/webhook`;
  if (!verifyWebhookSignature(callbackUrl, rawBody, signature, config.secretKey)) {
    return new Response("Invalid Signature!", { status: 400 });
  }

  const payload = JSON.parse(rawBody) as CommercePayWebhookPayload;
  await fulfillPaymentOrder({
    referenceCode: String(payload.referenceCode),
    transactionNumber: String(payload.transactionNumber),
    amountCents: Number(payload.amount),
    status: Number(payload.status),
  });

  return new Response("Receive OK", { status: 200 });
}

export async function GET() {
  return NextResponse.json({ ok: true, provider: "commercepay" });
}
