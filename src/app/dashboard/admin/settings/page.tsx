import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getPlatformSettings } from "@/lib/platform/settings";
import { toggleCampaignApprovalAction } from "./actions";

export const metadata = { title: "Platform settings" };

export default async function AdminSettingsPage() {
  const { profile } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");

  const settings = await getPlatformSettings();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-body">Platform settings</h1>
        <p className="text-text-secondary">Global toggles for campaign workflows.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Campaign approval</CardTitle>
          <CardDescription>
            When enabled, organizers submit campaigns for admin review instead of publishing directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-text-secondary">
            Currently: <strong>{settings.require_campaign_approval ? "Enabled" : "Disabled"}</strong>
          </p>
          <form action={async () => {
            "use server";
            await toggleCampaignApprovalAction(!settings.require_campaign_approval);
          }}>
            <Button type="submit" variant={settings.require_campaign_approval ? "outline" : "default"}>
              {settings.require_campaign_approval ? "Disable approval gate" : "Enable approval gate"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
