"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  ArrowLeft,
  Info,
  Mail,
  MailCheck,
  RefreshCw,
  Send,
  TriangleAlert,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { forgotPasswordAction, type AuthFormState } from "../actions";
import { AuthField, AuthSubmitButton } from "@/components/auth/auth-ui";

const initial: AuthFormState = {};
const RESEND_COOLDOWN_SECONDS = 60;

export function ForgotPasswordForm({ expired }: { expired?: boolean }) {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initial);

  if (state.message) {
    return <ForgotPasswordSentPanel email={state.email} />;
  }

  return (
    <form action={formAction} className="space-y-6">
      {expired && <ExpiredResetLinkAlert />}

      <AuthField
        id="email"
        name="email"
        label="Email"
        type="email"
        icon={Mail}
        placeholder="asyraf@creativewings.my"
        helper="We'll send a reset link. Check spam if it doesn't show up in 2 minutes."
        autoComplete="email"
        className="space-y-1.5"
        required
      />

      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive">
          {state.error}
        </p>
      )}

      <AuthSubmitButton pending={pending} pendingLabel="Sending…" icon={Send}>
        Send reset link
      </AuthSubmitButton>

      <div className="flex items-center gap-2.5 rounded-xl bg-[#FCEFD8] px-3.5 py-3 text-[#D97706]">
        <Info className="h-[18px] w-[18px] shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold">Use a magic link instead?</p>
          <p className="mt-0.5 text-xs font-medium">
            Skip the password — we can email you a one-tap login link.
          </p>
        </div>
        <Link href="/magic-link" className="shrink-0 text-xs font-extrabold hover:underline">
          Try it
        </Link>
      </div>

      <Link
        href="/sign-in"
        className="flex w-full items-center justify-center gap-1.5 text-[13px] font-bold text-text-secondary hover:text-body"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to sign in
      </Link>
    </form>
  );
}

function ExpiredResetLinkAlert() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-destructive bg-destructive-soft px-3.5 py-3 text-destructive">
      <TriangleAlert className="h-[18px] w-[18px] shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-extrabold">This reset link expired.</p>
        <p className="mt-0.5 text-xs font-medium">
          Request a new link and use it within 60 minutes.
        </p>
      </div>
    </div>
  );
}

export function ForgotPasswordSentPanel({ email }: { email?: string }) {
  const sentTo = email?.trim() || "your address";
  const canResend = Boolean(email?.trim());
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initial);
  const [secondsRemaining, setSecondsRemaining] = useState(RESEND_COOLDOWN_SECONDS);
  const isCoolingDown = secondsRemaining > 0;
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = String(secondsRemaining % 60).padStart(2, "0");

  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const countdown = window.setInterval(() => {
      setSecondsRemaining((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(countdown);
  }, [secondsRemaining]);

  return (
    <div className="space-y-6 text-center" aria-live="polite">
      <div className="flex justify-center">
        <Logo size={28} />
      </div>

      <div className="mx-auto flex h-[200px] w-[200px] -rotate-6 items-center justify-center rounded-full border-[3px] border-primary bg-[#FCE6EC]">
        <MailCheck className="h-[88px] w-[88px] text-primary" aria-hidden />
      </div>

      <div className="space-y-2.5">
        <h2 className="text-[32px] font-black italic leading-[1.05] tracking-tight text-body">
          Check your inbox.
        </h2>
        <p className="text-sm font-medium leading-[1.5] text-text-secondary">
          We just emailed a reset link to
        </p>
        <span className="inline-flex items-center gap-2.5 rounded-pill border border-[#C9CDD6] bg-surface px-4 py-2.5 text-sm font-extrabold text-body">
          <Mail className="h-4 w-4 text-secondary" aria-hidden />
          {sentTo}
        </span>
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="email" value={email?.trim() ?? ""} />
        <Button
          type="submit"
          size="xl"
          disabled={pending || isCoolingDown || !canResend}
          className="h-[52px] w-full rounded-pill text-sm font-extrabold"
        >
          <RefreshCw className="h-[18px] w-[18px]" aria-hidden />
          {pending
            ? "Sending..."
            : isCoolingDown
              ? `Resend in ${minutes}:${seconds}`
              : "Resend reset link"}
        </Button>
        {state.error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive">
            {state.error}
          </p>
        )}
      </form>

      <div className="flex justify-center gap-6 text-[13px] font-bold text-text-secondary">
        <Link href="/forgot-password" className="hover:text-body">
          Try a different email
        </Link>
        <Link href="/sign-in" className="hover:text-body">
          Back to sign in
        </Link>
      </div>

      <p className="flex items-center gap-2.5 rounded-xl bg-[#E1ECF6] px-3.5 py-2.5 text-left text-xs font-semibold text-secondary">
        <Info className="h-4 w-4 shrink-0" aria-hidden />
        <span>Link expires in 60 minutes. Check Promotions / Spam if hiding.</span>
      </p>
    </div>
  );
}
