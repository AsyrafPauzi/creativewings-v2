import { writeAuditLog } from "@/lib/audit/log";
import { getRosterRows } from "@/lib/reports/aggregate";
import { assertOrganizerOwnsCampaign } from "@/lib/reports/assert-owner";
import { buildRosterCsv } from "@/lib/reports/csv-roster";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const { campaignId } = await params;
  const { user, campaign } = await assertOrganizerOwnsCampaign(campaignId);

  const url = new URL(request.url);
  const includeStaged =
    campaign.enable_school_sponsors && url.searchParams.get("include_staged") === "1";

  const rows = await getRosterRows(campaignId, includeStaged);
  const csv = buildRosterCsv(rows);
  const slug = campaign.slug || "campaign";

  await writeAuditLog({
    action: "report.exported",
    objectType: "campaign",
    objectId: campaignId,
    actorId: user.id,
    details: { format: "csv", include_staged: includeStaged },
  });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-roster.csv"`,
    },
  });
}
