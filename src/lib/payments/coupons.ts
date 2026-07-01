import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export type ValidatedCoupon = {
  id: string;
  coversFullFee: boolean;
};

export async function validateCoupon(
  code: string | null | undefined,
  campaignId: string,
): Promise<ValidatedCoupon | null> {
  const trimmed = String(code ?? "").trim();
  if (!trimmed) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("sponsor_coupons")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("code", trimmed)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) throw new Error("Invalid coupon code.");
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    throw new Error("This coupon has expired.");
  }
  if (data.max_uses > 0 && data.used_count >= data.max_uses) {
    throw new Error("This coupon has reached its usage limit.");
  }

  return { id: data.id, coversFullFee: true };
}

export async function resolveSchoolCoupon(campaignId: string, schoolId: string | null) {
  if (!schoolId) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("sponsor_coupons")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  if (data.max_uses > 0 && data.used_count >= data.max_uses) return null;

  return { id: data.id, coversFullFee: true };
}

export async function incrementCouponUse(couponId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("sponsor_coupons")
    .select("used_count")
    .eq("id", couponId)
    .single();
  if (!data) return;
  await supabase
    .from("sponsor_coupons")
    .update({ used_count: data.used_count + 1 })
    .eq("id", couponId);
}
