import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Camera,
  Calendar,
  Compass,
  Film,
  Footprints,
  GraduationCap,
  HandHeart,
  Landmark,
  Leaf,
  Lightbulb,
  Mic,
  Music,
  Palette,
  Rocket,
  Sparkles,
  SwatchBook,
  Trophy,
  Users,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SdgRow } from "@/components/site/sdg-icons";
import type { CampaignCardData } from "@/components/site/campaign-card";
import type { CWCampaignType, SubCategoryRow } from "@/lib/supabase/database.types";
import { formatCurrency, formatDate, timeUntil } from "@/lib/utils";

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

export const SUB_CATEGORY_ICONS: Record<string, IconCmp> = {
  palette: Palette,
  "swatch-book": SwatchBook,
  camera: Camera,
  "book-open": BookOpen,
  film: Film,
  music: Music,
  mic: Mic,
  lightbulb: Lightbulb,
  leaf: Leaf,
  footprints: Footprints,
  "hand-heart": HandHeart,
  landmark: Landmark,
  briefcase: Briefcase,
  rocket: Rocket,
  sparkles: Sparkles,
  compass: Compass,
};

export const TYPE_META: Record<
  CWCampaignType,
  {
    title: string;
    eyebrow: string;
    sub: string;
    icon: IconCmp;
    tone: "primary" | "secondary" | "success";
    anchor: string;
    listHref: string;
  }
> = {
  workshop: {
    title: "Workshops",
    eyebrow: "Learn by doing",
    sub: "Hands-on, time-bound sessions led by industry creators — earn a certificate when you complete one.",
    icon: GraduationCap,
    tone: "primary",
    anchor: "workshops",
    listHref: "/workshops",
  },
  competition: {
    title: "Competitions",
    eyebrow: "Go further",
    sub: "Judged briefs with prizes, mentorship, and a public showcase. Submit work, get recognised.",
    icon: Trophy,
    tone: "secondary",
    anchor: "competitions",
    listHref: "/competitions",
  },
  activity: {
    title: "Activities",
    eyebrow: "Get involved",
    sub: "Participation-based programmes — open to everyone. Show up, take part, and earn your e-certificate.",
    icon: Users,
    tone: "success",
    anchor: "activities",
    listHref: "/activities",
  },
};

const TONE_CLASSES: Record<
  "primary" | "secondary" | "success",
  {
    pillActive: string;
    pillIdleHover: string;
    badge: string;
    text: string;
    cta: string;
    soft: string;
    gradient: string;
  }
> = {
  primary: {
    pillActive: "border-primary bg-primary text-primary-foreground",
    pillIdleHover: "hover:border-primary/50 hover:text-primary",
    badge: "bg-brand-soft text-primary",
    text: "text-primary",
    cta: "border-primary text-primary hover:bg-brand-soft",
    soft: "bg-brand-soft",
    gradient: "from-[#A55EAE] to-[#406CB9]",
  },
  secondary: {
    pillActive: "border-secondary bg-secondary text-secondary-foreground",
    pillIdleHover: "hover:border-secondary/50 hover:text-secondary",
    badge: "bg-secondary-soft text-secondary",
    text: "text-secondary",
    cta: "border-secondary text-secondary hover:bg-secondary-soft",
    soft: "bg-secondary-soft",
    gradient: "from-[#EC5B7D] to-[#7A3B5A]",
  },
  success: {
    pillActive: "border-success bg-success text-success-foreground",
    pillIdleHover: "hover:border-success/50 hover:text-success",
    badge: "bg-success-soft text-success",
    text: "text-success",
    cta: "border-success text-success hover:bg-success-soft",
    soft: "bg-success-soft",
    gradient: "from-[#F0A23A] to-[#EC5B7D]",
  },
};

const SECTION_COPY: Record<
  CWCampaignType,
  {
    eyebrow: string;
    title: string;
    body: string;
    badges: string[];
  }
> = {
  competition: {
    eyebrow: "COMPETITIONS · COMPETE.",
    title: "Briefs from Malaysia's biggest brands & schools.",
    body: "Win cash, win briefs, build a portfolio worth showing.",
    badges: ["240 live", "RM 1.2M open"],
  },
  activity: {
    eyebrow: "ACTIVITIES · BUILD.",
    title: "Jam, hack, make, fly.",
    body: "Get hands dirty with weekend builds, meetups & maker fests.",
    badges: ["86 events", "24 cities"],
  },
  workshop: {
    eyebrow: "WORKSHOPS · LEARN.",
    title: "Skills, taught fast, taught fair.",
    body: "Hands-on bootcamps with industry mentors. Built for schools and self-starters.",
    badges: ["48 cohorts", "60+ schools"],
  },
};

export interface ProgrammeSectionProps {
  type: CWCampaignType;
  campaigns: CampaignCardData[];
  subCategories: SubCategoryRow[];
  /**
   * Counts of campaigns per sub_category slug, scoped to this type.
   * Used to render the small "(n)" indicator on each pill.
   */
  counts: Record<string, number>;
  totalCount: number;
  /** Currently active sub_category slug for *this* type, if any. */
  activeSub: string | null;
  /** Page hosting this section — controls how filter pills construct hrefs. */
  basePath: "/programmes" | "/workshops" | "/competitions" | "/activities";
  /** Alternate background, used to stripe sections on /programmes. */
  surface?: boolean;
  /** Visual section index on the all-programmes page. */
  index?: number;
}

export function ProgrammeSection({
  type,
  campaigns,
  subCategories,
  counts,
  totalCount,
  activeSub,
  basePath,
  surface = false,
  index,
}: ProgrammeSectionProps) {
  const meta = TYPE_META[type];
  const tone = TONE_CLASSES[meta.tone];
  const copy = SECTION_COPY[type];

  const buildHref = (sub: string | null) => {
    if (!sub) return basePath === "/programmes" ? `${basePath}#${meta.anchor}` : basePath;
    const params = new URLSearchParams();
    params.set("sub", sub);
    if (basePath === "/programmes") return `${basePath}?${params}#${meta.anchor}`;
    return `${basePath}?${params}`;
  };

  return (
    <section
      id={meta.anchor}
      className={
        "scroll-mt-24 " + (surface ? "bg-surface" : "bg-background")
      }
    >
      <div className="cw-container py-14 md:py-16">
        <header className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p data-motion="head" className={"text-[11px] font-extrabold uppercase tracking-[0.18em] " + tone.text}>
              {index ? `${String(index).padStart(2, "0")} - ` : ""}
              {copy.eyebrow}
            </p>
            <h2 data-motion="head" className="mt-2 max-w-3xl text-3xl font-extrabold italic leading-tight tracking-[-0.03em] text-body md:text-[42px]">
              {copy.title}
            </h2>
            <p className="mt-2 text-sm text-text-secondary md:text-base">{copy.body}</p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {copy.badges.map((badge) => (
              <span
                key={badge}
                className={
                  "rounded-pill px-3 py-1.5 text-xs font-extrabold " + tone.badge
                }
              >
                {badge}
              </span>
            ))}
            <span className={"rounded-pill px-3 py-1.5 text-xs font-extrabold " + tone.badge}>
              {totalCount} open
            </span>
          </div>
        </header>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <SubPill
            href={buildHref(null)}
            active={activeSub === null}
            tone={tone}
            icon={Sparkles}
            label="All"
            count={totalCount}
          />
          {subCategories.map((sc) => {
            const Cmp = SUB_CATEGORY_ICONS[sc.icon] ?? Sparkles;
            return (
              <SubPill
                key={sc.slug}
                href={buildHref(sc.slug)}
                active={activeSub === sc.slug}
                tone={tone}
                icon={Cmp}
                label={sc.label_en}
                count={counts[sc.slug] ?? 0}
              />
            );
          })}
        </div>

        <div className="mt-8">
          {campaigns.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.slice(0, 6).map((campaign) => (
                <ProgrammeCampaignCard key={campaign.id} campaign={campaign} tone={tone} />
              ))}
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed bg-card p-12 text-center">
              <Trophy className={"mx-auto h-10 w-10 " + tone.text} />
              <h3 className="mt-4 text-lg font-extrabold text-body">No campaigns found</h3>
              <p className="mt-2 text-sm text-text-secondary">
                No open {meta.title.toLowerCase()} match this filter right now.
              </p>
            </div>
          )}
        </div>

        {campaigns.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button asChild variant="outline" className={"rounded-pill border-2 bg-background " + tone.cta}>
              <Link href={meta.listHref}>
              See all {totalCount} {meta.title.toLowerCase()}
              <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function ProgrammeCampaignCard({
  campaign,
  tone,
}: {
  campaign: CampaignCardData;
  tone: (typeof TONE_CLASSES)[keyof typeof TONE_CLASSES];
}) {
  const isClosed = campaign.status === "closed";
  const remaining = campaign.submission_deadline ? timeUntil(campaign.submission_deadline) : null;
  const dateText = formatDate(campaign.submission_start, {
    day: "numeric",
    month: "short",
  });

  return (
    <article data-motion="card" className="group flex min-h-[390px] flex-col overflow-hidden rounded-[18px] border bg-card shadow-[0_14px_30px_rgb(11_19_32/0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_38px_rgb(11_19_32/0.12)] will-change-transform">
      <Link href={`/campaigns/${campaign.slug}`} className="relative block h-48 overflow-hidden">
        <div
          className={"absolute inset-0 bg-gradient-to-br " + tone.gradient}
          style={
            campaign.banner_url
              ? {
                  backgroundImage: `linear-gradient(180deg, rgb(11 19 32 / 0.05), rgb(11 19 32 / 0.34)), url(${campaign.banner_url})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }
              : undefined
          }
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {campaign.category && (
            <Badge className="bg-white/95 text-body shadow-soft">{campaign.category}</Badge>
          )}
          <Badge className={tone.soft + " " + tone.text}>{campaign.type}</Badge>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-white">
          <span className="text-3xl font-extrabold italic leading-none tracking-tight">CW</span>
          {isClosed ? (
            <span className="rounded-pill bg-destructive px-3 py-1 text-xs font-bold">Closed</span>
          ) : remaining ? (
            <span className="rounded-pill bg-white/95 px-3 py-1 text-xs font-bold text-body">
              {remaining}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/campaigns/${campaign.slug}`}>
          <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-body transition-colors group-hover:text-primary">
            {campaign.title}
          </h3>
        </Link>
        {campaign.short_description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-secondary">
            {campaign.short_description}
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {dateText}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {campaign.submissions_count ?? 0} entries
          </span>
          <span className="col-span-2 font-bold text-body">
            {campaign.entry_fee > 0
              ? `${formatCurrency(campaign.entry_fee, campaign.currency)} entry`
              : "Free entry"}
          </span>
        </div>
        {campaign.sdg_goals.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <SdgRow goals={campaign.sdg_goals} size={30} max={4} />
          </div>
        )}
        <Button asChild className="mt-auto rounded-pill">
          <Link href={`/campaigns/${campaign.slug}`}>View &amp; join</Link>
        </Button>
      </div>
    </article>
  );
}

interface SubPillProps {
  href: string;
  active: boolean;
  tone: (typeof TONE_CLASSES)[keyof typeof TONE_CLASSES];
  icon: IconCmp;
  label: string;
  count: number;
}

function SubPill({ href, active, tone, icon: Icon, label, count }: SubPillProps) {
  return (
    <Link
      href={href}
      className={
        "inline-flex items-center gap-1.5 rounded-pill border bg-card px-3 py-1.5 text-xs font-bold transition-colors " +
        (active
          ? tone.pillActive
          : "border-border text-body " + tone.pillIdleHover)
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      <span
        className={
          "text-[10px] font-extrabold " + (active ? "text-white/85" : "text-text-muted")
        }
      >
        {count}
      </span>
    </Link>
  );
}
