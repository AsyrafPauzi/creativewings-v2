import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  Award,
  BadgeCheck,
  Calendar,
  Clock,
  ExternalLink,
  Facebook,
  Globe,
  Instagram,
  Link as LinkIcon,
  Linkedin,
  Mail,
  MapPin,
  Megaphone,
  Music,
  Phone,
  Share2,
  Users,
  Youtube,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageMotion } from "@/components/site/animations/page-motion";
import { SdgRow } from "@/components/site/sdg-icons";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, timeUntil } from "@/lib/utils";

export const revalidate = 60;

const TYPE_LABELS = {
  competition: "Competition",
  activity: "Activity",
  workshop: "Workshop",
} as const;

type CampaignType = keyof typeof TYPE_LABELS;
type PublicCampaign = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  banner_url: string | null;
  type: CampaignType;
  status: "published" | "closed" | string;
  category: string | null;
  entry_fee: number;
  currency: string;
  submission_start: string | null;
  submission_deadline: string | null;
  submissions_count: number | null;
  kpi_target: number | null;
  sdg_goals: number[];
};

const BADGE_STYLES = [
  "bg-[#F05A7E]",
  "bg-[#125B9A]",
  "bg-[#16A34A]",
  "bg-[#D97706]",
  "bg-[#7C3AED]",
  "bg-[#0891B2]",
];

function yearsActive(createdAt: string | null | undefined) {
  if (!createdAt) return 1;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return 1;
  return Math.max(1, new Date().getFullYear() - created.getFullYear() + 1);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatUrlLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

function isPresent<T>(value: T | null | undefined | false): value is T {
  return Boolean(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizers")
    .select("name, about")
    .eq("slug", slug)
    .maybeSingle();
  return { title: data?.name ?? "Organizer", description: data?.about ?? undefined };
}

export default async function OrganizerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizers")
    .select(
      "id, slug, name, logo_url, banner_url, industry, about, website, email, phone, city, country, is_verified, facebook_url, instagram_url, linkedin_url, youtube_url, tiktok_url, created_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!org) notFound();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      "id, slug, title, short_description, banner_url, type, status, category, entry_fee, currency, submission_start, submission_deadline, submissions_count, kpi_target, sdg_goals",
    )
    .eq("organizer_id", org.id)
    .in("status", ["published", "closed"])
    .order("submission_deadline", { ascending: true });

  const publicCampaigns = (campaigns ?? []) as PublicCampaign[];
  const activeCampaigns = publicCampaigns.filter((campaign) => campaign.status === "published");
  const pastCampaigns = publicCampaigns.filter((campaign) => campaign.status === "closed");
  const participantCount = publicCampaigns.reduce(
    (total, campaign) => total + (campaign.submissions_count ?? 0),
    0,
  );
  const activeYears = yearsActive(org.created_at);
  const location = [org.city, org.country].filter(Boolean).join(", ");
  const aboutParagraphs: string[] = org.about
    ? org.about.split(/\n{2,}/).filter(Boolean)
    : [
        `${org.name} creates youth-focused programmes that connect creativity, learning, and measurable community impact.`,
        "Explore their latest competitions, workshops, and activities on Creative Wings.",
      ];
  const valuePills = [
    org.industry,
    publicCampaigns.some((campaign) => campaign.type === "workshop") ? "Workshops" : null,
    publicCampaigns.some((campaign) => campaign.sdg_goals.length > 0) ? "SDG-aligned" : null,
  ].filter(isPresent);
  const socialLinks = [
    org.facebook_url ? { href: org.facebook_url, label: "Facebook", icon: Facebook } : null,
    org.instagram_url ? { href: org.instagram_url, label: "Instagram", icon: Instagram } : null,
    org.linkedin_url ? { href: org.linkedin_url, label: "LinkedIn", icon: Linkedin } : null,
    org.youtube_url ? { href: org.youtube_url, label: "YouTube", icon: Youtube } : null,
    org.tiktok_url ? { href: org.tiktok_url, label: "TikTok", icon: Music } : null,
  ].filter(Boolean);
  const contactHref = org.email
    ? `mailto:${org.email}`
    : org.website || `/organizer/${org.slug}#contact`;

  return (
    <PageMotion>
    <div className="bg-white">
      <section className="cw-container py-8">
        <div className="rounded-[20px] border border-[#E6E8EE] bg-white p-6 shadow-[0_8px_24px_rgba(14,15,18,0.09)] md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#E6E8EE] bg-[#E1ECF6] text-3xl font-extrabold text-[#125B9A]">
              {org.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={org.logo_url} alt={org.name} className="h-full w-full object-cover" />
              ) : (
                initials(org.name)
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-[#0B1320] md:text-[28px]">
                  {org.name}
                </h1>
                {org.is_verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E1ECF6] px-3 py-1 text-xs font-bold text-[#125B9A]">
                    <BadgeCheck className="h-3.5 w-3.5 text-[#16A34A]" />
                    Verified
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {org.industry && (
                  <span className="rounded-full border border-[#E6E8EE] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#555555]">
                    {org.industry}
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E8EE] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#555555]">
                    <MapPin className="h-3.5 w-3.5" />
                    {location}
                  </span>
                )}
                <span className="rounded-full border border-[#E6E8EE] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#555555]">
                  Since {new Date(org.created_at).getFullYear()}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button asChild className="rounded-full bg-[#F05A7E] px-5 hover:bg-[#E34B70]">
                  <Link href="#campaigns">View Campaigns</Link>
                </Button>
                {org.website && (
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-[#125B9A] text-[#125B9A] hover:bg-[#E1ECF6]"
                  >
                    <a href={org.website} target="_blank" rel="noreferrer">
                      Website <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-[#125B9A] text-[#125B9A] hover:bg-[#E1ECF6]"
                >
                  <a href={contactHref}>Contact</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full border-[#E6E8EE] bg-[#F8F9FB]"
                >
                  <Link href={`/organizer/${org.slug}`} aria-label={`Share ${org.name}`}>
                    <Share2 className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-5 rounded-xl bg-[#F8F9FB] p-3 text-xs font-semibold text-[#555555]">
            {org.is_verified && (
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-[#16A34A]" />
                Verified organizer
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {activeYears} {activeYears === 1 ? "year" : "years"} active
            </span>
            <span className="inline-flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              {publicCampaigns.length} campaigns hosted
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              {participantCount} participants engaged
            </span>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8A8F99]">
              Badges earned · {Math.min(6, Math.max(3, publicCampaigns.length + (org.is_verified ? 1 : 0)))}
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              {BADGE_STYLES.map((style, index) => (
                <span
                  key={style}
                  className={`grid h-12 w-12 place-items-center rounded-full text-white ${style}`}
                  aria-label={`Organizer badge ${index + 1}`}
                >
                  <Award className="h-5 w-5" />
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-[#E6E8EE] pt-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
            <Metric value={publicCampaigns.length} label="Campaigns" />
            <Divider />
            <Metric value={participantCount} label="Participants" />
            <Divider />
            <Metric value={activeYears} label="Years Active" />
          </div>
        </div>
      </section>

      <section className="cw-container grid gap-6 py-8 lg:grid-cols-[minmax(0,2fr)_440px]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0B1320]">About {org.name}</h2>
          <div className="mt-4 space-y-4">
            {aboutParagraphs.map((paragraph) => (
              <p key={paragraph} className="max-w-3xl text-[15px] font-medium leading-relaxed text-[#555555]">
                {paragraph}
              </p>
            ))}
          </div>
          {valuePills.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {valuePills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full bg-[#E1ECF6] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#125B9A]"
                >
                  {pill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[#E6E8EE] bg-white p-6">
          <h3 className="text-base font-bold text-[#0B1320]">Quick facts</h3>
          <dl className="mt-4 space-y-4 text-sm">
            <Fact label="Founded" value={String(new Date(org.created_at).getFullYear())} />
            {org.industry && <Fact label="Industry" value={org.industry} />}
            <Fact label="Location" value={location || "Malaysia"} />
            <Fact label="Verified" value={org.is_verified ? "Yes" : "Pending"} />
          </dl>
        </div>
      </section>

      <section id="contact" className="cw-container grid gap-6 pb-8 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className="rounded-xl border border-[#E6E8EE] bg-white p-6">
          <h2 className="text-base font-bold text-[#0B1320]">Get in touch</h2>
          <div className="mt-4 grid gap-3">
            {org.phone && (
              <ContactRow icon={Phone} href={`tel:${org.phone}`} label={org.phone} />
            )}
            {org.email && (
              <ContactRow icon={Mail} href={`mailto:${org.email}`} label={org.email} />
            )}
            {org.website && (
              <ContactRow icon={Globe} href={org.website} label={formatUrlLabel(org.website)} external />
            )}
            {location && <ContactRow icon={MapPin} label={location} />}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-[#8A8F99]">Share</span>
            <SocialButton href={`mailto:?subject=${encodeURIComponent(org.name)}&body=${encodeURIComponent(`/organizer/${org.slug}`)}`} label="Email">
              <Mail className="h-4 w-4" />
            </SocialButton>
            <SocialButton href={`/organizer/${org.slug}`} label="Copy link">
              <LinkIcon className="h-4 w-4" />
            </SocialButton>
          </div>
        </div>

        <div className="rounded-xl border border-[#E6E8EE] bg-white p-6">
          <h2 className="text-base font-bold text-[#0B1320]">Social media</h2>
          {socialLinks.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                if (!social) return null;
                const Icon = social.icon;
                return (
                  <SocialButton key={social.href} href={social.href} label={social.label} external>
                    <Icon className="h-5 w-5" />
                  </SocialButton>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm font-medium text-[#555555]">
              Social channels have not been added yet.
            </p>
          )}
        </div>
      </section>

      <section id="campaigns" className="bg-white py-8">
        <div className="cw-container">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-[#0B1320]">
              Campaigns by {org.name} ({publicCampaigns.length})
            </h2>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <FilterPill active label={`All (${publicCampaigns.length})`} />
            <FilterPill label={`Active (${activeCampaigns.length})`} />
            <FilterPill label={`Past (${pastCampaigns.length})`} />
          </div>

          {publicCampaigns.length === 0 ? (
            <div className="mt-6 rounded-[18px] border border-dashed border-[#E6E8EE] bg-white p-8 text-sm font-medium text-[#555555]">
              This organizer hasn&apos;t published any campaigns yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {publicCampaigns.map((campaign) => (
                <article
                  key={campaign.id}
                  data-motion="card"
                  className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-[#E6E8EE] bg-white shadow-[0_6px_18px_rgba(11,19,32,0.07)] transition-transform hover:-translate-y-0.5 will-change-transform"
                >
                  <div className="relative flex h-44 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#F05A7E] to-[#3B215B] p-4">
                    {campaign.banner_url && (
                      <>
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                          style={{ backgroundImage: `url(${campaign.banner_url})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#F05A7E]/75 to-[#3B215B]/80" />
                      </>
                    )}
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {campaign.category && (
                          <Badge className="border-transparent bg-white/95 text-[#0B1320]">
                            {campaign.category}
                          </Badge>
                        )}
                        <Badge className="border-transparent bg-[#F05A7E] text-white">
                          {TYPE_LABELS[campaign.type]}
                        </Badge>
                      </div>
                      {campaign.status === "closed" ? (
                        <Badge variant="destructive">Closed</Badge>
                      ) : (
                        <Badge variant="success">
                          {timeUntil(campaign.submission_deadline) ?? "Active"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <Link href={`/campaigns/${campaign.slug}`}>
                      <h3 className="line-clamp-2 text-[17px] font-extrabold leading-tight text-[#0B1320] transition-colors group-hover:text-[#F05A7E]">
                        {campaign.title}
                      </h3>
                    </Link>
                    {campaign.short_description && (
                      <p className="mt-3 line-clamp-2 text-[13px] font-medium leading-relaxed text-[#555555]">
                        {campaign.short_description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-[#555555]">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(campaign.submission_start, { day: "numeric", month: "short" })}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {campaign.submissions_count ?? 0} entries
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {campaign.entry_fee > 0
                          ? `${formatCurrency(campaign.entry_fee, campaign.currency)} entry`
                          : "Free entry"}
                      </span>
                    </div>

                    {campaign.sdg_goals.length > 0 && (
                      <SdgRow goals={campaign.sdg_goals} size={26} max={5} className="mt-4" />
                    )}

                    <div className="mt-auto border-t border-[#E6E8EE] pt-4">
                      <Button asChild className="rounded-full bg-[#F05A7E] px-5 hover:bg-[#E34B70]">
                        <Link href={`/campaigns/${campaign.slug}`}>
                          {campaign.status === "closed" ? "View results" : "Join campaign"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#F05A7E] to-[#125B9A] py-14 text-white">
        <div className="cw-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-2xl text-2xl font-bold md:text-[28px]">
              Want to host a campaign with {org.name}?
            </h2>
            <p className="mt-2 text-sm font-medium text-white/80">Reach out and start a conversation.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild className="rounded-full bg-white px-6 text-[#125B9A] hover:bg-white/90">
              <a href={contactHref}>{org.email ? "Email us" : "Contact organizer"}</a>
            </Button>
            <div className="grid h-16 w-16 place-items-center rounded-xl bg-white/15 text-xl font-extrabold text-white/70">
              {initials(org.name)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FCE6EC] py-7">
        <div className="cw-container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold text-black">
            Organize with purpose — get organizer tips monthly.
          </p>
          <Button asChild className="rounded-full bg-[#F05A7E] px-5 hover:bg-[#E34B70]">
            <Link href="/sign-up?role=organizer">Subscribe</Link>
          </Button>
        </div>
      </section>
    </div>
    </PageMotion>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center md:text-left">
      <div className="text-3xl font-extrabold text-[#0B1320]">{value}</div>
      <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#8A8F99]">
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="hidden h-12 w-px bg-[#E6E8EE] md:block" />;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-medium text-[#8A8F99]">{label}</dt>
      <dd className="text-right font-bold text-[#0B1320]">{value}</dd>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  href,
  label,
  external,
}: {
  icon: typeof Phone;
  href?: string;
  label: string;
  external?: boolean;
}) {
  const content = (
    <>
      <Icon className="h-[18px] w-[18px] text-[#125B9A]" />
      <span className="truncate">{label}</span>
    </>
  );

  if (!href) {
    return (
      <div className="flex items-center gap-3 rounded-md bg-[#F8F9FB] px-3 py-2.5 text-sm font-semibold text-black">
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="flex items-center gap-3 rounded-md bg-[#F8F9FB] px-3 py-2.5 text-sm font-semibold text-black hover:text-[#125B9A]"
    >
      {content}
    </a>
  );
}

function SocialButton({
  href,
  label,
  external,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: ReactNode;
}) {
  const className =
    "grid h-11 w-11 place-items-center rounded-full border border-[#E6E8EE] bg-[#F8F9FB] text-[#555555] transition-colors hover:border-[#125B9A] hover:text-[#125B9A]";

  if (external || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className={className}
        aria-label={label}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} aria-label={label}>
      {children}
    </Link>
  );
}

function FilterPill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className={
        active
          ? "rounded-full border border-[#F05A7E] bg-[#F05A7E] px-4 py-2 text-sm font-bold text-white"
          : "rounded-full border border-[#E6E8EE] bg-white px-4 py-2 text-sm font-bold text-[#555555]"
      }
    >
      {label}
    </span>
  );
}
