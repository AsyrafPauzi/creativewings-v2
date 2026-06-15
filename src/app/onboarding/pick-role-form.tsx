"use client";

import { useActionState, useState } from "react";
import { Palette, Sparkles, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pickRoleAction, type OnboardingState } from "./actions";

const initial: OnboardingState = {};

const ROLES = [
  {
    id: "contestant",
    icon: Palette,
    title: "I'm a contestant",
    description:
      "I want to discover and submit my artwork to competitions, school activities and creative campaigns.",
  },
  {
    id: "creator",
    icon: Sparkles,
    title: "I'm a creator",
    description:
      "I want a public portfolio at /profile/me to showcase my creative work and history.",
  },
  {
    id: "business",
    icon: Trophy,
    title: "I'm an organiser",
    description:
      "My organisation runs competitions, school activities, or community initiatives.",
  },
];

export function PickRoleForm({ intendedRole }: { intendedRole: string }) {
  const [state, formAction, pending] = useActionState(pickRoleAction, initial);
  const [role, setRole] = useState(
    ROLES.find((r) => r.id === intendedRole)?.id ?? "contestant",
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="role" value={role} />
      <div className="grid gap-4 md:grid-cols-3">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const active = role === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={cn(
                "rounded-2xl border bg-card p-6 text-left transition-all",
                active
                  ? "border-primary ring-2 ring-primary/40"
                  : "hover:border-foreground/40",
              )}
            >
              <div
                className={cn(
                  "grid h-12 w-12 place-items-center rounded-xl",
                  active ? "cw-gradient-bg text-white" : "bg-primary/10 text-primary",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-lg font-semibold">{r.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
            </button>
          );
        })}
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex justify-end">
        <Button variant="brand" size="lg" type="submit" disabled={pending}>
          {pending ? "Continuing…" : "Continue"}
        </Button>
      </div>
    </form>
  );
}
