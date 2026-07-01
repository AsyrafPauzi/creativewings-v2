import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { SchoolRow, SubmissionRow } from "@/lib/supabase/database.types";

import { moderateStagedAction } from "@/app/dashboard/campaigns/[id]/schools/actions";

type StagedRow = SubmissionRow & { schools: SchoolRow | null };

type Props = {
  campaignId: string;
  staged: StagedRow[];
};

async function approveForm(campaignId: string, submissionId: string) {
  "use server";
  await moderateStagedAction(campaignId, submissionId, "approved");
}

async function rejectForm(campaignId: string, submissionId: string) {
  "use server";
  await moderateStagedAction(campaignId, submissionId, "rejected");
}

export function StagedPanel({ campaignId, staged }: Props) {
  if (staged.length === 0) {
    return <p className="text-sm text-muted-foreground">No staged submissions yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40 text-left">
          <tr>
            <th className="p-3">Code</th>
            <th className="p-3">Student</th>
            <th className="p-3">School</th>
            <th className="p-3">Status</th>
            <th className="p-3">Uploaded</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {staged.map((row) => (
            <tr key={row.id}>
              <td className="p-3 font-mono font-medium">{row.submission_code ?? "—"}</td>
              <td className="p-3">{row.student_name ?? "—"}</td>
              <td className="p-3">{row.schools?.school_name ?? row.school_code ?? "—"}</td>
              <td className="p-3">
                <Badge
                  variant={
                    row.moderation_status === "approved"
                      ? "success"
                      : row.moderation_status === "rejected"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {row.moderation_status}
                </Badge>
              </td>
              <td className="p-3 text-muted-foreground">{formatDate(row.created_at)}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  {row.moderation_status === "pending" ? (
                    <>
                      <form action={approveForm.bind(null, campaignId, row.id)}>
                        <Button type="submit" size="sm">
                          Approve
                        </Button>
                      </form>
                      <form action={rejectForm.bind(null, campaignId, row.id)}>
                        <Button type="submit" size="sm" variant="outline">
                          Reject
                        </Button>
                      </form>
                    </>
                  ) : row.artwork_url ? (
                    <Link
                      href={row.artwork_url}
                      target="_blank"
                      className="text-xs text-primary hover:underline"
                    >
                      View artwork
                    </Link>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
