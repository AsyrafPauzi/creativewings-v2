"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SubmissionState } from "./actions";

const initial: SubmissionState = {};

interface Props {
  action: (prev: SubmissionState, formData: FormData) => Promise<SubmissionState>;
  ageBrackets: { id: string; label: string; min_age: number; max_age: number }[];
  checkoutMessage: {
    enabled: boolean;
    label: string | null;
    required: boolean;
  };
}

export function SubmitEntryForm({ action, ageBrackets, checkoutMessage }: Props) {
  const [state, formAction, pending] = useActionState(action, initial);

  if (state.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>You&apos;re in</CardTitle>
          <CardDescription>{state.success}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/dashboard">Go to dashboard</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Your artwork</CardTitle>
          <CardDescription>
            Paste a link to your artwork (Drive, Dropbox, Imgur, etc.). Direct uploads coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="artwork_url">Artwork URL</Label>
            <Input
              id="artwork_url"
              name="artwork_url"
              type="url"
              placeholder="https://"
            />
          </div>
        </CardContent>
      </Card>

      {checkoutMessage.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>{checkoutMessage.label || "Message"}</CardTitle>
            {checkoutMessage.required && (
              <CardDescription>This message is required.</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Textarea
              name="checkout_message"
              rows={4}
              required={checkoutMessage.required}
            />
          </CardContent>
        </Card>
      )}

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit entry"}
      </Button>
      <p className="text-xs text-muted-foreground">
        By submitting you confirm the artwork is original or you have the rights to enter it.
      </p>
    </form>
  );
}
