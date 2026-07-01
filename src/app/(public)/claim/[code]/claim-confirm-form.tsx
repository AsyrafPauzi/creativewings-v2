"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { claimSubmissionAction, type ClaimConfirmState } from "../actions";

type Props = {
  submissionId: string;
  studentName: string;
  campaignTitle: string;
  entryFee: number;
  currency: string;
  hasSchoolCoupon: boolean;
};

const initial: ClaimConfirmState = {};

export function ClaimConfirmForm({
  submissionId,
  studentName,
  campaignTitle,
  entryFee,
  currency,
  hasSchoolCoupon,
}: Props) {
  const bound = claimSubmissionAction.bind(null, submissionId);
  const [state, formAction, pending] = useActionState(bound, initial);

  const isFree = entryFee <= 0 || hasSchoolCoupon;

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Confirm claim</CardTitle>
          <CardDescription>
            You are about to claim this entry for <strong>{studentName}</strong> in{" "}
            <strong>{campaignTitle}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.error ? (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="rounded-md bg-success-soft p-3 text-sm text-success">{state.success}</p>
          ) : null}

          <div className="rounded-md border p-4 text-sm">
            {isFree ? (
              <p>No payment required{hasSchoolCoupon ? " (school sponsor covers the fee)" : ""}.</p>
            ) : (
              <p>
                Entry fee:{" "}
                <strong>
                  {currency} {entryFee.toFixed(2)}
                </strong>{" "}
                — you will be redirected to payment after confirming.
              </p>
            )}
          </div>

          <Button type="submit" disabled={pending || !!state.success}>
            {pending ? "Processing…" : isFree ? "Confirm claim" : "Confirm & pay"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
