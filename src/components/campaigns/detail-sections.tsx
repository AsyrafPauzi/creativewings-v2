import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Calendar,
  CalendarClock,
  Camera,
  Check,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Film,
  FileText,
  Globe,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Mail,
  MapPin,
  MessageCircle,
  Music,
  Phone,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";

import { SdgIcon } from "@/components/site/sdg-icons";
import type {
  AgeBracketRow,
  CampaignRow,
  CWCampaignType,
  FaqItemRow,
  PrizeRow,
  SponsorSlotRow,
  SubCategoryRow,
} from "@/lib/supabase/database.types";
import { formatCurrency, formatDate, timeUntil } from "@/lib/utils";

type Organizer = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  industry: string | null;
  is_verified: boolean | null;
  about: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
};

const DETAIL_GRADIENT =
  "linear-gradient(135deg, #406CB9 0%, #A55EAE 50%, #EC5B7D 100%)";

const MEDIA_GRADIENT =
  "linear-gradient(135deg, #FF6B9D 0%, #FFB347 35%, #4ECDC4 65%, #7B68EE 100%)";

function campaignFee(campaign: Pick<CampaignRow, "entry_fee" | "currency">) {
  return campaign.entry_fee > 0
    ? formatCurrency(campaign.entry_fee, campaign.currency)
    : "Free";
}

function campaignPrize(campaign: Pick<CampaignRow, "total_prize_value">) {
  return campaign.total_prize_value?.trim() || "TBA";
}

function timelineItems(
  campaign: Pick<
    CampaignRow,
    "submission_start" | "submission_deadline" | "review_start" | "final_event_date"
  >,
) {
  return [
    { label: "Registration opens", value: campaign.submission_start },
    { label: "Submission closes", value: campaign.submission_deadline },
    { label: "Review begins", value: campaign.review_start },
    { label: "Final showcase", value: campaign.final_event_date },
  ].filter((item) => item.value);
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#E6E8EE] bg-white p-4 shadow-soft">
      <h3 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-text-muted">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function CampaignHero({
  campaign,
  organizer,
  ageBrackets,
  subCategory,
  joinHref,
}: {
  campaign: CampaignRow;
  organizer: Organizer | null;
  ageBrackets: AgeBracketRow[];
  subCategory: SubCategoryRow | null;
  joinHref: string;
}) {
  const isOpen = campaign.status === "published";
  const coverUrl = campaign.hero_url || campaign.banner_url;
  const cover = coverUrl
    ? { backgroundImage: `linear-gradient(180deg, rgb(0 0 0 / 0.02), rgb(0 0 0 / 0.22)), url(${coverUrl})` }
    : { backgroundImage: MEDIA_GRADIENT };

  return (
    <section className="relative overflow-hidden" style={{ backgroundImage: DETAIL_GRADIENT }}>
      <div className="cw-container relative py-6 md:py-8">
        <div className="pointer-events-none absolute left-6 top-5 grid h-12 w-12 -rotate-12 place-items-center rounded-full bg-primary text-white shadow-elevated">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="pointer-events-none absolute right-6 top-7 hidden h-12 w-12 rotate-12 place-items-center rounded-full bg-secondary text-white shadow-elevated md:grid">
          <Star className="h-5 w-5" />
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white shadow-[0_16px_32px_-8px_rgb(11_19_32/0.2)] md:grid md:min-h-[380px] md:grid-cols-[minmax(0,640px)_1fr]">
          <div
            className="relative min-h-[260px] bg-cover bg-center md:min-h-[380px]"
            style={cover}
          >
            <div className="absolute left-4 top-4 rounded-pill bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">
              {campaign.type}
              {campaign.category ? ` · ${campaign.category}` : ""}
            </div>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              <span className="h-2 w-5 rounded-pill bg-white" />
              <span className="h-2 w-2 rounded-full bg-white/60" />
              <span className="h-2 w-2 rounded-full bg-white/60" />
            </div>
          </div>

          <div className="flex min-h-[380px] flex-col gap-3 bg-white p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-pill px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                  isOpen ? "bg-success-soft text-success" : "bg-surface text-text-muted"
                }`}
              >
                {isOpen ? "Open for submissions" : "Submissions closed"}
              </span>
              {subCategory && (
                <span className="rounded-pill bg-primary-soft px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">
                  {subCategory.label_en}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold italic leading-tight tracking-[-0.04em] text-body md:text-[28px]">
              {campaign.title}
            </h1>

            {organizer && (
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-secondary text-[10px] font-extrabold text-white">
                  {organizer.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={organizer.logo_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    organizer.name.slice(0, 2).toUpperCase()
                  )}
                </span>
                <span>Organised by {organizer.name}</span>
                {organizer.is_verified && <BadgeCheck className="h-3.5 w-3.5 text-secondary" />}
              </div>
            )}

            {campaign.short_description && (
              <p className="text-[12px] leading-relaxed text-text-secondary">
                {campaign.short_description}
              </p>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              <HeroMetric label="Entry fee" value={campaignFee(campaign)} icon={Banknote} />
              <HeroMetric
                label="Deadline"
                value={timeUntil(campaign.submission_deadline) ?? "Closed"}
                icon={Clock}
              />
            </div>

            {ageBrackets.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {ageBrackets.map((bracket) => (
                  <span
                    key={bracket.id}
                    className="rounded-pill border border-[#E6E8EE] bg-surface px-2.5 py-1 text-[10px] font-extrabold text-body"
                  >
                    {bracket.label}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[#E6E8EE] pt-3">
              {isOpen ? (
                <Link
                  href={joinHref}
                  className="inline-flex items-center justify-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-sm font-extrabold text-white shadow-soft hover:bg-primary-hover"
                >
                  Join campaign
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="rounded-pill border bg-surface px-5 py-2.5 text-sm font-extrabold text-text-muted">
                  Submissions closed
                </span>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-pill border border-[#C9CDD6] bg-white px-4 py-2.5 text-xs font-extrabold text-body"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-text-secondary">
                <Eye className="h-3.5 w-3.5 text-text-muted" />
                {(campaign.views_count ?? 0).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-text-secondary">
                <Users className="h-3.5 w-3.5 text-text-muted" />
                {(campaign.submissions_count ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-[#E6E8EE] bg-surface p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-text-muted">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <div className="mt-1 text-sm font-extrabold text-body">{value}</div>
    </div>
  );
}

export function CampaignSidebar({
  campaign,
  organizer,
  related,
  subCategory,
  joinHref,
}: {
  campaign: CampaignRow;
  organizer: Organizer | null;
  related: RelatedCampaign[];
  subCategory: SubCategoryRow | null;
  joinHref: string;
}) {
  const isOpen = campaign.status === "published";
  const items = timelineItems(campaign);
  const additionalInfo = [
    { label: "Mode", value: campaign.event_mode ?? "Online" },
    { label: "Location", value: campaign.location_details },
    { label: "Category", value: subCategory?.label_en ?? campaign.category },
    { label: "Certificate", value: campaign.enable_certificate ? "Included" : null },
    { label: "Voting", value: campaign.enable_voting ? "Public voting enabled" : null },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-24">
      <DetailCard title="Registration">
        <div className="text-2xl font-extrabold text-body">{campaignFee(campaign)}</div>
        <div className="text-xs font-semibold text-text-muted">Entry Fee</div>
        <p className="mt-2 text-[13px] text-text-secondary">
          {timeUntil(campaign.submission_deadline) ?? "Closed"}
          {campaign.submission_deadline
            ? ` · Closes ${formatDate(campaign.submission_deadline)}`
            : ""}
        </p>
        {isOpen ? (
          <Link
            href={joinHref}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-sm font-extrabold text-white hover:bg-primary-hover"
          >
            Join this campaign
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="mt-3 inline-flex w-full justify-center rounded-pill border bg-surface px-5 py-2.5 text-sm font-extrabold text-text-muted">
            Submissions closed
          </span>
        )}
      </DetailCard>

      {items.length > 0 && (
        <DetailCard title="Timeline">
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <div className="text-[12px] font-extrabold text-body">{item.label}</div>
                  <div className="text-[11px] font-semibold text-text-muted">
                    {formatDate(item.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DetailCard>
      )}

      <DetailCard title="Entries">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-body">
              {(campaign.submissions_count ?? 0).toLocaleString()}
              {campaign.kpi_target > 0 ? ` / ${campaign.kpi_target.toLocaleString()}` : ""}
            </div>
            <div className="text-[11px] font-semibold text-text-muted">
              {campaign.kpi_label || "Submissions target"}
            </div>
          </div>
        </div>
      </DetailCard>

      {additionalInfo.length > 0 && (
        <DetailCard title="Additional Info">
          <div className="space-y-2">
            {additionalInfo.map((item) => (
              <div key={item.label} className="flex justify-between gap-3 text-[12px]">
                <span className="font-semibold text-text-muted">{item.label}</span>
                <span className="text-right font-extrabold capitalize text-body">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </DetailCard>
      )}

      {organizer && <OrganizerCard organizer={organizer} />}
      <AlsoRecommended campaigns={related} />

      <DetailCard title="Share">
        <div className="flex gap-2">
          {["Copy link", "WhatsApp", "Facebook"].map((label) => (
            <button
              key={label}
              type="button"
              className="rounded-pill border border-[#C9CDD6] bg-white px-3 py-2 text-[11px] font-extrabold text-body"
            >
              {label}
            </button>
          ))}
        </div>
      </DetailCard>
    </aside>
  );
}

export function BottomCampaignCta({
  campaign,
  joinHref,
}: {
  campaign: CampaignRow;
  joinHref: string;
}) {
  const isOpen = campaign.status === "published";
  return (
    <section className="relative overflow-hidden" style={{ backgroundImage: DETAIL_GRADIENT }}>
      <div className="cw-container flex flex-col gap-5 py-10 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex rounded-pill bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em]">
            Ready to join?
          </div>
          <h2 className="mt-2 text-3xl font-extrabold italic tracking-[-0.04em]">
            Take part in {campaign.title}
          </h2>
          <p className="mt-2 text-sm text-white/75">
            {timeUntil(campaign.submission_deadline) ?? "Closed"} · {campaignFee(campaign)} entry fee · {campaignPrize(campaign)} prize pool
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOpen && (
            <Link
              href={joinHref}
              className="inline-flex items-center gap-2 rounded-pill bg-white px-5 py-2.5 text-sm font-extrabold text-primary"
            >
              Join campaign
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <a
            href="#rules"
            className="inline-flex items-center gap-2 rounded-pill border border-white/80 bg-white/15 px-5 py-2.5 text-sm font-extrabold text-white"
          >
            View rules
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Toolbar                                     */
/* -------------------------------------------------------------------------- */

const TYPE_LABEL: Record<CWCampaignType, { label: string; tone: string }> = {
  competition: { label: "Competitions", tone: "text-primary" },
  workshop: { label: "Workshops", tone: "text-secondary" },
  activity: { label: "Activities", tone: "text-success" },
};

export function DetailToolbar({
  campaign,
}: {
  campaign: Pick<CampaignRow, "title" | "type">;
}) {
  const t = TYPE_LABEL[campaign.type];
  return (
    <div className="border-b bg-surface">
      <div className="cw-container flex flex-wrap items-center justify-between gap-3 py-3">
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-1.5 text-xs"
        >
          <Link href="/programmes" className="font-medium text-text-secondary hover:text-body">
            Programmes
          </Link>
          <ChevronRight className="h-3 w-3 text-text-muted" />
          <Link
            href={`/programmes#${campaign.type}`}
            className={`font-medium hover:underline ${t.tone}`}
          >
            {t.label}
          </Link>
          <ChevronRight className="h-3 w-3 text-text-muted" />
          <span className="font-bold text-body line-clamp-1">{campaign.title}</span>
        </nav>
        <form
          action="/campaigns"
          method="get"
          className="flex w-full max-w-sm items-center gap-2 rounded-pill border bg-background px-3.5 py-1.5 focus-within:border-primary md:w-80"
        >
          <Search className="h-3.5 w-3.5 text-text-muted" />
          <input
            type="search"
            name="q"
            placeholder="Search campaigns, organizers, schools…"
            className="flex-1 bg-transparent text-xs font-medium text-body placeholder:text-text-muted focus:outline-none"
          />
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Sponsor banner                                */
/* -------------------------------------------------------------------------- */

export function SponsorBanner({ slot }: { slot: SponsorSlotRow | null }) {
  if (!slot) return null;
  const from = slot.background_from || "#F97316";
  const to = slot.background_to || "#7C2A12";
  return (
    <a
      href={slot.cta_href}
      className="flex flex-col items-start gap-3 rounded-md border px-5 py-4 text-white shadow-soft transition-shadow hover:shadow-elevated md:flex-row md:items-center md:gap-6 md:px-7"
      style={{
        backgroundImage: `linear-gradient(90deg, ${from} 0%, ${to} 100%)`,
        borderColor: to,
      }}
    >
      <div className="flex-1">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/70">
          Sponsored · {slot.sponsor_name}
        </div>
        <div className="mt-1 text-base font-extrabold leading-snug md:text-[15px]">
          {slot.title}
        </div>
        {slot.body && (
          <div className="mt-1 text-xs font-medium text-white/85 md:text-sm">
            {slot.body}
          </div>
        )}
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-white px-4 py-2 text-xs font-extrabold" style={{ color: to }}>
        {slot.cta_label}
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Poster card                                 */
/* -------------------------------------------------------------------------- */

export function PosterCard({
  campaign,
  ageBrackets,
  joinHref,
}: {
  campaign: Pick<
    CampaignRow,
    | "title"
    | "short_description"
    | "banner_url"
    | "type"
    | "category"
    | "status"
    | "submission_deadline"
    | "views_count"
    | "submissions_count"
  >;
  ageBrackets: AgeBracketRow[];
  joinHref: string;
}) {
  const isOpen = campaign.status === "published";
  const eyebrow = `${campaign.type.toUpperCase()}${campaign.category ? ` · ${campaign.category.toUpperCase()}` : ""}`;
  const cover = campaign.banner_url
    ? { backgroundImage: `url(${campaign.banner_url})` }
    : {
        backgroundImage:
          "linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
      };

  return (
    <div className="overflow-hidden rounded-md border bg-card shadow-soft">
      {/* Cover */}
      <div
        className="flex h-72 flex-col justify-between bg-cover bg-center p-5"
        style={cover}
      >
        <div className="flex items-start">
          <span
            className={`inline-flex items-center gap-1.5 rounded-pill bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] ${
              isOpen ? "text-success" : "text-text-secondary"
            }`}
          >
            <span
              className={`block h-1.5 w-1.5 rounded-full ${
                isOpen ? "bg-success" : "bg-text-muted"
              }`}
            />
            {isOpen ? "Open for submissions" : "Submissions closed"}
          </span>
        </div>
        <div className="text-white">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/80">
            {eyebrow}
          </div>
          <h1 className="mt-1.5 text-xl font-extrabold leading-tight">
            {campaign.title}
          </h1>
          {campaign.short_description && (
            <p className="mt-1 line-clamp-2 text-xs font-medium text-white/85">
              {campaign.short_description}
            </p>
          )}
        </div>
      </div>

      {/* Title block */}
      <div className="flex flex-col gap-3 p-5">
        <h2 className="text-base font-extrabold leading-snug text-body">
          {campaign.title}
        </h2>
        {ageBrackets.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {ageBrackets.map((b) => (
              <span
                key={b.id}
                className="rounded-pill border bg-surface px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.06em] text-body"
              >
                {b.label}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 border-t pt-3">
          {isOpen ? (
            <Link
              href={joinHref}
              className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Heart className="h-3 w-3" />
              Follow
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-pill border bg-surface px-4 py-2 text-xs font-extrabold text-text-muted"
            >
              Closed
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-pill border bg-background px-3 py-2 text-[11px] font-bold text-text-secondary"
          >
            <Share2 className="h-3 w-3" />
            Share
          </button>
          <span className="flex-1" />
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-text-secondary">
            <Eye className="h-3 w-3 text-text-muted" />
            {(campaign.views_count ?? 0).toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-text-secondary">
            <Users className="h-3 w-3 text-text-muted" />
            {(campaign.submissions_count ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Period card                                   */
/* -------------------------------------------------------------------------- */

export function PeriodCard({
  campaign,
  joinHref,
}: {
  campaign: Pick<
    CampaignRow,
    | "submission_start"
    | "submission_deadline"
    | "entry_fee"
    | "currency"
    | "total_prize_value"
    | "status"
    | "event_mode"
    | "location_details"
  >;
  joinHref: string;
}) {
  const start = campaign.submission_start
    ? new Date(campaign.submission_start).getTime()
    : null;
  const end = campaign.submission_deadline
    ? new Date(campaign.submission_deadline).getTime()
    : null;
  const now = Date.now();
  const elapsed =
    start && end && end > start
      ? Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
      : null;
  const remaining = end ? Math.max(0, Math.floor((end - now) / 86_400_000)) : null;
  const closesIn = timeUntil(campaign.submission_deadline);

  const fee =
    campaign.entry_fee > 0
      ? formatCurrency(campaign.entry_fee, campaign.currency)
      : "Free";
  const prize =
    campaign.total_prize_value && campaign.total_prize_value.trim().length > 0
      ? campaign.total_prize_value
      : "TBA";

  const where =
    campaign.event_mode === "physical"
      ? "Physical event"
      : campaign.event_mode === "hybrid"
        ? "Hybrid"
        : "Online · creativewings.asia";

  return (
    <div className="overflow-hidden rounded-md border bg-card shadow-soft">
      <div className="flex items-center gap-2 border-b bg-success-soft px-4 py-2.5">
        <ShieldCheck className="h-3.5 w-3.5 text-success" />
        <span className="text-[11px] font-extrabold text-success">
          Auto-approved · PDPA-compliant campaign.
        </span>
      </div>

      <div className="flex flex-col gap-1.5 border-b px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <CalendarClock className="h-3 w-3 text-secondary" />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-secondary">
            Submission period
          </span>
        </div>
        <div className="text-[13px] font-extrabold text-body">
          {campaign.submission_start
            ? formatDate(campaign.submission_start, {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "TBA"}
          <span className="mx-1.5 text-text-muted">→</span>
          {campaign.submission_deadline
            ? formatDate(campaign.submission_deadline, {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "TBA"}
        </div>
        {elapsed != null && (
          <>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-secondary"
                style={{ width: `${elapsed}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-muted">
                {Math.round(100 - elapsed)}% time left
              </span>
              <span className="text-[10px] font-extrabold text-secondary">
                {remaining != null
                  ? `${remaining} day${remaining === 1 ? "" : "s"} remaining`
                  : closesIn || ""}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-1.5 border-b px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <Upload className="h-3 w-3 text-secondary" />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-secondary">
            Where to submit
          </span>
        </div>
        <div className="text-[13px] font-extrabold text-body">{where}</div>
        {campaign.location_details && (
          <div className="flex items-start gap-1.5 text-[11px] text-text-muted">
            <MapPin className="mt-0.5 h-3 w-3" />
            {campaign.location_details}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 border-b text-center md:text-left">
        <div className="border-r p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-secondary">
            Entry fee
          </div>
          <div className="mt-1 text-base font-extrabold text-body">{fee}</div>
        </div>
        <div className="p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-secondary">
            Total prize
          </div>
          <div className="mt-1 text-base font-extrabold text-success">
            {prize}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        {campaign.status === "published" ? (
          <Link
            href={joinHref}
            className="inline-flex items-center justify-center gap-1.5 rounded-pill bg-primary px-5 py-3 text-[13px] font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Join this campaign
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center rounded-pill border bg-surface px-5 py-3 text-[13px] font-extrabold text-text-muted">
            Submissions closed
          </span>
        )}
        <p className="text-[10px] font-semibold text-text-muted">
          Free for verified students of MOE-listed schools.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Organizer card                                  */
/* -------------------------------------------------------------------------- */

export function OrganizerCard({ organizer }: { organizer: Organizer }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border bg-card p-4 shadow-soft">
      <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-secondary">
        Organizer
      </span>
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-md bg-gradient-to-br from-primary to-secondary text-sm font-extrabold text-white">
          {organizer.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={organizer.logo_url}
              alt={organizer.name}
              className="h-full w-full object-cover"
            />
          ) : (
            organizer.name.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-extrabold text-body">
              {organizer.name}
            </span>
            {organizer.is_verified && (
              <span className="inline-flex items-center gap-0.5 rounded-pill bg-secondary-soft px-1.5 py-0 text-[8px] font-extrabold uppercase tracking-[0.1em] text-secondary">
                <BadgeCheck className="h-2.5 w-2.5" /> Verified
              </span>
            )}
          </div>
          {organizer.industry && (
            <p className="text-[11px] font-medium text-text-muted">
              {organizer.industry}
            </p>
          )}
        </div>
      </div>

      <Link
        href={`/organizer/${organizer.slug}`}
        className="inline-flex items-center justify-center gap-1.5 rounded-pill border bg-surface px-3 py-2 text-xs font-extrabold text-body"
      >
        Visit organizer page
        <ArrowRight className="h-3 w-3" />
      </Link>

      {(organizer.phone || organizer.email || organizer.website) && (
        <div className="flex flex-col gap-1.5 border-t pt-3">
          {organizer.phone && (
            <ContactRow icon={Phone} label={organizer.phone} />
          )}
          {organizer.email && (
            <ContactRow icon={Mail} label={organizer.email} />
          )}
          {organizer.website && (
            <ContactRow icon={Globe} label={organizer.website} />
          )}
        </div>
      )}
    </div>
  );
}

function ContactRow({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3 w-3 text-text-muted" />
      <span className="text-[11px] font-semibold text-text-secondary">{label}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Tags                                      */
/* -------------------------------------------------------------------------- */

export function TagsCard({
  campaign,
  subCategory,
}: {
  campaign: Pick<CampaignRow, "category" | "sdg_goals">;
  subCategory: SubCategoryRow | null;
}) {
  const subChips = [subCategory?.label_en, campaign.category]
    .filter((s): s is string => Boolean(s));
  return (
    <div className="flex flex-col gap-3.5 rounded-md border bg-card p-4 shadow-soft">
      {subChips.length > 0 && (
        <section>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-secondary">
            Sub-categories
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {subChips.map((c) => (
              <span
                key={c}
                className="rounded-pill bg-brand-soft px-2.5 py-0.5 text-[11px] font-bold text-primary"
              >
                {c}
              </span>
            ))}
          </div>
        </section>
      )}

      {campaign.sdg_goals && campaign.sdg_goals.length > 0 && (
        <section>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-secondary">
            UN SDGs
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {campaign.sdg_goals.map((g: number) => (
              <Link
                key={g}
                href={`/campaigns?sdg=${g}`}
                className="block transition-transform hover:-translate-y-0.5"
                title={`SDG ${g}`}
              >
                <SdgIcon goal={g} size={36} rounded="sm" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Post info                                     */
/* -------------------------------------------------------------------------- */

export function PostInfoCard({
  campaign,
}: {
  campaign: Pick<CampaignRow, "published_at" | "updated_at" | "serial_code">;
}) {
  const rows = [
    { l: "Published", v: formatDate(campaign.published_at) },
    { l: "Last update", v: formatDate(campaign.updated_at) },
    { l: "Listing ID", v: campaign.serial_code ?? "—" },
  ];
  return (
    <div className="flex flex-col gap-2 rounded-md border bg-card p-4 shadow-soft">
      <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-secondary">
        Post information
      </span>
      {rows.map((r) => (
        <div key={r.l} className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-text-muted">{r.l}</span>
          <span className="text-[11px] font-extrabold text-body">{r.v}</span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Also recommended                                  */
/* -------------------------------------------------------------------------- */

export type RelatedCampaign = Pick<
  CampaignRow,
  "id" | "slug" | "title" | "submission_deadline" | "banner_url" | "type"
> & {
  organizer: { name: string } | { name: string }[] | null;
};

const TYPE_ACCENT: Record<CWCampaignType, string> = {
  competition: "hsl(var(--primary))",
  workshop: "hsl(var(--secondary))",
  activity: "hsl(var(--success))",
};

export function AlsoRecommended({
  campaigns,
}: {
  campaigns: RelatedCampaign[];
}) {
  if (campaigns.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-md border bg-card shadow-soft">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-[13px] font-extrabold text-body">Also recommended</span>
        <Link href="/campaigns" className="text-[11px] font-extrabold text-primary">
          View all
        </Link>
      </div>
      <div>
        {campaigns.map((c, i) => {
          const org = Array.isArray(c.organizer) ? c.organizer[0] : c.organizer;
          const cover = c.banner_url
            ? { backgroundImage: `url(${c.banner_url})` }
            : {
                backgroundImage: `linear-gradient(145deg, ${TYPE_ACCENT[c.type]} 0%, hsl(var(--foreground)) 100%)`,
              };
          return (
            <Link
              key={c.id}
              href={`/campaigns/${c.slug}`}
              className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface ${
                i < campaigns.length - 1 ? "border-b" : ""
              }`}
            >
              <span
                className="block h-14 w-14 flex-shrink-0 rounded-sm bg-cover bg-center"
                style={cover}
              />
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-[12px] font-extrabold leading-snug text-body">
                  {c.title}
                </div>
                {org?.name && (
                  <div className="mt-0.5 text-[10px] font-medium text-text-muted">
                    {org.name}
                  </div>
                )}
                <div className="mt-0.5 text-[10px] font-extrabold text-primary">
                  {timeUntil(c.submission_deadline) ?? "Closed"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Section header                                  */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  eyebrow,
  title,
  color = "hsl(var(--primary))",
}: {
  eyebrow: string;
  title: string;
  color?: string;
}) {
  return (
    <header>
      <div>
        <div
          className="text-[10px] font-extrabold uppercase tracking-[0.18em]"
          style={{ color }}
        >
          {eyebrow}
        </div>
        <h2 className="mt-1 text-2xl font-extrabold italic tracking-[-0.04em] text-body md:text-[28px]">
          {title}
        </h2>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*                              About section                                 */
/* -------------------------------------------------------------------------- */

export function AboutSection({
  campaign,
  ageBrackets,
}: {
  campaign: Pick<CampaignRow, "description" | "short_description">;
  ageBrackets: AgeBracketRow[];
}) {
  const eligibility: string[] = [];
  if (ageBrackets.length > 0) {
    const minAge = Math.min(...ageBrackets.map((b) => b.min_age));
    const maxAge = Math.max(...ageBrackets.map((b) => b.max_age));
    eligibility.push(`You are between ${minAge} and ${maxAge} years old.`);
  } else {
    eligibility.push("Open to all young creators in the eligible age range.");
  }
  eligibility.push("You are enrolled in or have graduated from an MOE-listed school.");
  eligibility.push("You can submit the required entry within the submission window.");
  eligibility.push("You have your guardian's consent (if under 18).");

  return (
    <section className="flex flex-col gap-4" id="about">
      <SectionHeader eyebrow="About" title="About this campaign" />

      {campaign.description ? (
        <article
          className="prose prose-neutral max-w-none rounded-lg bg-primary-soft px-5 py-4 text-[13px] leading-relaxed text-text-secondary md:px-6"
          dangerouslySetInnerHTML={{ __html: campaign.description }}
        />
      ) : (
        <p className="rounded-lg bg-primary-soft px-5 py-4 text-[13px] leading-relaxed text-text-secondary md:px-6">
          {campaign.short_description ??
            "Full briefing coming soon. Follow this campaign to be notified when the organizer publishes the details."}
        </p>
      )}

      <div className="flex flex-col gap-2 px-3 py-2">
        <div className="text-[13px] font-extrabold text-body">
          You&apos;re eligible if
        </div>
        {eligibility.map((it) => (
          <div key={it} className="flex items-start gap-2">
            <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-success" />
            <span className="text-[12px] leading-relaxed text-body">{it}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Rules                                       */
/* -------------------------------------------------------------------------- */

export function RulesSection({ rules }: { rules: string[] }) {
  if (rules.length === 0) return null;
  return (
    <section className="flex flex-col gap-4" id="rules">
      <SectionHeader
        eyebrow="Terms"
        title="How this campaign works"
        color="hsl(var(--secondary))"
      />
      <ol className="rounded-lg border border-[#E6E8EE] bg-white">
        {rules.map((r, i) => (
          <li
            key={i}
            className={`flex items-start gap-3 px-5 py-3 ${
              i < rules.length - 1 ? "border-b border-[#E6E8EE]" : ""
            }`}
          >
            <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-secondary-soft text-[11px] font-extrabold text-secondary">
              {i + 1}
            </span>
            <p className="text-[13px] leading-relaxed text-body">{r}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Criteria                                      */
/* -------------------------------------------------------------------------- */

export function CriteriaSection({
  criteria,
  prizes,
}: {
  criteria: { name: string; weight: string; description?: string }[];
  prizes: PrizeRow[];
}) {
  return (
    <section className="flex flex-col gap-4" id="prizes">
      <SectionHeader
        eyebrow="Prizes"
        title="Prizes & recognition"
        color="hsl(var(--success))"
      />

      {criteria.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-[#E6E8EE] bg-white">
          <div className="grid grid-cols-[1fr_72px_1.4fr] border-b bg-surface px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-secondary">
            <span>Criterion</span>
            <span>Weight</span>
            <span>Description</span>
          </div>
          {criteria.map((c, i) => (
            <div
              key={c.name}
              className={`grid grid-cols-[1fr_72px_1.4fr] items-start px-4 py-3 ${
                i < criteria.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex items-center gap-2 text-[12px] font-extrabold text-body">
                <span className="block h-1.5 w-1.5 rounded-full bg-success" />
                {c.name}
              </div>
              <div className="text-[12px] font-extrabold text-success">
                {c.weight}
              </div>
              <p className="text-[11px] leading-relaxed text-text-secondary">
                {c.description ?? "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      {prizes.length > 0 && (
        <div className="mt-1 flex flex-col gap-2 rounded-lg border border-[#E6E8EE] bg-white p-4">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-warning" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-secondary">
              Award categories
            </span>
          </div>
          {prizes.map((p) => (
            <div key={p.id} className="flex items-start gap-2">
              <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-warning-soft text-[10px] font-extrabold text-warning">
                {p.rank ?? "•"}
              </span>
              <div className="text-[12px]">
                <div className="font-extrabold text-body">{p.title}</div>
                {p.description && (
                  <p className="text-text-secondary">{p.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Submit section                                */
/* -------------------------------------------------------------------------- */

const SUBMIT_REQ_ICON: Record<string, LucideIcon> = {
  video: Film,
  audio: Music,
  consent: FileText,
  headshot: ImageIcon,
  reference: LinkIcon,
  photo: Camera,
};

const DEFAULT_REQS: { key: string; label: string; meta: string }[] = [
  { key: "video", label: "Performance video", meta: "MP4 · 60–90s" },
  { key: "consent", label: "Consent form", meta: "PDF · signed" },
  { key: "headshot", label: "Headshot", meta: "JPG/PNG · 1024px+" },
  { key: "reference", label: "Reference link", meta: "Optional" },
];

export function SubmitSection({
  notes,
  requirements = DEFAULT_REQS,
}: {
  notes?: string | null;
  requirements?: { key: string; label: string; meta: string }[];
}) {
  return (
    <section className="flex flex-col gap-4" id="submit">
      <SectionHeader
        eyebrow="Entries"
        title="What to submit"
        color="#7C3AED"
      />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {requirements.map((r) => {
          const Icon = SUBMIT_REQ_ICON[r.key] ?? FileText;
          return (
            <div
              key={r.key}
              className="flex flex-col gap-2 rounded-lg border border-[#E6E8EE] bg-white p-3.5"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md border bg-background text-[#7C3AED]">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="text-[12px] font-extrabold text-body">
                {r.label}
              </div>
              <div className="text-[11px] font-semibold text-text-muted">
                {r.meta}
              </div>
            </div>
          );
        })}
      </div>

      {notes && (
        <div className="flex items-start gap-2.5 rounded-lg border border-warning bg-warning-soft p-3.5">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-warning" />
          <div>
            <div className="text-[12px] font-extrabold text-warning">
              Submission notes
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-body">
              {notes}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Resources                                     */
/* -------------------------------------------------------------------------- */

export function ResourcesSection({
  campaign,
  organizer,
}: {
  campaign: Pick<
    CampaignRow,
    "banner_url" | "hero_url" | "certificate_template_url" | "enable_certificate"
  >;
  organizer: Organizer | null;
}) {
  const resources = [
    campaign.banner_url && {
      label: "Campaign poster",
      href: campaign.banner_url,
      meta: "View the public campaign visual",
      icon: ImageIcon,
    },
    campaign.hero_url && {
      label: "Hero artwork",
      href: campaign.hero_url,
      meta: "Reference image for this campaign",
      icon: ImageIcon,
    },
    campaign.enable_certificate &&
      campaign.certificate_template_url && {
        label: "Certificate preview",
        href: campaign.certificate_template_url,
        meta: "Recognition template for participants",
        icon: FileText,
      },
    organizer?.website && {
      label: "Organizer website",
      href: organizer.website,
      meta: "More resources from the organizer",
      icon: Globe,
    },
  ].filter(
    (resource): resource is {
      label: string;
      href: string;
      meta: string;
      icon: LucideIcon;
    } => Boolean(resource),
  );

  if (resources.length === 0) return null;

  return (
    <section className="flex flex-col gap-4" id="resources">
      <SectionHeader eyebrow="Resources" title="Downloads & links" color="#A55EAE" />
      <div className="grid gap-3 md:grid-cols-2">
        {resources.map((resource) => (
          <a
            key={`${resource.label}-${resource.href}`}
            href={resource.href}
            className="flex items-start gap-3 rounded-lg border border-[#E6E8EE] bg-white p-4 transition-colors hover:border-primary"
          >
            <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              <resource.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-extrabold text-body">
                {resource.label}
              </span>
              <span className="mt-0.5 block text-[11px] font-semibold text-text-muted">
                {resource.meta}
              </span>
            </span>
            <Download className="h-4 w-4 text-text-muted" />
          </a>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  FAQ                                       */
/* -------------------------------------------------------------------------- */

export function FaqSection({ items }: { items: FaqItemRow[] }) {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-4" id="faq">
      <SectionHeader eyebrow="FAQ" title="Frequently asked questions" color="#F05A7E" />
      <div className="overflow-hidden rounded-lg border border-[#E6E8EE] bg-white">
        {items.map((item, index) => (
          <details
            key={item.id}
            className={`group px-5 py-4 ${
              index < items.length - 1 ? "border-b border-[#E6E8EE]" : ""
            }`}
            open={index === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[13px] font-extrabold text-body">
              <span className="inline-flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                {item.question}
              </span>
              <ChevronRight className="h-4 w-4 text-text-muted transition-transform group-open:rotate-90" />
            </summary>
            <p className="mt-3 pl-6 text-[12px] leading-relaxed text-text-secondary">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Contact                                       */
/* -------------------------------------------------------------------------- */

export function ContactSection({
  organizer,
}: {
  organizer: Organizer;
}) {
  const items: { icon: LucideIcon; label: string; value: string }[] = [];
  if (organizer.phone) items.push({ icon: Phone, label: "Hotline", value: organizer.phone });
  if (organizer.email) items.push({ icon: Mail, label: "Email", value: organizer.email });
  if (organizer.website) items.push({ icon: MessageCircle, label: "Website", value: organizer.website });
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-4" id="contact">
      <SectionHeader
        eyebrow="Contact"
        title="Get in touch with the organizer"
        color="hsl(var(--warning))"
      />
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex flex-col gap-1 rounded-lg border border-[#E6E8EE] bg-white p-3.5"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-warning-soft text-warning">
              <it.icon className="h-3.5 w-3.5" />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-secondary">
              {it.label}
            </span>
            <span className="text-[13px] font-extrabold text-body">{it.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Section anchor tabs                               */
/* -------------------------------------------------------------------------- */

const ANCHORS = [
  { id: "about", label: "About" },
  { id: "prizes", label: "Prizes" },
  { id: "submit", label: "Entries" },
  { id: "rules", label: "Terms" },
  { id: "resources", label: "Resources" },
  { id: "faq", label: "FAQ" },
];

export function SectionTabs() {
  return (
    <nav className="sticky top-20 z-20 flex w-fit max-w-full gap-1 overflow-x-auto rounded-pill border border-[#E6E8EE] bg-white p-1.5 shadow-soft">
      {ANCHORS.map((a, i) => (
        <a
          key={a.id}
          href={`#${a.id}`}
          className={`rounded-pill px-3.5 py-1.5 text-[11px] font-extrabold ${
            i === 0
              ? "bg-foreground text-background"
              : "text-text-secondary hover:text-body"
          }`}
        >
          {a.label}
        </a>
      ))}
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*                       Helper: prizes summary line                          */
/* -------------------------------------------------------------------------- */

export function PrizesSummary({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-text-secondary">
      <Banknote className="h-3 w-3 text-success" />
      {value > 0 ? formatCurrency(value, "MYR") : "—"}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                       Helper: deadline tag                                 */
/* -------------------------------------------------------------------------- */

export function DeadlineTag({ deadline }: { deadline: string | null }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-text-secondary">
      <Calendar className="h-3 w-3" />
      {timeUntil(deadline) ?? "Closed"}
    </span>
  );
}
