"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";

import { castVoteAction } from "@/app/(public)/campaigns/[slug]/vote/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type VotingEntry = {
  id: string;
  student_name: string | null;
  artwork_url: string | null;
  vote_count: number;
  bracketLabel?: string | null;
};

type Props = {
  campaignSlug: string;
  entries: VotingEntry[];
};

export function VotingGallery({ campaignSlug, entries }: Props) {
  const [pending, startTransition] = useTransition();
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(entries.map((e) => [e.id, e.vote_count ?? 0])),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function vote(submissionId: string) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await castVoteAction(submissionId, campaignSlug);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.voteCount != null) {
        setCounts((prev) => ({ ...prev, [submissionId]: result.voteCount! }));
        setMessage("Thanks — your vote was counted!");
      }
    });
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Voting entries will appear here once submissions are approved.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-success">{message}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <Card key={entry.id} className="overflow-hidden">
            <div className="relative aspect-[4/3] bg-muted">
              {entry.artwork_url ? (
                <Image
                  src={entry.artwork_url}
                  alt={entry.student_name ?? "Entry"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="grid h-full place-items-center text-xs text-muted-foreground">
                  No preview
                </div>
              )}
            </div>
            <CardContent className="flex items-center justify-between gap-2 p-4">
              <div className="min-w-0">
                <div className="truncate font-bold">{entry.student_name ?? "Anonymous"}</div>
                {entry.bracketLabel ? (
                  <div className="text-xs text-muted-foreground">{entry.bracketLabel}</div>
                ) : null}
                <div className="text-xs text-muted-foreground">
                  {counts[entry.id] ?? 0} vote{(counts[entry.id] ?? 0) === 1 ? "" : "s"}
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                disabled={pending}
                onClick={() => vote(entry.id)}
              >
                <Heart className="mr-1 h-3.5 w-3.5" />
                Vote
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
