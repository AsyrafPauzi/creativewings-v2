import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { requireRole } from "@/lib/auth";
import { loadSubCategories } from "@/lib/sub-categories";
import { createCampaignAction } from "../actions";

export const metadata = { title: "New campaign" };

export default async function NewCampaignPage() {
  await requireRole("organizer");
  const subCategories = await loadSubCategories();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">
            <Link href="/dashboard/campaigns" className="hover:underline">
              ← Back to campaigns
            </Link>
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-body">New campaign</h1>
          <p className="text-text-secondary">
            Drafts are private. You can publish your campaign once it&apos;s ready.
          </p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/dashboard/campaigns">Cancel</Link>
        </Button>
      </header>
      <CampaignForm
        action={createCampaignAction}
        submitLabel="Create campaign"
        subCategories={subCategories}
      />
    </div>
  );
}
