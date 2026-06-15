"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { CampaignFormState } from "@/app/dashboard/campaigns/actions";
import type { CampaignRow as Campaign } from "@/lib/supabase/database.types";

interface Props {
  action: (
    prev: CampaignFormState,
    formData: FormData,
  ) => Promise<CampaignFormState>;
  defaults?: Partial<Campaign>;
  submitLabel?: string;
}

const initial: CampaignFormState = {};

function dateForInput(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function CampaignForm({ action, defaults = {}, submitLabel = "Save campaign" }: Props) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
          <CardDescription>The headline information for your campaign.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign title</Label>
            <Input id="title" name="title" defaultValue={defaults.title ?? ""} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select id="type" name="type" defaultValue={defaults.type ?? "competition"}>
                <option value="competition">Competition (judged)</option>
                <option value="activity">Activity (participation)</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_mode">Event mode</Label>
              <Select id="event_mode" name="event_mode" defaultValue={defaults.event_mode ?? "online"}>
                <option value="online">Online</option>
                <option value="physical">Physical</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category tag</Label>
              <Input
                id="category"
                name="category"
                defaultValue={defaults.category ?? ""}
                placeholder="e.g. Art, Running, Design"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short_description">Short description</Label>
              <Input
                id="short_description"
                name="short_description"
                defaultValue={defaults.short_description ?? ""}
                placeholder="One-line pitch shown on cards"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Full description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={defaults.description ?? ""}
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>Submission and judging windows.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <DateField name="submission_start" label="Submission opens" defaultValue={defaults.submission_start ?? null} />
          <DateField name="submission_deadline" label="Submission deadline" defaultValue={defaults.submission_deadline ?? null} />
          <DateField name="review_start" label="Review begins" defaultValue={defaults.review_start ?? null} />
          <DateField name="final_event_date" label="Final event date" defaultValue={defaults.final_event_date ?? null} />
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="location_details">Location details</Label>
            <Input
              id="location_details"
              name="location_details"
              defaultValue={defaults.location_details ?? ""}
              placeholder="Online — submissions nationwide"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Entry fee per submission.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="entry_fee">Entry fee</Label>
            <Input
              id="entry_fee"
              name="entry_fee"
              type="number"
              min={0}
              step={0.5}
              defaultValue={defaults.entry_fee ?? 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" name="currency" defaultValue={defaults.currency ?? "MYR"} maxLength={3} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KPI progress</CardTitle>
          <CardDescription>Optional public progress bar.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <BoolField
            name="kpi_show_progress"
            label="Show on public page"
            defaultChecked={!!defaults.kpi_show_progress}
          />
          <div className="space-y-2">
            <Label htmlFor="kpi_target">Target (submissions)</Label>
            <Input
              id="kpi_target"
              name="kpi_target"
              type="number"
              min={0}
              defaultValue={defaults.kpi_target ?? 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kpi_label">Label</Label>
            <Input
              id="kpi_label"
              name="kpi_label"
              defaultValue={defaults.kpi_label ?? ""}
              placeholder="submissions"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Toggles</CardTitle>
          <CardDescription>Feature flags for this campaign.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <BoolField name="enable_age_brackets" label="Enable age brackets" defaultChecked={!!defaults.enable_age_brackets} />
          <BoolField name="enable_school_sponsors" label="Enable school sponsor coupons" defaultChecked={!!defaults.enable_school_sponsors} />
          <BoolField name="enable_certificate" label="Issue certificate to participants" defaultChecked={defaults.enable_certificate ?? true} />
          <BoolField name="enable_voting" label="Enable public voting" defaultChecked={!!defaults.enable_voting} />
          <BoolField name="allow_multiple_submissions" label="Allow multiple submissions per user" defaultChecked={!!defaults.allow_multiple_submissions} />
          <BoolField name="enable_design" label="Design submission (artwork upload)" defaultChecked={!!defaults.enable_design} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checkout message</CardTitle>
          <CardDescription>Optional message field on the submission form.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <BoolField name="enable_checkout_message" label="Show message field" defaultChecked={!!defaults.enable_checkout_message} />
          <div className="space-y-2">
            <Label htmlFor="checkout_message_label">Field label</Label>
            <Input
              id="checkout_message_label"
              name="checkout_message_label"
              defaultValue={defaults.checkout_message_label ?? ""}
              placeholder="Heartfelt message"
            />
          </div>
          <BoolField name="checkout_message_required" label="Required" defaultChecked={!!defaults.checkout_message_required} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Judging</CardTitle>
          <CardDescription>Tell contestants how their work will be scored.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="total_prize_value">Total prize value (display)</Label>
            <Input
              id="total_prize_value"
              name="total_prize_value"
              defaultValue={defaults.total_prize_value ?? ""}
              placeholder="RM 3,500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="judging_criteria">Judging criteria</Label>
            <Textarea
              id="judging_criteria"
              name="judging_criteria"
              defaultValue={defaults.judging_criteria ?? ""}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>UN Sustainable Development Goals</CardTitle>
          <CardDescription>
            Tag the SDGs your campaign supports — comma-separated numbers 1–17.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            id="sdg_goals"
            name="sdg_goals"
            defaultValue={(defaults.sdg_goals ?? []).join(", ")}
            placeholder="3, 4, 12"
          />
        </CardContent>
      </Card>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end">
        <Button type="submit" variant="brand" size="lg" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function DateField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string | null;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type="date"
        defaultValue={dateForInput(defaultValue)}
      />
    </div>
  );
}

function BoolField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-input"
      />
    </label>
  );
}
