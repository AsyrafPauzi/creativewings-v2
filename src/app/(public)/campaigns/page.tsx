import Link from "next/link";

import { CampaignsGrid } from "@/components/site/campaigns-grid";
import type { CampaignCardData } from "@/components/site/campaign-card";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Campaigns" };
export const revalidate = 60;

export default async function CampaignsListPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("campaigns")
    .select(
      "id, slug, title, short_description, banner_url, category, type, status, entry_fee, currency, submission_start, submission_deadline, sdg_goals, organizer:organizer_id(business_name, slug, logo_url)",
    )
    .in("status", ["published", "closed"])
    .order("submission_deadline", { ascending: true });

  if (type === "competition" || type === "activity") {
    query = query.eq("type", type);
  }

  const { data: campaigns } = await query;
  const cards: CampaignCardData[] = (campaigns ?? []).map((c) => ({
    ...c,
    organizer: Array.isArray(c.organizer) ? c.organizer[0] : c.organizer,
  }));

  return (
    <div className="container py-14">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Campaigns</h1>
          <p className="mt-2 text-muted-foreground">
            Discover open competitions and creative activities.
          </p>
        </div>
        <nav className="flex gap-2">
          <FilterPill href="/campaigns" active={!type}>
            All
          </FilterPill>
          <FilterPill href="/activities" active={type === "activity"}>
            Activities
          </FilterPill>
          <FilterPill href="/competitions" active={type === "competition"}>
            Competitions
          </FilterPill>
        </nav>
      </header>
      <CampaignsGrid campaigns={cards} />
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
