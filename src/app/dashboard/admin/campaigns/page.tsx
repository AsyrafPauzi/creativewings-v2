import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getPlatformSettings } from "@/lib/platform/settings";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import {
  approveCampaignAction,
  rejectCampaignAction,
  transferCampaignAction,
} from "./actions";

export const metadata = { title: "Campaign approval" };

export default async function AdminCampaignsPage() {
  const { profile } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");

  const supabase = await createClient();
  const settings = await getPlatformSettings();

  const [{ data: pending }, { data: organizers }] = await Promise.all([
    supabase
      .from("campaigns")
      .select("id, title, slug, created_at, organizer_id, organizers:organizer_id(name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase.from("organizers").select("id, name, slug").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-body">Campaign approval</h1>
          <p className="text-text-secondary">
            Review campaigns submitted for publication.
            {settings.require_campaign_approval
              ? " Approval gate is enabled."
              : " Approval gate is off — organizers publish directly."}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/admin/settings">
            Platform settings <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </header>

      {!pending || pending.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" /> No pending campaigns
            </CardTitle>
            <CardDescription>All campaigns are either draft, live, or closed.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y">
            {pending.map((c) => {
              const org = Array.isArray(c.organizers) ? c.organizers[0] : c.organizers;
              return (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <div className="font-bold text-body">{c.title}</div>
                    <div className="text-xs text-text-muted">
                      {org?.name ?? "Unknown org"} · Submitted {formatDate(c.created_at)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Pending</Badge>
                    <form action={async () => {
                      "use server";
                      await approveCampaignAction(c.id);
                    }}>
                      <Button type="submit" size="sm">Approve</Button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await rejectCampaignAction(c.id);
                    }}>
                      <Button type="submit" size="sm" variant="outline">Reject</Button>
                    </form>
                  </div>
                  <form
                    action={async (fd) => {
                      "use server";
                      const newOrgId = String(fd.get("organizer_id") ?? "");
                      if (newOrgId) await transferCampaignAction(c.id, newOrgId);
                    }}
                    className="flex w-full items-center gap-2 border-t pt-3 mt-1"
                  >
                    <span className="text-xs text-text-muted shrink-0">Transfer to:</span>
                    <select
                      name="organizer_id"
                      className="flex-1 rounded-md border px-2 py-1 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>Select organizer</option>
                      {(organizers ?? []).map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                    <Button type="submit" size="sm" variant="ghost">Transfer</Button>
                  </form>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
