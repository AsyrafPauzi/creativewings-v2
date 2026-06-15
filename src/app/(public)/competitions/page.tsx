import { CampaignsGrid } from "@/components/site/campaigns-grid";
import type { CampaignCardData } from "@/components/site/campaign-card";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Competitions" };
export const revalidate = 60;

export default async function CompetitionsPage() {
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      "id, slug, title, short_description, banner_url, category, type, status, entry_fee, currency, submission_start, submission_deadline, sdg_goals, organizer:organizer_id(business_name, slug, logo_url)",
    )
    .eq("type", "competition")
    .in("status", ["published", "closed"])
    .order("submission_deadline", { ascending: true });

  const cards: CampaignCardData[] = (campaigns ?? []).map((c) => ({
    ...c,
    organizer: Array.isArray(c.organizer) ? c.organizer[0] : c.organizer,
  }));

  return (
    <div className="container py-14">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Competitions</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Judged campaigns with prize pools — submit your work and let the judges decide.
        </p>
      </header>
      <div className="mt-12">
        <CampaignsGrid
          campaigns={cards}
          emptyBody="No competitions are running right now. Check back soon!"
        />
      </div>
    </div>
  );
}
