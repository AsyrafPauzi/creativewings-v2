import { notFound } from "next/navigation";

import { CampaignReportPicker } from "@/components/reports/campaign-report-picker";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth";
import { getCampaignReport } from "@/lib/reports/aggregate";
import { assertOrganizerOwnsCampaign } from "@/lib/reports/assert-owner";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Reports" };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { user } = await requireRole("organizer");
  const supabase = await createClient();
  const { campaign: campaignParam } = await searchParams;

  const { data: org } = await supabase
    .from("organizers")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!org) notFound();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, status")
    .eq("organizer_id", org.id)
    .order("created_at", { ascending: false });

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="space-y-4">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-body">Reports</h1>
          <p className="text-text-secondary">Create a campaign first to view reports.</p>
        </header>
      </div>
    );
  }

  const selectedId =
    campaignParam && campaigns.some((c) => c.id === campaignParam)
      ? campaignParam
      : campaigns.find((c) => c.status === "published")?.id ?? campaigns[0].id;

  await assertOrganizerOwnsCampaign(selectedId);
  const report = await getCampaignReport(selectedId);
  const selected = campaigns.find((c) => c.id === selectedId)!;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Organizer</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-body">Reports</h1>
          <p className="text-text-secondary">
            KPIs, charts, and exports for {selected.title}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="capitalize">{selected.status}</Badge>
          <CampaignReportPicker campaigns={campaigns} selectedId={selectedId} />
        </div>
      </header>

      <ReportsDashboard report={report} />
    </div>
  );
}
