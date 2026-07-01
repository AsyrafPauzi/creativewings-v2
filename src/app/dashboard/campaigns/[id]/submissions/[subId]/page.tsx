import { notFound } from "next/navigation";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

import { saveReviewAction, setSubmissionStatusAction } from "../actions";
import { regenerateMockupAction } from "../regenerate-mockup";

async function saveForm(campaignId: string, subId: string, formData: FormData) {
  "use server";
  await saveReviewAction(campaignId, subId, formData);
}

async function statusForm(
  campaignId: string,
  subId: string,
  status: Parameters<typeof setSubmissionStatusAction>[2],
) {
  "use server";
  await setSubmissionStatusAction(campaignId, subId, status);
}

export default async function ReviewSubmissionPage({
  params,
}: {
  params: Promise<{ id: string; subId: string }>;
}) {
  const { id, subId } = await params;
  await requireRole("organizer");
  const supabase = await createClient();

  const { data: sub } = await supabase
    .from("submissions")
    .select(
      "*, profiles:contestant_id(full_name, email), age_brackets:age_bracket_id(label), campaigns:campaign_id(enable_design, title)",
    )
    .eq("id", subId)
    .maybeSingle();

  if (!sub) notFound();

  const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
  const bracket = Array.isArray(sub.age_brackets) ? sub.age_brackets[0] : sub.age_brackets;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">
          <Link href={`/dashboard/campaigns/${id}/submissions`} className="hover:underline">
            ← Back to submissions
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Review submission</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Participant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>{" "}
            <span className="font-medium">{sub.student_name || profile?.full_name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Contact:</span>{" "}
            <span>{profile?.email}</span>
          </div>
          {sub.submission_code ? (
            <div>
              <span className="text-muted-foreground">Code:</span>{" "}
              <span className="font-mono">{sub.submission_code}</span>
            </div>
          ) : null}
          {bracket ? (
            <div>
              <span className="text-muted-foreground">Category:</span> {bracket.label}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary" className="capitalize">{sub.status}</Badge>
            <Badge variant="outline" className="capitalize">{sub.moderation_status}</Badge>
            {sub.rank != null ? <Badge variant="success">Rank #{sub.rank}</Badge> : null}
            <Badge variant="outline">{sub.vote_count ?? 0} votes</Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Submitted {formatDate(sub.created_at)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artwork & design</CardTitle>
          {sub.design_variant ? (
            <CardDescription>Variant: {sub.design_variant}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Raw artwork</p>
              {sub.artwork_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sub.artwork_url}
                  alt="Artwork"
                  className="max-h-48 rounded border object-contain"
                />
              ) : (
                <p className="text-sm text-muted-foreground">No artwork.</p>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Product mockup</p>
              {sub.mockup_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sub.mockup_url}
                  alt="Mockup"
                  className="max-h-48 rounded border object-contain"
                />
              ) : (
                <p className="text-sm text-muted-foreground">No mockup generated.</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {sub.mockup_url ? (
              <Button asChild size="sm" variant="outline">
                <a href={`/api/mockups/${sub.id}/download`} target="_blank" rel="noreferrer">
                  Download mockup
                </a>
              </Button>
            ) : null}
            {sub.artwork_source_url ? (
              <Button asChild size="sm" variant="outline">
                <a href={sub.artwork_source_url} target="_blank" rel="noreferrer">
                  Download source file
                </a>
              </Button>
            ) : null}
            {sub.artwork_url && sub.design_variant && !sub.mockup_url ? (
              <form action={async () => {
                "use server";
                await regenerateMockupAction(id, subId);
              }}>
                <Button type="submit" size="sm" variant="secondary">Regenerate mockup</Button>
              </form>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Judging & moderation</CardTitle>
          <CardDescription>Score, judge feedback, and workflow status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveForm.bind(null, id, subId)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="score">Judge score</Label>
                <Input
                  id="score"
                  name="score"
                  type="number"
                  step={0.1}
                  defaultValue={sub.score ?? undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rank">Winner rank (1 = first)</Label>
                <Input id="rank" name="rank" type="number" min={1} defaultValue={sub.rank ?? undefined} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="judge_comment">Judge comment</Label>
              <Textarea
                id="judge_comment"
                name="judge_comment"
                rows={3}
                defaultValue={sub.judge_comment ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moderation_note">Moderation note (internal)</Label>
              <Textarea
                id="moderation_note"
                name="moderation_note"
                rows={3}
                defaultValue={sub.moderation_note ?? ""}
              />
            </div>
            <Button type="submit">Save notes & score</Button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2 border-t pt-6">
            <form action={statusForm.bind(null, id, subId, "approved")}>
              <Button type="submit">Approve</Button>
            </form>
            <form action={statusForm.bind(null, id, subId, "shortlisted")}>
              <Button type="submit" variant="secondary">
                Shortlist
              </Button>
            </form>
            <form action={statusForm.bind(null, id, subId, "winner")}>
              <Button type="submit" variant="default">
                Mark winner
              </Button>
            </form>
            <form action={statusForm.bind(null, id, subId, "rejected")}>
              <Button type="submit" variant="destructive">
                Reject
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
