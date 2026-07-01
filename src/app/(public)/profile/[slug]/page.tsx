import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Bookmark,
  Briefcase,
  ChevronRight,
  CircleCheck,
  ExternalLink,
  Eye,
  Facebook,
  Globe,
  Heart,
  Instagram,
  MapPin,
  MessageCircle,
  UserPlus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageMotion } from "@/components/site/animations/page-motion";
import { SdgRow } from "@/components/site/sdg-icons";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const revalidate = 120;

const THUMB_FALLBACKS = [
  "#2A3A4F",
  "#4A2A3F",
  "#2A4A3A",
  "#1E3A5F",
  "#5A3A2A",
  "#4A4A2A",
  "#3A2A4F",
  "#2A4A4A",
  "#3A4A2A",
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value != null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("creators")
    .select("display_name, tagline")
    .eq("slug", slug)
    .maybeSingle();
  return {
    title: data?.display_name ?? "Creator",
    description: data?.tagline ?? undefined,
  };
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: creator } = await supabase
    .from("creators")
    .select(
      "id, slug, display_name, tagline, bio, profile_image_url, cover_image_url, city, country, website, facebook_url, instagram_url, behance_url, dribbble_url, tiktok_url, owner_id, created_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!creator) notFound();

  const { data: projects } = await supabase
    .from("portfolio_projects")
    .select(
      "id, slug, title, cover_url, description, tools, tags, sdg_goals, views_count, likes_count, published_at",
    )
    .eq("creator_id", creator.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  const publishedProjects = projects ?? [];
  const totalViews = publishedProjects.reduce((sum, project) => sum + (project.views_count ?? 0), 0);
  const totalLikes = publishedProjects.reduce((sum, project) => sum + (project.likes_count ?? 0), 0);
  const projectCount = publishedProjects.length;
  const location = [creator.city, creator.country].filter(Boolean).join(", ");
  const focusGoals = Array.from(
    new Set(publishedProjects.flatMap((project) => project.sdg_goals ?? [])),
  ).slice(0, 6);
  const skills = Array.from(
    new Set(publishedProjects.flatMap((project) => [...(project.tags ?? []), ...(project.tools ?? [])])),
  ).slice(0, 8);
  const primaryLink = creator.website ?? `/sign-up?role=organizer`;

  return (
    <PageMotion>
    <div className="bg-background text-body">
      <section data-motion="fade" className="relative h-[290px] overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-[220px] bg-cover bg-center"
          style={
            creator.cover_image_url
              ? { backgroundImage: `linear-gradient(rgba(26, 26, 31, 0.38), rgba(45, 31, 36, 0.38)), url(${creator.cover_image_url})` }
              : {
                  backgroundImage:
                    "linear-gradient(180deg, #1A1A1F 0%, #2D1F24 50%, #1A1A1F 100%)",
                }
          }
        />
        <div className="cw-container absolute inset-x-0 bottom-0">
          <div className="flex h-[140px] items-end">
            <div className="grid h-[130px] w-[130px] place-items-center overflow-hidden rounded-full border-[5px] border-white bg-white">
              <div className="grid h-[120px] w-[120px] place-items-center overflow-hidden rounded-full bg-primary text-4xl font-bold text-white">
                {creator.profile_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={creator.profile_image_url}
                    alt={creator.display_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials(creator.display_name)
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="cw-container grid gap-10 pb-12 pt-14 lg:grid-cols-[310px_1fr]">
        <aside className="space-y-5">
          <section>
            <h1 className="flex items-center gap-2 text-[26px] font-bold leading-tight text-body">
              {creator.display_name}
              <BadgeCheck className="h-5 w-5 text-primary" aria-label="Verified creator" />
            </h1>
            <p className="mt-1 text-[13px] text-text-secondary">@{creator.slug}</p>

            <div className="mt-4 space-y-1.5 text-[13px] text-text-secondary">
              <span className="flex items-center gap-1.5">
                <CircleCheck className="h-3.5 w-3.5" />
                Available for freelance
              </span>
              {creator.tagline && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  {creator.tagline}
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              )}
            </div>
          </section>

          <section className="space-y-2">
            <Link
              href="/sign-up"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
            >
              <UserPlus className="h-4 w-4" />
              Follow
            </Link>
            <a
              href={primaryLink}
              target={creator.website ? "_blank" : undefined}
              rel={creator.website ? "noreferrer" : undefined}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-secondary bg-white px-5 py-2 text-sm font-bold text-secondary transition-colors hover:bg-secondary-soft"
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </a>
            <Link
              href="/sign-up"
              className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-secondary-soft"
            >
              <Bookmark className="h-4 w-4" />
              Save
            </Link>
          </section>

          <section className="rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold text-body">Hire {creator.display_name.split(" ")[0]}</h2>
            <div className="mt-2 divide-y divide-border text-[13px] text-body">
              <a href={primaryLink} className="flex items-center justify-between py-2.5 hover:text-secondary">
                Freelance brief
                <ChevronRight className="h-4 w-4 text-text-secondary" />
              </a>
              <a href="/sign-up?role=organizer" className="flex items-center justify-between py-2.5 hover:text-secondary">
                Full campaign
                <ChevronRight className="h-4 w-4 text-text-secondary" />
              </a>
            </div>
          </section>

          <section className="divide-y divide-border border-t border-border pt-1 text-[13px]">
            <StatRow label="Project views" value={compactNumber(totalViews)} />
            <StatRow label="Appreciations" value={compactNumber(totalLikes)} />
            <StatRow label="Published projects" value={String(projectCount)} />
            <StatRow label="Member since" value={formatDate(creator.created_at, { month: "short", year: "numeric" })} />
          </section>

          <SidebarSection title="On the web">
            <div className="flex flex-wrap gap-3">
              {creator.instagram_url && <SocialIcon href={creator.instagram_url} label="Instagram" icon={<Instagram className="h-4 w-4" />} />}
              {creator.facebook_url && <SocialIcon href={creator.facebook_url} label="Facebook" icon={<Facebook className="h-4 w-4" />} />}
              {creator.website && <SocialIcon href={creator.website} label="Website" icon={<Globe className="h-4 w-4" />} />}
              {!creator.instagram_url && !creator.facebook_url && !creator.website && (
                <p className="text-[13px] text-text-muted">No social links added yet.</p>
              )}
            </div>
          </SidebarSection>

          {(creator.website || creator.dribbble_url || creator.behance_url || creator.tiktok_url) && (
            <SidebarSection title="Links">
              <div className="space-y-2">
                {[creator.website, creator.dribbble_url, creator.behance_url, creator.tiktok_url].filter(isDefined).map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-secondary hover:text-secondary-hover"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {displayUrl(url)}
                  </a>
                ))}
              </div>
            </SidebarSection>
          )}

          {creator.bio && (
            <SidebarSection title="About me">
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-text-secondary">{creator.bio}</p>
            </SidebarSection>
          )}

          {focusGoals.length > 0 && (
            <SidebarSection title="SDG focus">
              <SdgRow goals={focusGoals} size={28} max={6} />
            </SidebarSection>
          )}

          {skills.length > 0 && (
            <SidebarSection title="Skills">
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <Badge key={skill} variant="outline" size="sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </SidebarSection>
          )}
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="flex gap-6 overflow-x-auto border-b border-border text-sm">
            <ProfileTab label="Created" active />
            <ProfileTab label="Saved" />
            <ProfileTab label="Appreciated" />
            <ProfileTab label="About" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary">
            <div className="flex items-center gap-4">
              <span>Sort:</span>
              <span className="font-semibold text-body">Recent</span>
              <span>Popular</span>
            </div>
            <span>{projectCount} projects</span>
          </div>

          {projectCount === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface p-12 text-center">
              <p className="text-base font-semibold text-body">No projects yet</p>
              <p className="mt-1 text-sm text-text-muted">
                {creator.display_name} hasn&apos;t published any portfolio pieces yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {publishedProjects.map((project, index) => (
                <Link
                  key={project.id}
                  href={`/profile/${creator.slug}/p/${project.slug}`}
                  className="group block min-w-0"
                  data-motion="card"
                >
                  <div
                    className="h-[200px] overflow-hidden rounded bg-cover bg-center transition-opacity group-hover:opacity-90"
                    style={
                      project.cover_url
                        ? { backgroundImage: `url(${project.cover_url})` }
                        : { backgroundColor: THUMB_FALLBACKS[index % THUMB_FALLBACKS.length] }
                    }
                  />
                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-body group-hover:text-primary">
                      {project.title}
                    </h3>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-text-secondary">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {compactNumber(project.likes_count ?? 0)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {compactNumber(project.views_count ?? 0)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="border-t border-border bg-surface">
        <div className="cw-container flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-body">Want to collaborate?</h2>
            <p className="mt-1 text-[13px] text-text-secondary">
              Reach out for freelance briefs or full campaign partnerships.
            </p>
          </div>
          <a
            href={primaryLink}
            target={creator.website ? "_blank" : undefined}
            rel={creator.website ? "noreferrer" : undefined}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </a>
        </div>
      </section>
    </div>
    </PageMotion>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-text-secondary">{label}</span>
      <span className="font-semibold text-body">{value}</span>
    </div>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border pt-4">
      <h2 className="text-[13px] font-semibold text-body">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function SocialIcon({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-md border border-border transition-colors hover:border-body"
    >
      {icon}
    </a>
  );
}

function ProfileTab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={
        active
          ? "border-b-[3px] border-primary px-0.5 pb-2 pt-1 font-bold text-primary"
          : "border-b-[3px] border-transparent px-0.5 pb-2 pt-1 font-medium text-text-secondary"
      }
    >
      {label}
    </button>
  );
}
