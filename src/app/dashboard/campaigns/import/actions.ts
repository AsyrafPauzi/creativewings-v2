"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { importCampaignJson } from "@/lib/campaigns/import-json";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function importCampaignAction(formData: FormData): Promise<{ error?: string } | void> {
  const { user } = await requireRole("organizer");
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("organizers")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!org) redirect("/dashboard/organizer");

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Please choose a JSON file." };
  }

  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: "Invalid JSON file." };
  }

  const result = await importCampaignJson(org.id, user.id, parsed);
  if (result.error) return { error: result.error };

  revalidatePath("/dashboard/campaigns");
  if (result.campaignId) {
    redirect(`/dashboard/campaigns/${result.campaignId}`);
  }
}
