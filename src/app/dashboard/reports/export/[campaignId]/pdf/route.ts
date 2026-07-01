import { writeAuditLog } from "@/lib/audit/log";
import { getCampaignReport, getRosterRows } from "@/lib/reports/aggregate";
import { assertOrganizerOwnsCampaign } from "@/lib/reports/assert-owner";
import { buildReportPdf } from "@/lib/reports/export-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const { campaignId } = await params;
  const { user, campaign } = await assertOrganizerOwnsCampaign(campaignId);

  const report = await getCampaignReport(campaignId);
  const roster = await getRosterRows(campaignId, false);
  const buffer = await buildReportPdf(report, roster);
  const slug = campaign.slug || "campaign";

  await writeAuditLog({
    action: "report.exported",
    objectType: "campaign",
    objectId: campaignId,
    actorId: user.id,
    details: { format: "pdf" },
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slug}-report.pdf"`,
    },
  });
}
