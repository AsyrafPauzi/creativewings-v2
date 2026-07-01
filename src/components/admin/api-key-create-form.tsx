"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createApiKeyAction } from "@/app/dashboard/admin/api-keys/actions";

export function ApiKeyCreateForm({
  organizers,
}: {
  organizers: { id: string; name: string }[];
}) {
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {secret ? (
        <div className="rounded-md border border-warning bg-warning-soft p-4">
          <p className="text-sm font-bold text-body">Copy this secret now — it won&apos;t be shown again:</p>
          <code className="mt-2 block break-all rounded bg-card p-2 text-xs">{secret}</code>
          <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => setSecret(null)}>
            Dismiss
          </Button>
        </div>
      ) : null}

      <form
        action={async (fd) => {
          const result = await createApiKeyAction(fd);
          if (result.error) setError(result.error);
          else if (result.secret) {
            setSecret(result.secret);
            setError(null);
          }
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="flex flex-col gap-1 text-sm">
          Organizer
          <select name="organizer_id" className="rounded-md border px-2 py-1.5" required>
            <option value="">Select…</option>
            {organizers.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input name="name" className="rounded-md border px-2 py-1.5" placeholder="Production" required />
        </label>
        <input type="hidden" name="scopes" value="read_submissions,read_kpis" />
        <Button type="submit">Create key</Button>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
