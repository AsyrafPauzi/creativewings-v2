"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { lookupClaimCodeAction, type ClaimLookupState } from "./actions";

const initial: ClaimLookupState = {};

export function ClaimLookupForm() {
  const searchParams = useSearchParams();
  const prefilled = searchParams.get("code") ?? "";
  const [state, formAction, pending] = useActionState(lookupClaimCodeAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="code">Submission code</Label>
        <Input
          id="code"
          name="code"
          placeholder="001-07-000123"
          defaultValue={prefilled}
          className="font-mono tracking-wider"
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Looking up…" : "Find entry"}
      </Button>
    </form>
  );
}
