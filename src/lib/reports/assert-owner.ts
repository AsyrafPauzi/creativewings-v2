import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function assertOrganizerOwnsCampaign(campaignId: string) {
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
    .select("id, title, slug, organizer_id, enable_school_sponsors")
    .eq("id", campaignId)
    .maybeSingle();

  if (!campaign || campaign.organizer_id !== org.id) notFound();

  return { supabase, user, organizerId: org.id, campaign };
}
