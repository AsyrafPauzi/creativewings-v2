"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { importCampaignAction } from "@/app/dashboard/campaigns/import/actions";

export function ImportCampaignForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const fd = new FormData(e.currentTarget);
        const result = await importCampaignAction(fd);
        if (result?.error) {
          setError(result.error);
          setPending(false);
        }
      }}
    >
      <input type="file" name="file" accept=".json,application/json" required className="text-sm" />
      <Button type="submit" disabled={pending}>{pending ? "Importing…" : "Import as draft"}</Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
