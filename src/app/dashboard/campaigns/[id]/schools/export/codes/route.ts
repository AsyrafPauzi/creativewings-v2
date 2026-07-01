import { notFound } from "next/navigation";

import { getAppUrl } from "@/lib/payments/app-url";
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
    .select("id, title, serial_code, organizer_id")
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
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, campaign } = await assertCampaignOwner(id);
  const format = new URL(request.url).searchParams.get("format") ?? "csv";

  const { data: rows } = await supabase
    .from("submissions")
    .select("submission_code, student_name, school_code, schools:school_id(school_name)")
    .eq("campaign_id", id)
    .eq("status", "staged")
    .eq("moderation_status", "approved")
    .not("submission_code", "is", null)
    .order("submission_code");

  const appUrl = getAppUrl();

  if (format === "html") {
    const items = (rows ?? [])
      .map((row) => {
        const school = Array.isArray(row.schools) ? row.schools[0] : row.schools;
        const code = row.submission_code ?? "";
        const claimUrl = `${appUrl}/claim?code=${encodeURIComponent(code)}`;
        return `<tr>
          <td style="padding:8px;border:1px solid #ccc;font-family:monospace;font-size:18px">${code}</td>
          <td style="padding:8px;border:1px solid #ccc">${row.student_name ?? ""}</td>
          <td style="padding:8px;border:1px solid #ccc">${school?.school_name ?? row.school_code ?? ""}</td>
          <td style="padding:8px;border:1px solid #ccc;font-size:12px">${claimUrl}</td>
        </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Submission codes — ${campaign.title}</title></head>
<body>
<h1>${campaign.title}${campaign.serial_code ? ` (${campaign.serial_code})` : ""}</h1>
<table style="border-collapse:collapse;width:100%">
<thead><tr>
<th style="padding:8px;border:1px solid #ccc">Code</th>
<th style="padding:8px;border:1px solid #ccc">Student</th>
<th style="padding:8px;border:1px solid #ccc">School</th>
<th style="padding:8px;border:1px solid #ccc">Claim URL</th>
</tr></thead>
<tbody>${items}</tbody>
</table>
</body></html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const header = ["submission_code", "student_name", "school_name", "claim_url"];
  const lines = [header.join(",")];

  for (const row of rows ?? []) {
    const school = Array.isArray(row.schools) ? row.schools[0] : row.schools;
    const code = row.submission_code ?? "";
    lines.push(
      [
        code,
        row.student_name ?? "",
        school?.school_name ?? row.school_code ?? "",
        `${appUrl}/claim?code=${encodeURIComponent(code)}`,
      ]
        .map((v) => csvEscape(String(v)))
        .join(","),
    );
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="codes-${campaign.title.replace(/\s+/g, "-").toLowerCase()}.csv"`,
    },
  });
}
