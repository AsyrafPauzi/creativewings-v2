"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, Mail } from "lucide-react";

import { magicLinkAction, type AuthFormState } from "../actions";
import { AuthField, AuthSubmitButton } from "@/components/auth/auth-ui";

const initial: AuthFormState = {};

export function MagicLinkForm() {
  const [state, formAction, pending] = useActionState(magicLinkAction, initial);

  return (
    <form action={formAction} className="space-y-5">
      <AuthField
        id="email"
        name="email"
        label="Email"
        type="email"
        icon={Mail}
        placeholder="asyraf@creativewings.my"
        required
      />

      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive">
          {state.error}
        </p>
      )}

      <AuthSubmitButton pending={pending} pendingLabel="Sending…">
        Send magic link
      </AuthSubmitButton>

      <Link
        href="/sign-in"
        className="inline-flex items-center gap-2 text-sm font-extrabold text-text-secondary hover:text-body"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Use password instead
      </Link>
    </form>
  );
}
