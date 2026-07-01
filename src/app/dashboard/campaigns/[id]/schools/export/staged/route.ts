import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
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
    .select("id, title, organizer_id")
    .eq("id", campaignId)
    .maybeSingle();
  if (!campaign || campaign.organizer_id !== org.id) notFound();

  return { supabase, campaign };
}

function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, campaign } = await assertCampaignOwner(id);

  const { data: rows } = await supabase
    .from("submissions")
    .select("submission_code, student_name, school_code, status, moderation_status, created_at, guardian_email, schools:school_id(school_name)")
    .eq("campaign_id", id)
    .eq("status", "staged")
    .order("created_at", { ascending: false });

  const header = [
    "submission_code",
    "student_name",
    "school_name",
    "status",
    "moderation_status",
    "created_at",
    "guardian_email",
  ];
  const lines = [header.join(",")];

  for (const row of rows ?? []) {
    const school = Array.isArray(row.schools) ? row.schools[0] : row.schools;
    lines.push(
      [
        row.submission_code ?? "",
        row.student_name ?? "",
        school?.school_name ?? row.school_code ?? "",
        row.status,
        row.moderation_status,
        row.created_at,
        row.guardian_email ?? "",
      ]
        .map((v) => csvEscape(String(v)))
        .join(","),
    );
  }

  const body = lines.join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="staged-${campaign.title.replace(/\s+/g, "-").toLowerCase()}.csv"`,
    },
  });
}
