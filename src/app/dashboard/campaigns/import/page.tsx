import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { ImportCampaignForm } from "@/components/campaigns/import-campaign-form";

export const metadata = { title: "Import campaign" };

export default async function ImportCampaignPage() {
  await requireRole("organizer");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">
          <Link href="/dashboard/campaigns" className="hover:underline">← Back to campaigns</Link>
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-body">Import campaign</h1>
        <p className="text-text-secondary">
          Upload a CreativeWings campaign JSON export (schema v1). Creates a new draft campaign.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>JSON file</CardTitle>
          <CardDescription>Must include schema_version: 1 and a campaign object.</CardDescription>
        </CardHeader>
        <CardContent>
          <ImportCampaignForm />
        </CardContent>
      </Card>
    </div>
  );
}
