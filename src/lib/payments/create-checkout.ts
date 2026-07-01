import { headers } from "next/headers";

import { getAppUrl } from "@/lib/payments/app-url";
import { requestPayment } from "@/lib/payments/commercepay/client";
import { buildReferenceCode } from "@/lib/payments/reference-code";
import { getCommercePayConfig } from "@/lib/payments/settings";
import { createClient } from "@/lib/supabase/server";

export async function startCommercePayCheckout(opts: {
  submissionId: string;
  campaignId: string;
  campaignTitle: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  amount: number;
  currency: string;
  couponId?: string | null;
}) {
  const supabase = await createClient();
  const config = await getCommercePayConfig();
  if (!config) {
    throw new Error("Payments are not configured yet. Please try again later.");
  }

  const amountCents = Math.round(opts.amount * 100);
  const { data: order, error: orderErr } = await supabase
    .from("payment_orders")
    .insert({
      reference_code: buildReferenceCode(crypto.randomUUID()),
      submission_id: opts.submissionId,
      campaign_id: opts.campaignId,
      user_id: opts.userId,
      amount_cents: amountCents,
      currency: opts.currency || config.currency,
      sponsor_coupon_id: opts.couponId ?? null,
    })
    .select("id, reference_code")
    .single();

  if (orderErr || !order) {
    throw new Error(orderErr?.message ?? "Could not create payment order.");
  }

  const referenceCode = buildReferenceCode(order.id);
  await supabase
    .from("payment_orders")
    .update({ reference_code: referenceCode })
    .eq("id", order.id);

  await supabase
    .from("submissions")
    .update({ payment_order_id: order.id })
    .eq("id", opts.submissionId);

  const hdrs = await headers();
  const ipAddress = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
  const userAgent = hdrs.get("user-agent") ?? "CreativeWings/1.0";
  const appUrl = getAppUrl();

  const { redirectUrl } = await requestPayment(config, {
    amount: amountCents,
    callbackUrl: `${appUrl}/api/payments/commercepay/webhook`,
    currencyCode: config.currency,
    customer: {
      email: opts.userEmail,
      mobileNo: opts.userPhone || "0000000000",
      name: opts.userName,
      username: opts.userName,
    },
    description: `Entry: ${opts.campaignTitle}`.slice(0, 500),
    ipAddress,
    referenceCode,
    returnUrl: `${appUrl}/api/payments/commercepay/return`,
    tenantId: Number(config.tenantId),
    timestamp: Math.floor(Date.now() / 1000),
    userAgent,
  });

  return redirectUrl;
}
