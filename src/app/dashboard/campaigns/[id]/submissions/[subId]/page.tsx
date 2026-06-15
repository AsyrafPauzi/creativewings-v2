import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
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
import type { CWModerationStatus, CWSubmissionStatus } from "@/lib/supabase/database.types";

async function moderateAction(
  campaignId: string,
  subId: string,
  moderation: CWModerationStatus,
  formData: FormData,
) {
  "use server";
  const supabase = await createClient();
  const note = String(formData.get("note") ?? "").trim() || null;
  const scoreRaw = String(formData.get("score") ?? "").trim();
  const score = scoreRaw ? parseFloat(scoreRaw) : null;

  const status: CWSubmissionStatus =
    moderation === "approved" ? "approved" : moderation === "rejected" ? "rejected" : "claimed";

  await supabase
    .from("submissions")
    .update({
      moderation_status: moderation,
      moderation_note: note,
      score,
      status,
    })
    .eq("id", subId);

  revalidatePath(`/dashboard/campaigns/${campaignId}/submissions`);
  revalidatePath(`/dashboard/campaigns/${campaignId}/submissions/${subId}`);
}

export default async function ReviewSubmissionPage({
  params,
}: {
  params: Promise<{ id: string; subId: string }>;
}) {
  const { id, subId } = await params;
  await requireRole("business");
  const supabase = await createClient();

  const { data: sub } = await supabase
    .from("submissions")
    .select(
      "*, profiles:contestant_id(full_name, email), age_brackets:age_bracket_id(label)",
    )
    .eq("id", subId)
    .maybeSingle();

  if (!sub) notFound();

  const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
  const bracket = Array.isArray(sub.age_brackets) ? sub.age_brackets[0] : sub.age_brackets;

  const moderate = moderateAction.bind(null, id, subId);

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
          {sub.age && (
            <div>
              <span className="text-muted-foreground">Age:</span> {sub.age}
            </div>
          )}
          {bracket && (
            <div>
              <span className="text-muted-foreground">Category:</span> {bracket.label}
            </div>
          )}
          {sub.guardian_name && (
            <div>
              <span className="text-muted-foreground">Guardian:</span>{" "}
              {sub.guardian_name} · {sub.guardian_contact}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Submitted {formatDate(sub.created_at)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artwork</CardTitle>
        </CardHeader>
        <CardContent>
          {sub.artwork_url ? (
            <a
              href={sub.artwork_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {sub.artwork_url}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No artwork URL provided.</p>
          )}
          {sub.checkout_message && (
            <div className="mt-4">
              <div className="text-xs text-muted-foreground">Message:</div>
              <p className="mt-1 text-sm">{sub.checkout_message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Moderation</CardTitle>
          <CardDescription>
            Current: <Badge variant="secondary" className="capitalize">{sub.moderation_status}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="score">Score (optional)</Label>
              <Input
                id="score"
                name="score"
                type="number"
                step={0.1}
                defaultValue={sub.score ?? undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Moderation note</Label>
              <Textarea id="note" name="note" rows={3} defaultValue={sub.moderation_note ?? ""} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" formAction={moderate.bind(null, "approved")} variant="brand">
                Approve
              </Button>
              <Button
                type="submit"
                formAction={moderate.bind(null, "rejected")}
                variant="destructive"
              >
                Reject
              </Button>
              <Button
                type="submit"
                formAction={moderate.bind(null, "pending")}
                variant="outline"
              >
                Mark pending
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
