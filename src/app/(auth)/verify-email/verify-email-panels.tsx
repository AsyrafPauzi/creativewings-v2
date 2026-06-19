"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Check,
  Info,
  LayoutGrid,
  LogOut,
  Mail,
  MailCheck,
  Palette,
  RefreshCw,
  Send,
  Sparkles,
  Timer,
  TriangleAlert,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  resendVerificationAction,
  signOutToSignInAction,
  type AuthFormState,
} from "../actions";

const initial: AuthFormState = {};
const EMAIL_VERIFIED_EVENT_KEY = "creativewings:email-verified";

export function VerifyEmailPanel({
  email,
  isAuthenticated,
  continueHref,
}: {
  email: string;
  isAuthenticated: boolean;
  continueHref: "/onboarding" | "/dashboard";
}) {
  const [state, formAction, pending] = useActionState(resendVerificationAction, initial);
  const displayEmail = state.email ?? email;

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-brand-soft">
          <MailCheck className="h-9 w-9 text-primary" aria-hidden />
        </div>

        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-black italic tracking-tight text-body md:text-4xl">
            Sign in to resend.
          </h1>
          <p className="text-sm font-medium leading-6 text-text-secondary">
            We can only send a new verification email for the account currently signed in.
            Sign in first, then come back here to resend the Creative Wings verification link.
          </p>
        </div>

        {displayEmail && (
          <div className="inline-flex max-w-full items-center gap-2 rounded-pill border border-info/30 bg-info-soft px-4 py-2 text-sm font-semibold text-secondary">
            <User className="h-4 w-4 shrink-0" aria-hidden />
            <span className="break-all">{displayEmail}</span>
          </div>
        )}

        <Button asChild size="xl" className="h-14 w-full rounded-pill font-extrabold">
          <Link href="/sign-in?next=/verify-email">
            Sign in to resend
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>

        <Button asChild variant="outline" size="xl" className="h-14 w-full rounded-pill border-secondary/40 font-extrabold text-secondary">
          <Link href="/sign-up">Create a new account instead</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-brand-soft">
        <Send className="h-9 w-9 text-primary" aria-hidden />
      </div>

      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-black italic tracking-tight text-body md:text-4xl">
          Check your inbox next.
        </h1>
        <p className="text-sm font-medium text-text-secondary">
          We sent the verification email to
        </p>
      </div>

      <div className="inline-flex max-w-full items-center gap-2 rounded-pill border border-info/30 bg-info-soft px-4 py-2 text-sm font-semibold text-secondary">
        <User className="h-4 w-4 shrink-0" aria-hidden />
        <span className="break-all">{displayEmail}</span>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-text-muted">
          What should I do now?
        </p>
        <ol className="mt-3 space-y-3">
          {[
            "Click Resend verification email if nothing arrived yet.",
            "Wait a minute, then check Inbox, Spam, Promotions, or Updates.",
            "You can continue setup now; we will keep reminding you until verified.",
          ].map((text, i) => (
            <li key={text} className="flex items-start gap-3 text-sm font-medium text-body">
              <span className="font-black text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              {text}
            </li>
          ))}
        </ol>
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="email" value={displayEmail} />
        <Button
          type="submit"
          size="xl"
          disabled={pending || !displayEmail}
          className="h-14 w-full rounded-pill font-extrabold"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          {pending ? "Sending..." : "Resend verification email"}
        </Button>
      </form>

      {state.message && (
        <p className="rounded-lg border border-success/30 bg-success-soft px-3 py-2 text-sm font-semibold text-success">
          {state.message}
        </p>
      )}
      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button asChild variant="outline" className="justify-start gap-2 rounded-xl border-secondary/40 font-bold text-secondary">
          <Link href={continueHref}>
            <ArrowRight className="h-4 w-4" aria-hidden />
            {continueHref === "/dashboard" ? "Go to dashboard" : "Continue setup"}
          </Link>
        </Button>
        <form action={signOutToSignInAction}>
          <Button type="submit" variant="outline" className="w-full justify-start gap-2 rounded-xl border-secondary/40 font-bold text-secondary">
            <LogOut className="h-4 w-4" aria-hidden />
            Use another email
          </Button>
        </form>
        <Button asChild variant="outline" className="justify-start gap-2 rounded-xl font-bold">
          <a href="https://mail.google.com" target="_blank" rel="noreferrer">
            <Mail className="h-4 w-4" aria-hidden />
            Open Gmail
          </a>
        </Button>
        <Button asChild variant="outline" className="justify-start gap-2 rounded-xl font-bold">
          <a href="https://outlook.live.com" target="_blank" rel="noreferrer">
            <Mail className="h-4 w-4" aria-hidden />
            Open Outlook
          </a>
        </Button>
      </div>

      <div className="flex gap-3 rounded-xl border border-info/30 bg-info-soft px-4 py-3 text-xs font-medium text-secondary">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          No email after resending? Check that the address above is correct, wait a minute for
          delivery, and add hello@creativewings.my to your contacts.
        </p>
      </div>
    </div>
  );
}

export function VerifyEmailSuccessPanel({
  continueHref,
}: {
  continueHref: "/onboarding" | "/dashboard";
}) {
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    try {
      window.localStorage.setItem(EMAIL_VERIFIED_EVENT_KEY, String(Date.now()));
    } catch {
      // Storage can be unavailable in private contexts; the redirect still refreshes this tab.
    }

    const redirect = window.setTimeout(() => {
      window.location.replace(continueHref);
    }, 3000);
    const countdown = window.setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => {
      window.clearTimeout(redirect);
      window.clearInterval(countdown);
    };
  }, [continueHref]);

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto grid h-[220px] w-[220px] -rotate-3 place-items-center rounded-full border-[3px] border-success bg-success-soft">
        <div className="space-y-1">
          <Check className="mx-auto h-20 w-20 text-success" aria-hidden />
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-success">
            Verified
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-[34px] font-black italic leading-[1.05] tracking-tight text-body">
          You&apos;re verified.
        </h2>
        <p className="mx-auto max-w-sm text-[15px] font-medium leading-6 text-text-secondary">
          Your email is locked in. Heading back automatically.
        </p>
      </div>

      <div className="mx-auto inline-flex items-center gap-2 rounded-pill bg-info-soft px-4 py-2 text-xs font-extrabold text-secondary">
        <Timer className="h-3.5 w-3.5" aria-hidden />
        Heading to your dashboard in
        <span className="rounded-pill bg-secondary px-2 py-0.5 font-black italic text-white">
          {seconds}s
        </span>
      </div>

      <Button asChild size="xl" className="h-14 w-full rounded-pill font-extrabold">
        <Link href={continueHref}>
          {continueHref === "/dashboard" ? "Go to dashboard" : "Continue setup"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>

      <div className="grid grid-cols-3 gap-2 text-left">
        {[
          { href: "/campaigns", label: "Explore campaigns", icon: LayoutGrid },
          { href: "/dashboard/portfolio", label: "Build portfolio", icon: Palette },
          { href: "/workshops", label: "Find workshops", icon: Sparkles },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-border bg-surface p-3 text-xs font-extrabold leading-tight text-body transition hover:border-primary/40"
          >
            <Icon className="mb-2 h-5 w-5 text-primary" aria-hidden />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function VerifyEmailExpiredPanel({
  email,
  isAuthenticated,
}: {
  email?: string;
  isAuthenticated: boolean;
}) {
  const [state, formAction, pending] = useActionState(resendVerificationAction, initial);
  const displayEmail = state.email ?? email;

  return (
    <div className="space-y-6">
      <div className="mx-auto grid h-[200px] w-[200px] -rotate-6 place-items-center rounded-3xl border-[3px] border-warning bg-warning-soft">
        <div className="space-y-1 text-center">
          <Ban className="mx-auto h-16 w-16 text-warning" aria-hidden />
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-warning">
            Link expired
          </p>
        </div>
      </div>

      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-[34px] font-black italic leading-[1.05] tracking-tight text-body">
          This link&apos;s wings are clipped.
        </h2>
        <p className="text-[15px] font-medium leading-6 text-text-secondary">
          It may be older than 24 hours, already used, or missing its token. If you are signed in,
          send a fresh verification email and check your inbox again.
        </p>
      </div>

      {displayEmail && (
        <div className="inline-flex max-w-full items-center gap-2 rounded-pill border border-info/30 bg-info-soft px-4 py-2 text-sm font-semibold text-secondary">
          <User className="h-4 w-4 shrink-0" aria-hidden />
          <span className="break-all">{displayEmail}</span>
        </div>
      )}

      {isAuthenticated && displayEmail ? (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="email" value={displayEmail} />
          <Button
            type="submit"
            size="xl"
            className="h-14 w-full rounded-pill font-extrabold"
            disabled={pending}
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            {pending ? "Sending..." : "Send a fresh link"}
          </Button>
        </form>
      ) : (
        <Button asChild size="xl" className="h-14 w-full rounded-pill font-extrabold">
          <Link href="/sign-in?next=/verify-email">
            Sign in to send a fresh link
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      )}

      {state.message && (
        <p className="rounded-lg border border-success/30 bg-success-soft px-3 py-2 text-sm font-semibold text-success">
          {state.message}
        </p>
      )}
      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 rounded-xl bg-warning-soft px-4 py-3 text-xs font-semibold text-warning">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          Email scanners can sometimes open one-time links. If a fresh link also fails, copy it
          directly from the email and paste it into this browser.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/verify-email"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-secondary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to verify email
        </Link>
        {isAuthenticated && (
          <form action={signOutToSignInAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-secondary hover:underline"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Use another email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
