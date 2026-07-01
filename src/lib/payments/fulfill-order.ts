import { onSubmissionPaid } from "@/lib/badges/hooks";
import { sendPaymentAccessEmail } from "@/lib/email/send-payment-access";
import { getCommercePayConfig } from "@/lib/payments/settings";
import { incrementCouponUse } from "@/lib/payments/coupons";
import { queryPayment } from "@/lib/payments/commercepay/client";
import { createAdminClient } from "@/lib/supabase/server";

export async function fulfillFreeSubmission(opts: {
  submissionId: string;
  campaignId: string;
  userId: string;
  couponId?: string | null;
}) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("submissions")
    .update({
      status: "paid",
      paid_at: now,
      payment_provider: opts.couponId ? "sponsor_coupon" : "free",
      sponsor_coupon_id: opts.couponId ?? null,
    })
    .eq("id", opts.submissionId);

  if (error) throw new Error(error.message);

  if (opts.couponId) {
    await incrementCouponUse(opts.couponId);
  }

  await supabase.from("audit_log").insert({
    action: "submission.paid",
    object_type: "submission",
    object_id: opts.submissionId,
    actor_id: opts.userId,
    details: { method: opts.couponId ? "coupon" : "free" },
  });

  await sendPaymentAccessEmail(opts.submissionId);

  await onSubmissionPaid(opts.userId, opts.campaignId);
}

export async function fulfillPaymentOrder(opts: {
  referenceCode: string;
  transactionNumber: string;
  amountCents: number;
  status: number;
}) {
  if (opts.status !== 1) {
    return { ok: false as const, reason: "payment_not_success" };
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("payment_orders")
    .select("*")
    .eq("reference_code", opts.referenceCode)
    .maybeSingle();

  if (!order) return { ok: false as const, reason: "order_not_found" };
  if (order.status === "paid") return { ok: true as const, alreadyPaid: true };

  const config = await getCommercePayConfig();
  if (!config) return { ok: false as const, reason: "config_missing" };

  const query = await queryPayment(config, opts.transactionNumber);
  if (query.result?.status !== 1) {
    return { ok: false as const, reason: "query_not_paid" };
  }

  const now = new Date().toISOString();

  await supabase
    .from("payment_orders")
    .update({
      status: "paid",
      transaction_number: opts.transactionNumber,
      paid_at: now,
    })
    .eq("id", order.id);

  await supabase
    .from("submissions")
    .update({
      status: "paid",
      paid_at: now,
      payment_order_id: order.id,
      payment_provider: "commercepay",
      payment_transaction_number: opts.transactionNumber,
      sponsor_coupon_id: order.sponsor_coupon_id,
    })
    .eq("id", order.submission_id);

  if (order.sponsor_coupon_id) {
    await incrementCouponUse(order.sponsor_coupon_id);
  }

  await supabase.from("audit_log").insert({
    action: "payment.completed",
    object_type: "payment_order",
    object_id: order.id,
    actor_id: order.user_id,
    details: {
      reference_code: opts.referenceCode,
      transaction_number: opts.transactionNumber,
      amount_cents: opts.amountCents,
    },
  });

  await sendPaymentAccessEmail(order.submission_id);

  await onSubmissionPaid(order.user_id, order.campaign_id);

  return { ok: true as const, submissionId: order.submission_id };
}
