"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/log";
import { onCampaignPublished } from "@/lib/badges/hooks";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const { profile, user } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");
  return { user, profile };
}

export async function approveCampaignAction(campaignId: string) {
  const { user } = await requireAdmin();
  const supabase = createAdminClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, organizer_id, title, status")
    .eq("id", campaignId)
    .maybeSingle();

  if (!campaign || campaign.status !== "pending") return;

  await supabase
    .from("campaigns")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", campaignId);

  const { data: org } = await supabase
    .from("organizers")
    .select("owner_id")
    .eq("id", campaign.organizer_id)
    .maybeSingle();

  if (org?.owner_id) {
    await onCampaignPublished(org.owner_id);
  }

  await writeAuditLog({
    action: "campaign.approved",
    objectType: "campaign",
    objectId: campaignId,
    actorId: user.id,
    details: { title: campaign.title },
  });

  revalidatePath("/dashboard/admin/campaigns");
  revalidatePath("/campaigns");
}

export async function rejectCampaignAction(campaignId: string, note?: string) {
  const { user } = await requireAdmin();
  const supabase = createAdminClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, title, status")
    .eq("id", campaignId)
    .maybeSingle();

  if (!campaign || campaign.status !== "pending") return;

  await supabase.from("campaigns").update({ status: "draft" }).eq("id", campaignId);

  await writeAuditLog({
    action: "campaign.rejected",
    objectType: "campaign",
    objectId: campaignId,
    actorId: user.id,
    details: { title: campaign.title, note: note ?? null },
  });

  revalidatePath("/dashboard/admin/campaigns");
}

export async function transferCampaignAction(campaignId: string, newOrganizerId: string) {
  const { user } = await requireAdmin();
  const supabase = createAdminClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, title, organizer_id")
    .eq("id", campaignId)
    .maybeSingle();

  if (!campaign || campaign.organizer_id === newOrganizerId) return;

  const fromOrganizerId = campaign.organizer_id;

  await supabase
    .from("campaigns")
    .update({ organizer_id: newOrganizerId })
    .eq("id", campaignId);

  await writeAuditLog({
    action: "campaign.transferred",
    objectType: "campaign",
    objectId: campaignId,
    actorId: user.id,
    details: { from_organizer_id: fromOrganizerId, to_organizer_id: newOrganizerId },
  });

  revalidatePath("/dashboard/admin/campaigns");
  revalidatePath("/dashboard/campaigns");
}
