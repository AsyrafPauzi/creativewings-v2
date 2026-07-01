"use server";

import { revalidatePath } from "next/cache";

import {
  syncCampaignChildren,
  type AgeBracketInput,
  type CustomFieldInput,
  type FaqInput,
  type PrizeInput,
} from "@/lib/campaigns/sync-children";
import { createClient } from "@/lib/supabase/server";
import { extFromMime, randomStorageName, uploadPublicFile } from "@/lib/storage/upload";
import type { CWFieldType } from "@/lib/supabase/database.types";

export interface ChildrenFormState {
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

  return { supabase, campaign, organizerId: org.id };
}

function parseJson<T>(raw: FormDataEntryValue | null, fallback: T): T {
  const s = String(raw ?? "").trim();
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export async function saveCampaignChildrenAction(
  campaignId: string,
  _prev: ChildrenFormState,
  formData: FormData,
): Promise<ChildrenFormState> {
  try {
    const { supabase, campaign } = await assertCampaignOwner(campaignId);

    const prizes = parseJson<PrizeInput[]>(formData.get("prizes_json"), []);
    const faq = parseJson<FaqInput[]>(formData.get("faq_json"), []);
    const ageBrackets = parseJson<AgeBracketInput[]>(formData.get("age_brackets_json"), []);
    const customFields = parseJson<CustomFieldInput[]>(formData.get("custom_fields_json"), []);

    for (const p of prizes) {
      if (!p.title?.trim()) return { error: "Each prize needs a title." };
    }
    for (const f of faq) {
      if (!f.question?.trim() || !f.answer?.trim()) {
        return { error: "Each FAQ needs a question and answer." };
      }
    }
    for (const b of ageBrackets) {
      if (!b.label?.trim() || !b.key?.trim()) {
        return { error: "Each age bracket needs a label." };
      }
      if (b.min_age > b.max_age) {
        return { error: `Age bracket "${b.label}" has invalid age range.` };
      }
    }
    for (const f of customFields) {
      if (!f.label?.trim()) return { error: "Each custom field needs a label." };
    }

    await syncCampaignChildren(supabase, campaignId, {
      prizes: prizes.map((p, i) => ({ ...p, title: p.title.trim(), sort_order: i })),
      faq: faq.map((f, i) => ({ ...f, sort_order: i })),
      ageBrackets: ageBrackets.map((b, i) => ({ ...b, sort_order: i })),
      customFields: customFields.map((f, i) => ({
        ...f,
        label: f.label.trim(),
        field_type: f.field_type as CWFieldType,
        sort_order: i,
      })),
    });

    revalidatePath(`/dashboard/campaigns/${campaignId}`);
    revalidatePath(`/campaigns/${campaign.slug}`);
    return { success: "Campaign details saved." };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function uploadCampaignMediaAction(
  campaignId: string,
  _prev: ChildrenFormState,
  formData: FormData,
): Promise<ChildrenFormState> {
  try {
    const { supabase, campaign, organizerId } = await assertCampaignOwner(campaignId);

    const updates: Record<string, string> = {};
    const bannerFile = formData.get("banner_file");
    const heroFile = formData.get("hero_file");

    if (bannerFile instanceof File && bannerFile.size > 0) {
      const ext = extFromMime(bannerFile.type) || ".jpg";
      updates.banner_url = await uploadPublicFile({
        bucket: "banners",
        path: `${organizerId}/${randomStorageName(ext)}`,
        file: bannerFile,
      });
    }
    if (heroFile instanceof File && heroFile.size > 0) {
      const ext = extFromMime(heroFile.type) || ".jpg";
      updates.hero_url = await uploadPublicFile({
        bucket: "banners",
        path: `${organizerId}/${randomStorageName(ext)}`,
        file: heroFile,
      });
    }

    if (Object.keys(updates).length === 0) {
      return { error: "Choose a banner or hero image to upload." };
    }

    const { error } = await supabase.from("campaigns").update(updates).eq("id", campaignId);
    if (error) return { error: error.message };

    revalidatePath(`/dashboard/campaigns/${campaignId}`);
    revalidatePath(`/campaigns/${campaign.slug}`);
    return { success: "Images updated." };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
