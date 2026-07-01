import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ submissionId: string }> },
) {
  const { submissionId } = await params;
  const { user, profile } = await requireUser();
  const admin = createAdminClient();

  const { data: sub } = await admin
    .from("submissions")
    .select("id, mockup_url, contestant_id, campaign_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (!sub?.mockup_url) {
    return NextResponse.json({ error: "Mockup not found" }, { status: 404 });
  }

  if (!profile.is_admin && sub.contestant_id !== user.id) {
    const { data: campaign } = await admin
      .from("campaigns")
      .select("organizer_id, organizers:organizer_id(owner_id)")
      .eq("id", sub.campaign_id)
      .maybeSingle();
    const org = campaign?.organizers
      ? Array.isArray(campaign.organizers)
        ? campaign.organizers[0]
        : campaign.organizers
      : null;
    if (org?.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.redirect(sub.mockup_url);
}
