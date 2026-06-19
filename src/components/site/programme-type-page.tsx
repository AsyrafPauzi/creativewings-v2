import Link from "next/link";

import { ProgrammeSection, TYPE_META } from "@/components/site/programme-section";
import { loadTypeBucket } from "@/lib/programmes";
import type { CWCampaignType } from "@/lib/supabase/database.types";

export interface ProgrammeTypePageProps {
  type: CWCampaignType;
  activeSub: string | null;
}

/**
 * Shared layout for the three single-type listing routes
 * (`/workshops`, `/competitions`, `/activities`). Reuses `ProgrammeSection`
 * so the visual language is identical to `/programmes` — only the type-specific
 * hero and the absence of sibling sections differ.
 */
export async function ProgrammeTypePage({ type, activeSub }: ProgrammeTypePageProps) {
  const bucket = await loadTypeBucket(type, activeSub);
  const meta = TYPE_META[type];
  const Icon = meta.icon;

  const heroBg =
    type === "workshop"
      ? "linear-gradient(160deg, hsl(var(--secondary-soft)) 0%, hsl(var(--brand-soft)) 100%)"
      : type === "competition"
        ? "linear-gradient(160deg, hsl(var(--brand-soft)) 0%, hsl(var(--secondary-soft)) 100%)"
        : "linear-gradient(160deg, hsl(var(--success-soft)) 0%, hsl(var(--secondary-soft)) 100%)";

  const tonePill =
    meta.tone === "primary"
      ? "border-primary/40 bg-background/80 text-primary"
      : meta.tone === "secondary"
        ? "border-secondary/40 bg-background/80 text-secondary"
        : "border-success/40 bg-background/80 text-success";

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ backgroundImage: heroBg }} />
        <div className="cw-container py-20 md:py-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <span
              className={
                "inline-flex items-center gap-2 rounded-pill border px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur " +
                tonePill
              }
            >
              <Icon className="h-3.5 w-3.5" /> {meta.eyebrow}
            </span>
            <h1 className="text-5xl font-extrabold tracking-tight text-body md:text-6xl">
              {meta.title}
            </h1>
            <p className="text-lg text-text-secondary">{meta.sub}</p>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span>Looking for something else?</span>
              <Link
                href="/programmes"
                className="font-bold text-body underline-offset-2 hover:underline"
              >
                See all programmes
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ProgrammeSection
        type={type}
        campaigns={bucket.campaigns}
        subCategories={bucket.subCategories}
        counts={bucket.counts}
        totalCount={bucket.totalCount}
        activeSub={bucket.activeSub}
        basePath={meta.listHref as "/workshops" | "/competitions" | "/activities"}
      />
    </>
  );
}
