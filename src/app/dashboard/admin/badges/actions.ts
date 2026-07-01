"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { awardBadge, revokeBadge } from "@/lib/badges/engine";
import { requireUser } from "@/lib/auth";
import { createAdminClient, createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const { profile, user } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");
  return { user, profile };
}

export async function awardBadgeManualAction(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const badgeId = String(formData.get("badge_id") ?? "").trim();
  if (!email || !badgeId) return;

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (!profile) return;

  await awardBadge(profile.id, badgeId);
  revalidatePath("/dashboard/admin/badges");
}

export async function revokeBadgeManualAction(userId: string, badgeId: string) {
  await requireAdmin();
  await revokeBadge(userId, badgeId);
  revalidatePath("/dashboard/admin/badges");
}

export async function searchUserBadgesAction(email: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .ilike("email", email.trim())
    .maybeSingle();
  if (!profile) return null;

  const { data: earned } = await supabase
    .from("user_badges")
    .select("badge_id, awarded_at, badges:badge_id(id, slug, name)")
    .eq("user_id", profile.id);

  return { profile, earned: earned ?? [] };
}
