"use client";

import { useActionState } from "react";
import { ArrowRight, CheckCircle2, MapPin, Phone, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { completeProfileAction, type OnboardingState } from "../actions";

const initial: OnboardingState = {};

export interface CompleteProfileFormProps {
  role: "contestant" | "creator" | "organizer";
  isMinor: boolean;
  guardianName: string | null;
  guardianEmail: string | null;
  defaults: {
    full_name: string;
    phone: string;
    country: string;
    city: string;
  };
}

export function CompleteProfileForm({
  role,
  isMinor,
  guardianName,
  guardianEmail,
  defaults,
}: CompleteProfileFormProps) {
  const [state, formAction, pending] = useActionState(completeProfileAction, initial);
  const isContestant = role === "contestant";
  const isMinorContestant = isContestant && isMinor;
  const guardianLabel = guardianName ?? guardianEmail;

  return (
    <form action={formAction} className="space-y-6">
      {isContestant ? (
        <section className="overflow-hidden rounded-[28px] border border-border bg-white shadow-elevated">
          <div className="bg-[linear-gradient(135deg,#F05A7E_0%,#D8568A_52%,#125B9A_100%)] px-6 py-6 text-white md:px-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-pill border border-white/35 bg-white/15 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em]">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Quick contestant setup
            </div>
            <h2 className="font-primary text-3xl font-black italic leading-tight">
              {isMinorContestant
                ? "Student details only. Start creating sooner."
                : "Keep it simple. Start creating sooner."}
            </h2>
            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-white/85">
              {isMinorContestant
                ? `Tell us about the student contestant joining Creative Wings. Guardian details${
                    guardianLabel ? ` for ${guardianLabel}` : ""
                  } are already linked from signup.`
                : "Fill the essentials now. You can add public portfolio details later only if you need them."}
            </p>
          </div>

          <div className="space-y-5 p-6 md:p-8">
            <input type="hidden" name="country" value={defaults.country || "Malaysia"} />

            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-primary" aria-hidden />
                {isMinorContestant ? "Student full name" : "Full name"}
              </Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={defaults.full_name}
                placeholder={isMinorContestant ? "Student name" : "Your name"}
                required
              />
              <p className="text-xs font-medium text-text-muted">
                {isMinorContestant
                  ? "Required so submissions can be matched to the student."
                  : "Required so submissions can be matched to you."}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" aria-hidden />
                  {isMinorContestant ? "Contact phone" : "Phone"}{" "}
                  <span className="text-text-muted">(optional)</span>
                </Label>
                <Input id="phone" name="phone" defaultValue={defaults.phone} placeholder="+60…" />
                {isMinorContestant && (
                  <p className="text-xs font-medium text-text-muted">
                    Use a guardian phone if the student does not have one.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" aria-hidden />
                  {isMinorContestant ? "Student city" : "City"}{" "}
                  <span className="text-text-muted">(optional)</span>
                </Label>
                <Input id="city" name="city" defaultValue={defaults.city} placeholder="Kuala Lumpur" />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text-secondary">
              {isMinorContestant ? "Student country" : "Country"} is set to{" "}
              <span className="text-body">{defaults.country || "Malaysia"}</span> by default.
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-4 rounded-[24px] border border-border bg-white p-6 shadow-soft">
          <h2 className="text-lg font-extrabold text-body">About you</h2>
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
      )}

      {role === "organizer" && (
        <section className="space-y-4 rounded-[24px] border border-border bg-white p-6 shadow-soft">
          <h2 className="text-lg font-extrabold text-body">About your organization</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Organization name</Label>
            <Input id="name" name="name" required />
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
            <Textarea id="about" name="about" rows={4} placeholder="What does your organization do?" />
          </div>
        </section>
      )}

      {role === "creator" && (
        <section className="space-y-4 rounded-[24px] border border-border bg-white p-6 shadow-soft">
          <h2 className="text-lg font-extrabold text-body">Your public creator profile</h2>
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

      {state.error && <p className="text-sm font-semibold text-destructive">{state.error}</p>}

      <div className="flex justify-end rounded-[20px] border border-border bg-white p-4 shadow-soft">
        <Button type="submit" size="xl" disabled={pending} className={isContestant ? "w-full md:w-auto" : ""}>
          {pending ? "Saving…" : "Finish setup"}
          {!pending && <ArrowRight className="h-4 w-4" aria-hidden />}
        </Button>
      </div>
    </form>
  );
}
