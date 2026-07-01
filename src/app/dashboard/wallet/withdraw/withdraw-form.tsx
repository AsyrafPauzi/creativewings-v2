"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  requestWithdrawalAction,
  type WithdrawState,
} from "@/app/dashboard/wallet/withdraw/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: WithdrawState = {};

export function WithdrawForm({
  balance,
  defaults,
}: {
  balance: number;
  defaults?: {
    bank_name?: string;
    account_name?: string;
    account_number?: string;
  };
}) {
  const [state, formAction, pending] = useActionState(requestWithdrawalAction, initial);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request withdrawal</CardTitle>
          <CardDescription>Available balance: RM {balance.toFixed(2)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (MYR)</Label>
            <Input id="amount" name="amount" type="number" min={0.01} step={0.01} max={balance} required />
            <input type="hidden" name="currency" value="MYR" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank name</Label>
            <Input id="bank_name" name="bank_name" defaultValue={defaults?.bank_name ?? ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_name">Account name</Label>
            <Input id="account_name" name="account_name" defaultValue={defaults?.account_name ?? ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_number">Account number</Label>
            <Input id="account_number" name="account_number" defaultValue={defaults?.account_number ?? ""} required />
          </div>
        </CardContent>
      </Card>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending || balance <= 0}>
          {pending ? "Submitting…" : "Submit request"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/wallet">Back to wallet</Link>
        </Button>
      </div>
    </form>
  );
}
