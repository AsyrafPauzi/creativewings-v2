"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { completeProfileAction, type OnboardingState } from "../actions";

const initial: OnboardingState = {};

export interface CompleteProfileFormProps {
  role: "contestant" | "creator" | "business";
  defaults: {
    full_name: string;
    phone: string;
    country: string;
    city: string;
  };
}

export function CompleteProfileForm({ role, defaults }: CompleteProfileFormProps) {
  const [state, formAction, pending] = useActionState(completeProfileAction, initial);

  return (
    <form action={formAction} className="space-y-6">
      <section className="space-y-4 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" defaultValue={defaults.full_name} required />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={defaults.phone} placeholder="+60…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={defaults.city} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={defaults.country || "Malaysia"} />
        </div>
      </section>

      {role === "business" && (
        <section className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">About your organisation</h2>
          <div className="space-y-2">
            <Label htmlFor="business_name">Business / organisation name</Label>
            <Input id="business_name" name="business_name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" name="industry" placeholder="e.g. Consumer goods, NGO" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" type="url" placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about">About</Label>
            <Textarea id="about" name="about" rows={4} placeholder="What does your organisation do?" />
          </div>
        </section>
      )}

      {role === "creator" && (
        <section className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Your public creator profile</h2>
          <div className="space-y-2">
            <Label htmlFor="display_name">Display name</Label>
            <Input id="display_name" name="display_name" placeholder="The name on your portfolio" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" name="tagline" placeholder="Illustrator · Kuala Lumpur" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Short bio</Label>
            <Textarea id="bio" name="bio" rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address (optional)</Label>
            <Input id="address" name="address" />
          </div>
        </section>
      )}

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end">
        <Button type="submit" variant="brand" size="lg" disabled={pending}>
          {pending ? "Saving…" : "Finish setup"}
        </Button>
      </div>
    </form>
  );
}
