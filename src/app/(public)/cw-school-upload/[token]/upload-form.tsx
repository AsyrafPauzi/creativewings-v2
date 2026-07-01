"use client";

import { useActionState } from "react";

import { CustomFieldRenderer } from "@/components/campaigns/custom-field-renderer";
import { DesignUploadPanel } from "@/components/design/design-upload-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { AgeBracketRow, CustomFieldRow, DesignVariantRow } from "@/lib/supabase/database.types";

import { picUploadAction, type PicUploadState } from "./actions";

type Props = {
  token: string;
  campaignTitle: string;
  schoolName: string;
  enableAgeBrackets: boolean;
  ageBrackets: AgeBracketRow[];
  customFields: CustomFieldRow[];
  enableDesign: boolean;
  designMode: boolean;
  designVariants: DesignVariantRow[];
  designPickerLabel?: string | null;
  designArtworkW?: number | null;
  designArtworkH?: number | null;
};

const initial: PicUploadState = {};

export function PicUploadForm({
  token,
  campaignTitle,
  schoolName,
  enableAgeBrackets,
  ageBrackets,
  customFields,
  enableDesign,
  designMode,
  designVariants,
  designPickerLabel,
  designArtworkW,
  designArtworkH,
}: Props) {
  const bound = picUploadAction.bind(null, token);
  const [state, formAction, pending] = useActionState(bound, initial);

  if (state.submissionCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload complete</CardTitle>
          <CardDescription>
            Share this submission code with the parent so they can claim the entry.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center font-mono text-2xl font-bold tracking-widest">
            {state.submissionCode}
          </p>
          {state.mockupUrl ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.mockupUrl}
                alt="Mockup preview"
                className="mx-auto max-h-48 rounded border object-contain"
              />
              <Button asChild variant="outline" className="w-full">
                <a href={state.mockupUrl} download target="_blank" rel="noreferrer">
                  Download mockup PNG
                </a>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      <Card>
        <CardHeader>
          <CardTitle>{campaignTitle}</CardTitle>
          <CardDescription>School: {schoolName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.error ? (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="student_name">Student name</Label>
            <Input id="student_name" name="student_name" required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guardian_name">Parent / guardian name</Label>
              <Input id="guardian_name" name="guardian_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian_contact">Contact (phone)</Label>
              <Input id="guardian_contact" name="guardian_contact" type="tel" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardian_email">Parent email (for claim notification)</Label>
            <Input id="guardian_email" name="guardian_email" type="email" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" min={1} max={120} />
            </div>
            {enableAgeBrackets && ageBrackets.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="age_bracket_id">Age bracket</Label>
                <Select id="age_bracket_id" name="age_bracket_id">
                  <option value="">Select…</option>
                  {ageBrackets.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
          </div>

          {designMode ? (
            <DesignUploadPanel
              variants={designVariants}
              pickerLabel={designPickerLabel}
              expectedWidth={designArtworkW}
              expectedHeight={designArtworkH}
            />
          ) : enableDesign ? (
            <div className="space-y-2">
              <Label htmlFor="artwork_file">Artwork</Label>
              <Input
                id="artwork_file"
                name="artwork_file"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                capture="environment"
                required
              />
            </div>
          ) : null}

          <CustomFieldRenderer fields={customFields} />

          <Button type="submit" disabled={pending}>
            {pending ? "Uploading…" : "Submit artwork"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
