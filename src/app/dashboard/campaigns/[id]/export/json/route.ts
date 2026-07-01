import { exportCampaignJson } from "@/lib/campaigns/export-json";
import { assertOrganizerOwnsCampaign } from "@/lib/reports/assert-owner";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { user, campaign } = await assertOrganizerOwnsCampaign(id);

  const payload = await exportCampaignJson(id, user.id);
  if (!payload) {
    return new Response("Not found", { status: 404 });
  }

  const slug = campaign.slug || "campaign";
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${slug}-export-v1.json"`,
    },
  });
}
