import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { requireRole } from "@/lib/auth";
import { createCampaignAction } from "../actions";

export const metadata = { title: "New campaign" };

export default async function NewCampaignPage() {
  await requireRole("business");

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/dashboard/campaigns" className="hover:underline">
              ← Back to campaigns
            </Link>
          </p>
          <h1 className="text-3xl font-bold tracking-tight">New campaign</h1>
          <p className="text-muted-foreground">
            Drafts are private. You can publish your campaign once it&apos;s ready.
          </p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/dashboard/campaigns">Cancel</Link>
        </Button>
      </header>
      <CampaignForm action={createCampaignAction} submitLabel="Create campaign" />
    </div>
  );
}
