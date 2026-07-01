import { createAdminClient } from "@/lib/supabase/server";

export async function loadDesignVariant(campaignId: string, slug: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("design_variants")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data;
}

export async function loadActiveDesignVariants(campaignId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("design_variants")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}
