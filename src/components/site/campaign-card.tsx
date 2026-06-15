import Link from "next/link";
import { Calendar, Clock, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SdgRow } from "@/components/site/sdg-icons";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface CampaignCardData {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  banner_url: string | null;
  category: string | null;
  type: "competition" | "activity";
  status: string;
  entry_fee: number;
  currency: string;
  submission_start: string | null;
  submission_deadline: string | null;
  sdg_goals: number[];
  organizer?: { business_name: string; slug: string; logo_url: string | null } | null;
}

export function CampaignCard({ campaign }: { campaign: CampaignCardData }) {
  const isClosed = campaign.status === "closed";
  const dateText = formatDate(campaign.submission_start, {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeText = campaign.submission_start
    ? new Date(campaign.submission_start).toLocaleTimeString("en-MY", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kuala_Lumpur",
      }) + " (GMT +08:00)"
    : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <div
          className="absolute inset-0 cw-gradient-bg bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={
            campaign.banner_url
              ? { backgroundImage: `url(${campaign.banner_url})` }
              : undefined
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {campaign.category && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow">
            <Tag className="h-3 w-3" />
            {campaign.category}
          </span>
        )}
        {isClosed && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow">
            Closed
          </span>
        )}
        {!isClosed && (
          <Badge
            variant={campaign.type === "competition" ? "default" : "secondary"}
            className="absolute right-3 top-3 capitalize"
          >
            {campaign.type}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/campaigns/${campaign.slug}`}>
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
            {campaign.title}
          </h3>
        </Link>

        {campaign.organizer && (
          <Link
            href={`/organizer/${campaign.organizer.slug}`}
            className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <span className="grid h-6 w-6 place-items-center overflow-hidden rounded-full border bg-background text-[10px] font-bold text-primary">
              {campaign.organizer.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={campaign.organizer.logo_url}
                  alt={campaign.organizer.business_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                campaign.organizer.business_name.slice(0, 2).toUpperCase()
              )}
            </span>
            {campaign.organizer.business_name}
          </Link>
        )}

        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {dateText}
          </li>
          {timeText && (
            <li className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              {timeText}
            </li>
          )}
          <li className="flex items-center gap-2">
            <span className="text-foreground font-semibold">
              {formatCurrency(campaign.entry_fee, campaign.currency)}
            </span>
          </li>
        </ul>

        {campaign.sdg_goals.length > 0 && (
          <div className="mt-5 border-t pt-4">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Sustainable Development Goals (SDGs)
            </div>
            <div className="mt-2">
              <SdgRow goals={campaign.sdg_goals} />
            </div>
          </div>
        )}

        <div className="mt-auto pt-5">
          {isClosed ? (
            <Button variant="outline" className="w-full" disabled>
              Campaign Closed
            </Button>
          ) : (
            <Button asChild variant="brand" className="w-full">
              <Link href={`/campaigns/${campaign.slug}`}>View &amp; Join</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
