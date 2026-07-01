"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/log";
import { requireUser } from "@/lib/auth";
import { setRequireCampaignApproval } from "@/lib/platform/settings";

async function requireAdmin() {
  const { profile, user } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");
  return user;
}

export async function toggleCampaignApprovalAction(enabled: boolean) {
  const user = await requireAdmin();
  await setRequireCampaignApproval(enabled, user.id);

  await writeAuditLog({
    action: "platform.settings_updated",
    objectType: "platform_settings",
    actorId: user.id,
    details: { require_campaign_approval: enabled },
  });

  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/dashboard/admin/campaigns");
}
