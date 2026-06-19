import Link from "next/link";
import { Calendar, Clock, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SdgRow } from "@/components/site/sdg-icons";
import { formatCurrency, formatDate, timeUntil } from "@/lib/utils";

export interface CampaignCardData {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  banner_url: string | null;
  category: string | null;
  type: "competition" | "activity" | "workshop";
  status: string;
  entry_fee: number;
  currency: string;
  submission_start: string | null;
  submission_deadline: string | null;
  sdg_goals: number[];
  submissions_count?: number | null;
  organizer?: { name: string; slug: string; logo_url: string | null } | null;
}

const TYPE_BADGE: Record<
  CampaignCardData["type"],
  { variant: "default" | "secondary" | "info"; label: string }
> = {
  competition: { variant: "default", label: "Competition" },
  activity: { variant: "secondary", label: "Activity" },
  workshop: { variant: "info", label: "Workshop" },
};

export function CampaignCard({ campaign }: { campaign: CampaignCardData }) {
  const isClosed = campaign.status === "closed";
  const remaining = campaign.submission_deadline
    ? timeUntil(campaign.submission_deadline)
    : null;
  const dateText = formatDate(campaign.submission_start, {
    day: "numeric",
    month: "short",
  });

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-md border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="relative h-44 overflow-hidden bg-surface">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={
            campaign.banner_url
              ? { backgroundImage: `url(${campaign.banner_url})` }
              : { background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)" }
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/35 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          {campaign.category && (
            <Badge variant="soft" className="bg-white/95 text-body shadow-soft backdrop-blur">
              {campaign.category}
            </Badge>
          )}
          <Badge variant={TYPE_BADGE[campaign.type].variant}>
            {TYPE_BADGE[campaign.type].label}
          </Badge>
        </div>

        <div className="absolute right-3 top-3">
          {isClosed ? (
            <Badge variant="destructive" className="shadow-soft">Closed</Badge>
          ) : remaining ? (
            <Badge variant="success" className="shadow-soft">{remaining}</Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/campaigns/${campaign.slug}`}>
          <h3 className="line-clamp-2 text-base font-extrabold leading-snug tracking-tight text-body transition-colors group-hover:text-primary md:text-lg">
            {campaign.title}
          </h3>
        </Link>

        {campaign.organizer && (
          <Link
            href={`/organizer/${campaign.organizer.slug}`}
            className="mt-2 inline-flex items-center gap-2 text-xs text-text-secondary hover:text-body"
          >
            <span className="grid h-6 w-6 place-items-center overflow-hidden rounded-full border bg-background text-[10px] font-bold text-secondary">
              {campaign.organizer.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={campaign.organizer.logo_url} alt={campaign.organizer.name} className="h-full w-full object-cover" />
              ) : (
                campaign.organizer.name.slice(0, 2).toUpperCase()
              )}
            </span>
            {campaign.organizer.name}
          </Link>
        )}

        {campaign.short_description && (
          <p className="mt-3 line-clamp-2 text-sm text-text-secondary">
            {campaign.short_description}
          </p>
        )}

        <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-text-secondary">
          <li className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {dateText}
          </li>
          {campaign.submissions_count != null && (
            <li className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {campaign.submissions_count} entries
            </li>
          )}
          <li className="inline-flex items-center gap-1.5 col-span-2">
            <Clock className="h-3.5 w-3.5" />
            {campaign.entry_fee > 0 ? (
              <span className="font-semibold text-body">
                {formatCurrency(campaign.entry_fee, campaign.currency)} entry
              </span>
            ) : (
              <span className="font-semibold text-success">Free entry</span>
            )}
          </li>
        </ul>

        {campaign.sdg_goals.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <SdgRow goals={campaign.sdg_goals} size={28} max={4} />
          </div>
        )}

        <div className="mt-auto pt-5">
          {isClosed ? (
            <Button variant="outline" className="w-full" disabled>
              Campaign closed
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href={`/campaigns/${campaign.slug}`}>View &amp; join</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
