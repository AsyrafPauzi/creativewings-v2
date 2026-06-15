import { Trophy } from "lucide-react";

import { CampaignCard, type CampaignCardData } from "@/components/site/campaign-card";

interface Props {
  campaigns: CampaignCardData[];
  emptyTitle?: string;
  emptyBody?: string;
}

export function CampaignsGrid({
  campaigns,
  emptyTitle = "No campaigns found",
  emptyBody = "No campaigns are available right now. Check back soon!",
}: Props) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        <Trophy className="mx-auto h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{emptyTitle}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{emptyBody}</p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((c) => (
        <CampaignCard key={c.id} campaign={c} />
      ))}
    </div>
  );
}
