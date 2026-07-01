import { sendBadgeEarnedEmail } from "@/lib/email/send-badge-earned";
import { rulePasses } from "@/lib/badges/rules";
import { createAdminClient } from "@/lib/supabase/server";

export async function awardBadge(
  userId: string,
  badgeId: string,
  campaignId?: string | null,
): Promise<boolean> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_id", badgeId)
    .maybeSingle();

  if (existing) return false;

  const { error } = await supabase.from("user_badges").insert({
    user_id: userId,
    badge_id: badgeId,
    campaign_id: campaignId ?? null,
  });

  if (error) return false;

  const { data: badge } = await supabase.from("badges").select("slug, name").eq("id", badgeId).maybeSingle();
  if (badge) {
    await sendBadgeEarnedEmail(userId, badge.name, badge.slug);
  }

  await supabase.from("audit_log").insert({
    action: "badge.awarded",
    object_type: "user_badge",
    actor_id: userId,
    details: { badge_id: badgeId, campaign_id: campaignId ?? null },
  });

  return true;
}

export async function revokeBadge(userId: string, badgeId: string) {
  const supabase = createAdminClient();
  await supabase.from("user_badges").delete().eq("user_id", userId).eq("badge_id", badgeId);
  await supabase.from("audit_log").insert({
    action: "badge.revoked",
    object_type: "user_badge",
    actor_id: userId,
    details: { badge_id: badgeId },
  });
}

export async function evaluateBadgesForUser(userId: string, campaignId?: string) {
  const supabase = createAdminClient();
  const { data: rules } = await supabase
    .from("badge_rules")
    .select("badge_id, rule_type, threshold, badges:badge_id(slug)")
    .eq("is_active", true);

  const newlyAwarded: string[] = [];

  for (const rule of rules ?? []) {
    const badge = Array.isArray(rule.badges) ? rule.badges[0] : rule.badges;
    const passed = await rulePasses(rule.rule_type, rule.threshold, userId);
    if (!passed) continue;
    const isNew = await awardBadge(userId, rule.badge_id, campaignId);
    if (isNew && badge?.slug) newlyAwarded.push(badge.slug);
  }

  return newlyAwarded;
}

export async function markBadgesNotified(userId: string, badgeSlugs: string[]) {
  if (badgeSlugs.length === 0) return;
  const supabase = createAdminClient();
  const { data: badges } = await supabase.from("badges").select("id, slug").in("slug", badgeSlugs);
  const ids = (badges ?? []).map((b) => b.id);
  if (ids.length === 0) return;
  await supabase
    .from("user_badges")
    .update({ notified_at: new Date().toISOString() })
    .eq("user_id", userId)
    .in("badge_id", ids)
    .is("notified_at", null);
}
