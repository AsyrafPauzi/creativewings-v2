import { notFound } from "next/navigation";
import QRCode from "qrcode";

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
    .select("id, title, organizer_id")
    .eq("id", campaignId)
    .maybeSingle();
  if (!campaign || campaign.organizer_id !== org.id) notFound();

  return { supabase, campaign };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, campaign } = await assertCampaignOwner(id);
  const appUrl = getAppUrl();

  const { data: rows } = await supabase
    .from("submissions")
    .select("submission_code, student_name")
    .eq("campaign_id", id)
    .eq("status", "staged")
    .eq("moderation_status", "approved")
    .not("submission_code", "is", null)
    .order("submission_code");

  const cards = await Promise.all(
    (rows ?? []).map(async (row) => {
      const code = row.submission_code ?? "";
      const claimUrl = `${appUrl}/claim?code=${encodeURIComponent(code)}`;
      const qr = await QRCode.toDataURL(claimUrl, { margin: 1, width: 200 });
      return `<div style="display:inline-block;width:220px;margin:12px;padding:12px;border:1px solid #ccc;text-align:center;page-break-inside:avoid">
        <img src="${qr}" alt="QR ${code}" width="200" height="200" />
        <div style="font-family:monospace;font-size:16px;font-weight:bold;margin-top:8px">${code}</div>
        <div style="font-size:12px;margin-top:4px">${row.student_name ?? ""}</div>
      </div>`;
    }),
  );

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>QR codes — ${campaign.title}</title>
<style>@media print { body { margin: 0; } }</style>
</head>
<body>
<h1>${campaign.title} — claim QR codes</h1>
<p style="font-size:12px;color:#666">Scan to open the claim page with the code prefilled.</p>
<div>${cards.join("")}</div>
</body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
