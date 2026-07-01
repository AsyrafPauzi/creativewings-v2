"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { SchoolRow, UploadTokenRow } from "@/lib/supabase/database.types";

import { generateUploadTokenAction } from "@/app/dashboard/campaigns/[id]/schools/actions";

type Props = {
  campaignId: string;
  schools: SchoolRow[];
  tokens: UploadTokenRow[];
  appUrl: string;
};

export function TokensPanel({ campaignId, schools, tokens, appUrl }: Props) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  const [lastLink, setLastLink] = useState<string | null>(null);

  const tokensBySchool = schools.map((school) => ({
    school,
    tokens: tokens.filter((t) => t.school_id === school.id),
  }));

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  function generate(schoolId: string) {
    startTransition(async () => {
      const link = await generateUploadTokenAction(campaignId, schoolId);
      setLastLink(link);
      await copyLink(link);
    });
  }

  if (schools.length === 0) {
    return <p className="text-sm text-muted-foreground">Add a school first to generate upload links.</p>;
  }

  return (
    <div className="space-y-6">
      {lastLink ? (
        <div className="rounded-md border bg-muted/40 p-3 text-sm">
          <p className="font-medium">New upload link (copied)</p>
          <p className="break-all text-muted-foreground">{lastLink}</p>
        </div>
      ) : null}

      {tokensBySchool.map(({ school, tokens: schoolTokens }) => (
        <div key={school.id} className="space-y-3 rounded-md border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-bold">
              {school.school_code} — {school.school_name}
            </div>
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() => generate(school.id)}
            >
              Generate link (90 days)
            </Button>
          </div>

          {schoolTokens.length === 0 ? (
            <p className="text-xs text-muted-foreground">No tokens yet.</p>
          ) : (
            <ul className="divide-y text-sm">
              {schoolTokens.map((token) => {
                const url = `${appUrl}/cw-school-upload/${token.token}`;
                return (
                  <li key={token.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <div className="text-xs text-muted-foreground">
                      Created {formatDate(token.created_at)}
                      {token.expires_at ? ` · Expires ${formatDate(token.expires_at)}` : ""}
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => copyLink(url)}>
                      {copied === url ? "Copied" : "Copy link"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
