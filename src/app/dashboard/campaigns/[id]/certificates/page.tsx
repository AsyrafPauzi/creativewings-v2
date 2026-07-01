import Link from "next/link";
import { notFound } from "next/navigation";

import { CertificateLayoutForm } from "@/components/campaigns/certificate-layout-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

import {
  emailAllCertificatesAction,
  emailCertificateAction,
  generateAllCertificatesAction,
  generateCertificateAction,
} from "./actions";

async function generateOne(campaignId: string, submissionId: string) {
  "use server";
  await generateCertificateAction(campaignId, submissionId);
}

async function generateAll(campaignId: string) {
  "use server";
  await generateAllCertificatesAction(campaignId);
}

async function emailOne(campaignId: string, certId: string) {
  "use server";
  await emailCertificateAction(campaignId, certId);
}

async function emailAll(campaignId: string) {
  "use server";
  await emailAllCertificatesAction(campaignId);
}

export default async function CampaignCertificatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole("organizer");
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, title, enable_certificate, certificate_template_url, certificate_layout")
    .eq("id", id)
    .maybeSingle();
  if (!campaign) notFound();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, student_name, status, moderation_status, contestant_id")
    .eq("campaign_id", id)
    .eq("moderation_status", "approved")
    .in("status", ["paid", "approved", "shortlisted", "winner"])
    .not("contestant_id", "is", null)
    .order("created_at", { ascending: false });

  const { data: issued } = await supabase
    .from("issued_certificates")
    .select("id, submission_id, issued_at, emailed_at")
    .eq("campaign_id", id);

  const issuedBySub = new Map((issued ?? []).map((c) => [c.submission_id, c]));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">
          <Link href={`/dashboard/campaigns/${id}`} className="hover:underline">
            ← Back to campaign
          </Link>
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
        <p className="text-muted-foreground">{campaign.title}</p>
      </header>

      {!campaign.enable_certificate ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Enable certificates in campaign settings first.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Template & layout</CardTitle>
              <CardDescription>Upload a background image and position text fields.</CardDescription>
            </CardHeader>
            <CardContent>
              <CertificateLayoutForm
                campaignId={id}
                templateUrl={campaign.certificate_template_url}
                layout={campaign.certificate_layout ?? {}}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Issue certificates</CardTitle>
                <CardDescription>Generate PNG certificates for eligible submissions.</CardDescription>
              </div>
              <form action={generateAll.bind(null, id)}>
                <Button type="submit" size="sm">
                  Generate all
                </Button>
              </form>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={emailAll.bind(null, id)}>
                <Button type="submit" size="sm" variant="outline">
                  Email all issued
                </Button>
              </form>

              <ul className="divide-y rounded-md border">
                {(submissions ?? []).length === 0 ? (
                  <li className="p-4 text-sm text-muted-foreground">No eligible submissions.</li>
                ) : (
                  submissions!.map((sub) => {
                    const cert = issuedBySub.get(sub.id);
                    return (
                      <li key={sub.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div>
                          <div className="font-medium">{sub.student_name ?? "Participant"}</div>
                          <div className="text-xs text-muted-foreground capitalize">{sub.status}</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {cert ? (
                            <>
                              <Badge variant="success">Issued {formatDate(cert.issued_at)}</Badge>
                              {cert.emailed_at ? (
                                <Badge variant="outline">Emailed</Badge>
                              ) : null}
                              <form action={emailOne.bind(null, id, cert.id)}>
                                <Button type="submit" size="sm" variant="outline">
                                  Email
                                </Button>
                              </form>
                            </>
                          ) : (
                            <form action={generateOne.bind(null, id, sub.id)}>
                              <Button type="submit" size="sm">
                                Generate
                              </Button>
                            </form>
                          )}
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
