import { redirect } from "next/navigation";
import { RefreshCw, Sparkles, Ticket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { syncBadgeReevalAction, syncCouponsAction, syncTokensAction, regenerateMockupsAction } from "./actions";

export const metadata = { title: "Sync Center" };

export default async function AdminSyncPage() {
  const { profile } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");

  const supabase = await createClient();

  const [{ data: campaigns }, { data: recentSync }] = await Promise.all([
    supabase.from("campaigns").select("id, title, slug").order("title").limit(100),
    supabase
      .from("audit_log")
      .select("action, details, created_at")
      .like("action", "sync.%")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-body">Sync Center</h1>
        <p className="text-text-secondary">Bulk maintenance jobs for badges, coupons, and upload tokens.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Badge re-evaluation
            </CardTitle>
            <CardDescription>Re-run badge rules for all users (batch of 500).</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={async () => {
              "use server";
              await syncBadgeReevalAction();
            }}>
              <Button type="submit" size="sm">
                <RefreshCw className="h-4 w-4" /> Run badge re-eval
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-4 w-4" /> Coupon sync
            </CardTitle>
            <CardDescription>Re-sync school coupon codes to sponsor_coupons.</CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignSyncForm
              campaigns={campaigns ?? []}
              actionName="coupons"
              label="Sync coupons"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Token extension
            </CardTitle>
            <CardDescription>Extend upload token expiry by 90 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignSyncForm
              campaigns={campaigns ?? []}
              actionName="tokens"
              label="Extend tokens"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Mockup backfill
            </CardTitle>
            <CardDescription>Regenerate missing mockup PNGs for design submissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignSyncForm
              campaigns={campaigns ?? []}
              actionName="mockups"
              label="Regenerate mockups"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent sync runs</CardTitle>
          <CardDescription>From audit log.</CardDescription>
        </CardHeader>
        <CardContent>
          {!recentSync || recentSync.length === 0 ? (
            <p className="text-sm text-text-secondary">No sync jobs recorded yet.</p>
          ) : (
            <ul className="divide-y">
              {recentSync.map((row, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-bold text-body">{row.action}</span>
                  <Badge variant="outline">{formatDate(row.created_at, { dateStyle: "medium", timeStyle: "short" })}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CampaignSyncForm({
  campaigns,
  actionName,
  label,
}: {
  campaigns: { id: string; title: string }[];
  actionName: "coupons" | "tokens" | "mockups";
  label: string;
}) {
  if (campaigns.length === 0) {
    return <p className="text-sm text-text-secondary">No campaigns available.</p>;
  }

  return (
    <form
      action={async (fd) => {
        "use server";
        const campaignId = String(fd.get("campaign_id") ?? "");
        if (!campaignId) return;
        if (actionName === "coupons") await syncCouponsAction(campaignId);
        else if (actionName === "tokens") await syncTokensAction(campaignId);
        else await regenerateMockupsAction(campaignId);
      }}
      className="flex flex-col gap-2"
    >
      <select name="campaign_id" className="rounded-md border px-2 py-1.5 text-sm" required defaultValue="">
        <option value="" disabled>Select campaign</option>
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>
      <Button type="submit" size="sm">{label}</Button>
    </form>
  );
}
