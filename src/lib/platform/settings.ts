import { createAdminClient } from "@/lib/supabase/server";

export async function getPlatformSettings() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("platform_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  return {
    require_campaign_approval: data?.require_campaign_approval ?? false,
  };
}

export async function setRequireCampaignApproval(enabled: boolean, actorId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("platform_settings")
    .upsert({
      id: "default",
      require_campaign_approval: enabled,
      updated_at: new Date().toISOString(),
      updated_by: actorId,
    });
}
