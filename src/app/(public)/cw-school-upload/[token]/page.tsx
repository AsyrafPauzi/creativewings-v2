import { notFound } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/server";
import { validateUploadToken } from "@/lib/schools/validate-upload-token";

import { PicUploadForm } from "./upload-form";

export default async function SchoolUploadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const ctx = await validateUploadToken(token);
  if (!ctx) notFound();

  const supabase = createAdminClient();

  const [{ data: customFields }, { data: ageBrackets }, { data: designVariants }] =
    await Promise.all([
      supabase
        .from("custom_fields")
        .select("*")
        .eq("campaign_id", ctx.campaign.id)
        .order("sort_order"),
      supabase
        .from("age_brackets")
        .select("*")
        .eq("campaign_id", ctx.campaign.id)
        .order("sort_order"),
      ctx.campaign.enable_design
        ? supabase
            .from("design_variants")
            .select("*")
            .eq("campaign_id", ctx.campaign.id)
            .eq("is_active", true)
            .order("sort_order")
        : Promise.resolve({ data: [] }),
    ]);

  const designMode = Boolean(
    ctx.campaign.enable_design && designVariants && designVariants.length > 0,
  );

  return (
    <div className="container max-w-2xl py-10">
      <PicUploadForm
        token={token}
        campaignTitle={ctx.campaign.title}
        schoolName={ctx.school.school_name}
        enableAgeBrackets={ctx.campaign.enable_age_brackets}
        ageBrackets={ageBrackets ?? []}
        customFields={customFields ?? []}
        enableDesign={ctx.campaign.enable_design}
        designMode={designMode}
        designVariants={designVariants ?? []}
        designPickerLabel={ctx.campaign.design_picker_label}
        designArtworkW={ctx.campaign.design_artwork_w}
        designArtworkH={ctx.campaign.design_artwork_h}
      />
    </div>
  );
}
