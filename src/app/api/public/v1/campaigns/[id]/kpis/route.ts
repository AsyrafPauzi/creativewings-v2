import { NextResponse } from "next/server";

import { assertApiCampaignAccess, validateApiKey } from "@/lib/api/validate-api-key";
import { getCampaignReport } from "@/lib/reports/aggregate";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await validateApiKey(request, "read_kpis");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: campaignId } = await params;
  const allowed = await assertApiCampaignAccess(auth.organizerId, campaignId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const report = await getCampaignReport(campaignId);

  return NextResponse.json({
    campaign_id: campaignId,
    submissions_count: report.totals.submissions,
    paid_count: report.totals.paid,
    revenue_total: report.totals.revenue,
    vote_total: report.totals.votes,
    by_status: report.byStatus,
    by_day: report.participantsByDay,
    revenue_by_day: report.revenueByDay,
  });
}
