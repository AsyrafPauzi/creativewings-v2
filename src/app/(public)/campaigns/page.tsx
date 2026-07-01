import Link from "next/link";

import { PageMotion } from "@/components/site/animations/page-motion";
import { CampaignsGrid } from "@/components/site/campaigns-grid";
import type { CampaignCardData } from "@/components/site/campaign-card";
import { SdgIcon } from "@/components/site/sdg-icons";
import { createClient } from "@/lib/supabase/server";
import { SDG_GOALS } from "@/lib/utils";

export const metadata = { title: "Campaigns" };
export const revalidate = 60;

export default async function CampaignsListPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; sdg?: string }>;
}) {
  const { type, sdg } = await searchParams;
  const sdgFilter = sdg ? Number.parseInt(sdg, 10) : null;
  const supabase = await createClient();

  let query = supabase
    .from("campaigns")
    .select(
      "id, slug, title, short_description, banner_url, category, type, status, entry_fee, currency, submission_start, submission_deadline, sdg_goals, submissions_count, organizer:organizer_id(name, slug, logo_url)",
    )
    .in("status", ["published", "closed"])
    .order("submission_deadline", { ascending: true });

  if (type === "competition" || type === "activity" || type === "workshop") {
    query = query.eq("type", type);
  }
  if (sdgFilter && sdgFilter >= 1 && sdgFilter <= 17) {
    query = query.contains("sdg_goals", [sdgFilter]);
  }

  const { data: campaigns } = await query;
  const cards: CampaignCardData[] = (campaigns ?? []).map((c) => ({
    ...c,
    organizer: Array.isArray(c.organizer) ? c.organizer[0] : c.organizer,
  }));

  return (
    <PageMotion hero>
    <div className="cw-container py-14 md:py-20">
      <header data-motion="hero" className="mb-8 flex flex-col gap-3">
        <span data-motion="hero-item" className="text-xs font-bold uppercase tracking-[0.25em] text-primary">All campaigns</span>
        <h1 data-motion="hero-item" className="text-4xl font-extrabold tracking-tight text-body md:text-5xl">
          {sdgFilter
            ? `Campaigns aligned to SDG ${sdgFilter}: ${SDG_GOALS[sdgFilter]?.title ?? ""}`
            : "Discover open campaigns"}
        </h1>
        <p data-motion="hero-item" className="max-w-2xl text-text-secondary">
          Open competitions and creative activities you can join right now — sorted by deadline.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <FilterPill href="/campaigns" active={!type && !sdgFilter}>All</FilterPill>
        <FilterPill href="/campaigns?type=competition" active={type === "competition"}>Competitions</FilterPill>
        <FilterPill href="/campaigns?type=activity" active={type === "activity"}>Activities</FilterPill>
        <FilterPill href="/campaigns?type=workshop" active={type === "workshop"}>Workshops</FilterPill>
        {sdgFilter && (
          <span className="ml-2 inline-flex items-center gap-2 rounded-pill border border-primary/30 bg-brand-soft px-3 py-1 text-sm font-semibold text-primary">
            <SdgIcon goal={sdgFilter} size={20} />
            SDG {sdgFilter}
            <Link href="/campaigns" className="ml-1 text-xs underline">clear</Link>
          </span>
        )}
      </div>

      <CampaignsGrid campaigns={cards} />
    </div>
    </PageMotion>
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
      data-motion="pill"
      className={`rounded-pill border px-4 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "border-primary bg-brand-soft text-primary"
          : "border-border text-text-secondary hover:text-body hover:border-foreground/30"
      }`}
    >
      {children}
    </Link>
  );
}
