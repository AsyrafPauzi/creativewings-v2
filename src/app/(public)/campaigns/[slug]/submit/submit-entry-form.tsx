"use client";

import { useActionState, useEffect } from "react";

import { DesignUploadPanel } from "@/components/design/design-upload-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CustomFieldRenderer } from "@/components/campaigns/custom-field-renderer";
import type { CustomFieldRow, DesignVariantRow } from "@/lib/supabase/database.types";
import { formatCurrency } from "@/lib/utils";
import type { SubmissionState } from "./actions";

const initial: SubmissionState = {};

interface Props {
  action: (prev: SubmissionState, formData: FormData) => Promise<SubmissionState>;
  ageBrackets: { id: string; label: string; min_age: number; max_age: number }[];
  customFields: CustomFieldRow[];
  enableDesign: boolean;
  designMode: boolean;
  designVariants: DesignVariantRow[];
  designPickerLabel?: string | null;
  designArtworkW?: number | null;
  designArtworkH?: number | null;
  entryFee: number;
  currency: string;
  checkoutMessage: {
    enabled: boolean;
    label: string | null;
    required: boolean;
  };
}

export function SubmitEntryForm({
  action,
  ageBrackets,
  customFields,
  enableDesign,
  designMode,
  designVariants,
  designPickerLabel,
  designArtworkW,
  designArtworkH,
  entryFee,
  currency,
  checkoutMessage,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initial);

  useEffect(() => {
    if (state.redirect) {
      window.location.href = state.redirect;
    }
  }, [state.redirect]);

  if (state.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>You&apos;re in</CardTitle>
          <CardDescription>{state.success}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.mockupUrl ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.mockupUrl}
                alt="Product mockup preview"
                className="mx-auto max-h-64 rounded-md border object-contain"
              />
              <Button asChild variant="outline" className="w-full">
                <a href={state.mockupUrl} download target="_blank" rel="noreferrer">
                  Download mockup PNG
                </a>
              </Button>
            </div>
          ) : null}
          <Button asChild>
            <a href="/dashboard">Go to dashboard</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      <Card>
        <CardHeader>
          <CardTitle>Participant</CardTitle>
          <CardDescription>Who is this entry for?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student_name">Full name</Label>
            <Input id="student_name" name="student_name" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" min={1} max={120} />
            </div>
            {ageBrackets.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="age_bracket_id">Category</Label>
                <Select id="age_bracket_id" name="age_bracket_id">
                  <option value="">Select a category…</option>
                  {ageBrackets.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label} ({b.min_age}–{b.max_age})
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guardian_name">Guardian name (if under 18)</Label>
              <Input id="guardian_name" name="guardian_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian_contact">Guardian contact</Label>
              <Input id="guardian_contact" name="guardian_contact" />
            </div>
          </div>
        </CardContent>
      </Card>

      {customFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional information</CardTitle>
            <CardDescription>Extra details requested by the organizer.</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomFieldRenderer fields={customFields} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{designMode ? "Your design" : "Your artwork"}</CardTitle>
          <CardDescription>
            {designMode
              ? "Upload your print-ready PNG and preview it on the product."
              : "Upload a file or paste a link (Drive, Dropbox, Imgur, etc.)."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {designMode ? (
            <DesignUploadPanel
              variants={designVariants}
              pickerLabel={designPickerLabel}
              expectedWidth={designArtworkW}
              expectedHeight={designArtworkH}
            />
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="artwork_file">Upload file</Label>
                <Input
                  id="artwork_file"
                  name="artwork_file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  required={enableDesign}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artwork_url">Or artwork URL</Label>
                <Input id="artwork_url" name="artwork_url" type="url" placeholder="https://" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {entryFee > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Entry fee</CardTitle>
            <CardDescription>
              {formatCurrency(entryFee, currency)} per entry. You will be redirected to CommercePay to complete payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="coupon_code">Sponsor coupon (optional)</Label>
            <Input id="coupon_code" name="coupon_code" placeholder="100% sponsor code" />
          </CardContent>
        </Card>
      )}

      {checkoutMessage.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>{checkoutMessage.label || "Message"}</CardTitle>
            {checkoutMessage.required && (
              <CardDescription>This message is required.</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Textarea name="checkout_message" rows={4} required={checkoutMessage.required} />
          </CardContent>
        </Card>
      )}

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending
          ? "Submitting…"
          : entryFee > 0
            ? `Continue to payment (${formatCurrency(entryFee, currency)})`
            : "Submit entry"}
      </Button>
      <p className="text-xs text-muted-foreground">
        By submitting you confirm the artwork is original or you have the rights to enter it.
      </p>
    </form>
  );
}
