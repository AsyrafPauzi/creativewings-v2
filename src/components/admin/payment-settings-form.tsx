"use client";

import { useActionState } from "react";

import {
  savePaymentSettingsAction,
  type PaymentSettingsState,
} from "@/app/dashboard/admin/payments/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { PlatformPaymentSettingsRow } from "@/lib/supabase/database.types";

const initial: PaymentSettingsState = {};

const CURRENCIES = ["MYR", "SGD", "USD"];

export function PaymentSettingsForm({ settings }: { settings: PlatformPaymentSettingsRow | null }) {
  const [state, formAction, pending] = useActionState(savePaymentSettingsAction, initial);
  const s = settings;

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CommercePay gateway</CardTitle>
          <CardDescription>
            Configure test and live credentials. Mirrors the WooCommerce CommercePay plugin settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between gap-3 rounded-md border p-3">
            <span className="text-sm font-semibold">Enable CommercePay</span>
            <input type="checkbox" name="enabled" defaultChecked={!!s?.enabled} className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-md border p-3">
            <span className="text-sm font-semibold">Test mode</span>
            <input type="checkbox" name="test_mode" defaultChecked={s?.test_mode ?? true} className="h-4 w-4" />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test credentials</CardTitle>
          <CardDescription>Staging: staging-payments.commerce.asia</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="test_tenant_id">Test merchant ID (tenantId)</Label>
            <Input id="test_tenant_id" name="test_tenant_id" defaultValue={s?.test_tenant_id ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test_currency">Test currency</Label>
            <Select id="test_currency" name="test_currency" defaultValue={s?.test_currency ?? "MYR"}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="test_secret_key">Test secret key</Label>
            <Input
              id="test_secret_key"
              name="test_secret_key"
              type="password"
              placeholder={s?.test_secret_key ? "•••••••• (leave blank to keep)" : ""}
              autoComplete="off"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live credentials</CardTitle>
          <CardDescription>Production: payments.commerce.asia</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="live_tenant_id">Live merchant ID (tenantId)</Label>
            <Input id="live_tenant_id" name="live_tenant_id" defaultValue={s?.live_tenant_id ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="live_currency">Live currency</Label>
            <Select id="live_currency" name="live_currency" defaultValue={s?.live_currency ?? "MYR"}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="live_secret_key">Live secret key</Label>
            <Input
              id="live_secret_key"
              name="live_secret_key"
              type="password"
              placeholder={s?.live_secret_key ? "•••••••• (leave blank to keep)" : ""}
              autoComplete="off"
            />
          </div>
        </CardContent>
      </Card>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : "Save payment settings"}
        </Button>
      </div>
    </form>
  );
}
