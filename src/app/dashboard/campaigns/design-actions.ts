"use server";

import { revalidatePath } from "next/cache";

import { syncDesignVariants, type DesignVariantInput } from "@/lib/design/sync-variants";
import { createClient } from "@/lib/supabase/server";
import { extFromMime, randomStorageName, uploadPublicFile } from "@/lib/storage/upload";
import { slugify } from "@/lib/utils";

export interface DesignFormState {
  error?: string;
  success?: string;
}

async function assertCampaignOwner(campaignId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: org } = await supabase
    .from("organizers")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!org) throw new Error("Organizer profile required.");

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, slug, organizer_id")
    .eq("id", campaignId)
    .maybeSingle();
  if (!campaign || campaign.organizer_id !== org.id) {
    throw new Error("Campaign not found.");
  }

  return { supabase, campaign };
}

function parseVariants(raw: FormDataEntryValue | null): DesignVariantInput[] {
  const s = String(raw ?? "").trim();
  if (!s) return [];
  try {
    return JSON.parse(s) as DesignVariantInput[];
  } catch {
    return [];
  }
}

export async function saveDesignConfigAction(
  campaignId: string,
  _prev: DesignFormState,
  formData: FormData,
): Promise<DesignFormState> {
  try {
    const { supabase } = await assertCampaignOwner(campaignId);

    const variants = parseVariants(formData.get("variants_json"));
    for (const v of variants) {
      if (!v.label?.trim()) return { error: "Each variant needs a label." };
      if (!v.mockup_image_url?.trim()) return { error: "Each variant needs a mockup image." };
      if (!v.slug?.trim()) v.slug = slugify(v.label);
    }

    await syncDesignVariants(supabase, campaignId, variants);

    revalidatePath(`/dashboard/campaigns/${campaignId}`);
    return { success: "Design variants saved." };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function uploadVariantMockupAction(
  campaignId: string,
  _prev: DesignFormState,
  formData: FormData,
): Promise<DesignFormState & { url?: string }> {
  try {
    await assertCampaignOwner(campaignId);
    const file = formData.get("mockup_file");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Choose a mockup image." };
    }

    const ext = extFromMime(file.type) || ".png";
    const url = await uploadPublicFile({
      bucket: "banners",
      path: `${campaignId}/mockups/${randomStorageName(ext)}`,
      file,
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    });

    return { success: "Uploaded.", url };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
