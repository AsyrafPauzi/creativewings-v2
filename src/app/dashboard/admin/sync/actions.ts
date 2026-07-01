"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/log";
import { evaluateBadgesForUser } from "@/lib/badges/engine";
import { compositeMockup } from "@/lib/design/composite-mockup";
import { loadDesignVariant } from "@/lib/design/load-variant";
import { persistSubmissionMockup } from "@/lib/design/persist-mockup";
import { requireUser } from "@/lib/auth";
import { syncSchoolCoupon } from "@/lib/schools/sync-school-coupon";
import { createAdminClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const { profile, user } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");
  return user;
}

export async function syncBadgeReevalAction(): Promise<{ processed: number; awarded: number }> {
  const actor = await requireAdmin();
  const supabase = createAdminClient();

  const { data: profiles } = await supabase.from("profiles").select("id").limit(500);
  let awarded = 0;

  for (const p of profiles ?? []) {
    const slugs = await evaluateBadgesForUser(p.id);
    awarded += slugs.length;
  }

  await writeAuditLog({
    action: "sync.badge_reeval",
    objectType: "platform",
    actorId: actor.id,
    details: { processed: profiles?.length ?? 0, awarded },
  });

  revalidatePath("/dashboard/admin/sync");
  return { processed: profiles?.length ?? 0, awarded };
}

export async function syncCouponsAction(campaignId: string): Promise<{ synced: number }> {
  const actor = await requireAdmin();
  const supabase = createAdminClient();

  const { data: schools } = await supabase
    .from("schools")
    .select("id, coupon_code")
    .eq("campaign_id", campaignId)
    .not("coupon_code", "is", null);

  let synced = 0;
  for (const s of schools ?? []) {
    if (s.coupon_code) {
      await syncSchoolCoupon({ schoolId: s.id, campaignId, code: s.coupon_code });
      synced += 1;
    }
  }

  await writeAuditLog({
    action: "sync.coupons",
    objectType: "campaign",
    objectId: campaignId,
    actorId: actor.id,
    details: { synced },
  });

  revalidatePath("/dashboard/admin/sync");
  return { synced };
}

export async function syncTokensAction(campaignId: string): Promise<{ extended: number }> {
  const actor = await requireAdmin();
  const supabase = createAdminClient();

  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + 90);

  const { data: tokens } = await supabase
    .from("upload_tokens")
    .select("id")
    .eq("campaign_id", campaignId);

  if (tokens && tokens.length > 0) {
    await supabase
      .from("upload_tokens")
      .update({ expires_at: newExpiry.toISOString() })
      .eq("campaign_id", campaignId);
  }

  await writeAuditLog({
    action: "sync.tokens",
    objectType: "campaign",
    objectId: campaignId,
    actorId: actor.id,
    details: { extended: tokens?.length ?? 0, expires_at: newExpiry.toISOString() },
  });

  revalidatePath("/dashboard/admin/sync");
  return { extended: tokens?.length ?? 0 };
}

export async function regenerateMockupsAction(campaignId: string): Promise<{ regenerated: number }> {
  const actor = await requireAdmin();
  const supabase = createAdminClient();

  const { data: subs } = await supabase
    .from("submissions")
    .select("id, artwork_url, design_variant, mockup_url")
    .eq("campaign_id", campaignId)
    .is("mockup_url", null)
    .not("artwork_url", "is", null)
    .not("design_variant", "is", null)
    .limit(50);

  let regenerated = 0;

  for (const sub of subs ?? []) {
    if (!sub.artwork_url || !sub.design_variant) continue;
    const variant = await loadDesignVariant(campaignId, sub.design_variant);
    if (!variant) continue;
    const artRes = await fetch(sub.artwork_url);
    if (!artRes.ok) continue;
    const buffer = Buffer.from(await artRes.arrayBuffer());
    const composite = await compositeMockup({
      mockupUrl: variant.mockup_image_url,
      artworkBuffer: buffer,
      printArea: {
        x: Number(variant.print_area_x),
        y: Number(variant.print_area_y),
        w: Number(variant.print_area_w),
        h: Number(variant.print_area_h),
      },
    });
    await persistSubmissionMockup(sub.id, campaignId, composite);
    regenerated += 1;
  }

  await writeAuditLog({
    action: "sync.mockups",
    objectType: "campaign",
    objectId: campaignId,
    actorId: actor.id,
    details: { regenerated },
  });

  revalidatePath("/dashboard/admin/sync");
  return { regenerated };
}
