"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import { layoutFromFormData } from "@/lib/certificates/layout";
import { requireRole } from "@/lib/auth";
import { extFromMime, randomStorageName, uploadPublicFile } from "@/lib/storage/upload";
import { createClient } from "@/lib/supabase/server";

async function assertCampaignOwner(campaignId: string) {
  await requireRole("organizer");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: org } = await supabase
    .from("organizers")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!org) notFound();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, organizer_id")
    .eq("id", campaignId)
    .maybeSingle();
  if (!campaign || campaign.organizer_id !== org.id) notFound();

  return supabase;
}

export async function saveCertificateSettingsAction(campaignId: string, formData: FormData) {
  const supabase = await assertCampaignOwner(campaignId);

  const layout = layoutFromFormData(formData);
  const payload: Record<string, unknown> = { certificate_layout: layout };

  const template = formData.get("template");
  if (template instanceof File && template.size > 0) {
    const ext = extFromMime(template.type) || ".png";
    const url = await uploadPublicFile({
      bucket: "artworks",
      path: `${campaignId}/certificate-${randomStorageName(ext)}`,
      file: template,
    });
    payload.certificate_template_url = url;
  }

  await supabase.from("campaigns").update(payload).eq("id", campaignId);

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  revalidatePath(`/dashboard/campaigns/${campaignId}/certificates`);
}
