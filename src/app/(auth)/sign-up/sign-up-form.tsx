"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signUpAction, type AuthFormState } from "../actions";

const initial: AuthFormState = {};

const ROLES: { id: string; title: string; description: string }[] = [
  {
    id: "contestant",
    title: "Contestant",
    description: "Submit artwork to competitions and activities.",
  },
  {
    id: "creator",
    title: "Creator",
    description: "Showcase your portfolio with a public profile.",
  },
  {
    id: "business",
    title: "Organiser",
    description: "Run national campaigns and reach school networks.",
  },
];

export function SignUpForm({ intendedRole }: { intendedRole: string }) {
  const [state, formAction, pending] = useActionState(signUpAction, initial);
  const [role, setRole] = useState(
    ROLES.find((r) => r.id === intendedRole)?.id ?? "contestant",
  );

  if (state.message) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Almost there</h2>
        <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="role" value={role} />

      <div className="space-y-2">
        <Label>I want to join as</Label>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={cn(
                "rounded-lg border p-3 text-left text-sm transition-colors",
                role === r.id
                  ? "border-primary bg-primary/5"
                  : "hover:border-foreground/30",
              )}
            >
              <div className="font-semibold">{r.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {r.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" autoComplete="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" variant="brand" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-xs text-muted-foreground">
        By signing up you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}
