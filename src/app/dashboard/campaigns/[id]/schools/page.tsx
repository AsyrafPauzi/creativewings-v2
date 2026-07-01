import Link from "next/link";
import { notFound } from "next/navigation";

import { SchoolsPanel } from "@/components/dashboard/schools/schools-panel";
import { StagedPanel } from "@/components/dashboard/schools/staged-panel";
import { TokensPanel } from "@/components/dashboard/schools/tokens-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireRole } from "@/lib/auth";
import { getAppUrl } from "@/lib/payments/app-url";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

import { createCouponAction, toggleCouponAction } from "./actions";

async function toggleCouponForm(campaignId: string, couponId: string, isActive: boolean) {
  "use server";
  await toggleCouponAction(campaignId, couponId, isActive);
}

export default async function CampaignSchoolsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole("organizer");
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, title, enable_school_sponsors, serial_code")
    .eq("id", id)
    .maybeSingle();
  if (!campaign) notFound();

  const { data: schools } = await supabase
    .from("schools")
    .select("*")
    .eq("campaign_id", id)
    .order("school_code");

  const { data: tokens } = await supabase
    .from("upload_tokens")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false });

  const { data: staged } = await supabase
    .from("submissions")
    .select("*, schools:school_id(*)")
    .eq("campaign_id", id)
    .eq("status", "staged")
    .order("created_at", { ascending: false });

  const { data: coupons } = await supabase
    .from("sponsor_coupons")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false });

  const createAction = createCouponAction.bind(null, id);
  const appUrl = getAppUrl();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">
          <Link href={`/dashboard/campaigns/${id}`} className="hover:underline">
            ← Back to campaign
          </Link>
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Schools & uploads</h1>
        <p className="text-muted-foreground">
          {campaign.title}
          {campaign.serial_code ? ` · Listing ID ${campaign.serial_code}` : ""}
        </p>
      </header>

      {!campaign.enable_school_sponsors ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Enable <strong>School sponsors</strong> in campaign settings to use school upload
            tokens, staged submissions, and the parent claim flow.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/campaigns/${id}/schools/export/staged`}>Export staged CSV</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/campaigns/${id}/schools/export/codes`}>Export codes CSV</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/campaigns/${id}/schools/export/qr`} target="_blank">
                QR sheet
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Schools</CardTitle>
              <CardDescription>
                Each school gets a 3-digit code used in submission codes (CCC-MM-SEQ).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchoolsPanel campaignId={id} schools={schools ?? []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload tokens</CardTitle>
              <CardDescription>
                Share PIC upload links with schools. Tokens expire after 90 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TokensPanel
                campaignId={id}
                schools={schools ?? []}
                tokens={tokens ?? []}
                appUrl={appUrl}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staged submissions</CardTitle>
              <CardDescription>
                Approve uploads before parents can claim them with the submission code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StagedPanel
                campaignId={id}
                staged={(staged ?? []).map((row) => ({
                  ...row,
                  schools: Array.isArray(row.schools) ? row.schools[0] : row.schools,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sponsor coupons</CardTitle>
              <CardDescription>
                General fee-waiver codes. School-specific coupons sync from each school&apos;s
                coupon field.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form action={createAction} className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="code">Coupon code</Label>
                  <Input id="code" name="code" placeholder="SCHOOL100" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_uses">Max uses (0 = unlimited)</Label>
                  <Input id="max_uses" name="max_uses" type="number" min={0} defaultValue={0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expires (optional)</Label>
                  <Input id="expires_at" name="expires_at" type="date" />
                </div>
                <div className="md:col-span-4">
                  <Button type="submit">Add coupon</Button>
                </div>
              </form>

              <ul className="divide-y rounded-md border">
                {(coupons ?? []).length === 0 ? (
                  <li className="p-4 text-sm text-muted-foreground">No coupons yet.</li>
                ) : (
                  coupons!.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div>
                        <div className="font-bold">{c.code}</div>
                        <div className="text-xs text-muted-foreground">
                          Used {c.used_count}
                          {c.max_uses > 0 ? ` / ${c.max_uses}` : ""}
                          {c.expires_at ? ` · Expires ${formatDate(c.expires_at)}` : ""}
                          {c.school_id ? " · School-linked" : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={c.is_active ? "success" : "outline"}>
                          {c.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <form action={toggleCouponForm.bind(null, id, c.id, !c.is_active)}>
                          <Button type="submit" size="sm" variant="outline">
                            {c.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        </form>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
