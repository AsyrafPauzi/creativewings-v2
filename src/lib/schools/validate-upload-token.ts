import { createAdminClient } from "@/lib/supabase/server";
import type { CampaignRow, SchoolRow, UploadTokenRow } from "@/lib/supabase/database.types";

export type UploadTokenContext = {
  token: UploadTokenRow;
  school: SchoolRow;
  campaign: Pick<
    CampaignRow,
    | "id"
    | "slug"
    | "title"
    | "status"
    | "enable_design"
    | "enable_age_brackets"
    | "design_picker_label"
    | "design_artwork_w"
    | "design_artwork_h"
  >;
};

export async function validateUploadToken(token: string): Promise<UploadTokenContext | null> {
  const supabase = createAdminClient();
  const { data: tokenRow } = await supabase
    .from("upload_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow) return null;
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) return null;
  if (!tokenRow.school_id) return null;

  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", tokenRow.school_id)
    .maybeSingle();
  if (!school) return null;

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, slug, title, status, enable_design, enable_age_brackets, design_picker_label, design_artwork_w, design_artwork_h")
    .eq("id", tokenRow.campaign_id)
    .maybeSingle();
  if (!campaign || campaign.status !== "published") return null;

  return { token: tokenRow, school, campaign };
}
