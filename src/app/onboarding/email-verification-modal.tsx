"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MailCheck, RefreshCw, ShieldCheck, Sparkles, X } from "lucide-react";

import type { AuthFormState } from "@/app/(auth)/actions";

const initial: AuthFormState = {};
const EMAIL_VERIFIED_EVENT_KEY = "creativewings:email-verified";

function formatSentAt(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
}

export function EmailVerificationModal({
  email,
  initialEmailVerificationSentAt,
  resendAction,
}: {
  email: string;
  initialEmailVerificationSentAt: string | null;
  resendAction: (_prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [state, setState] = useState<AuthFormState>(initial);
  const [pending, startTransition] = useTransition();
  const emailVerificationSentAt =
    state.emailVerificationSentAt ?? initialEmailVerificationSentAt;
  const hasVerificationEmailBeenSent = Boolean(emailVerificationSentAt);
  const sentAtLabel = formatSentAt(emailVerificationSentAt);
  const primaryButtonLabel = hasVerificationEmailBeenSent
    ? "Resend verification email"
    : "Send verification email";
  const successMessage =
    state.message ??
    (hasVerificationEmailBeenSent
      ? "Verification email sent. Check your inbox, spam, or promotions folder."
      : null);
  const dismiss = () => setOpen(false);

  useEffect(() => {
    const refreshOnReturn = () => {
      router.refresh();
    };
    const refreshOnVisibility = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };
    const refreshOnVerifiedStorage = (event: StorageEvent) => {
      if (event.key === EMAIL_VERIFIED_EVENT_KEY) {
        router.refresh();
      }
    };

    window.addEventListener("focus", refreshOnReturn);
    window.addEventListener("storage", refreshOnVerifiedStorage);
    document.addEventListener("visibilitychange", refreshOnVisibility);

    return () => {
      window.removeEventListener("focus", refreshOnReturn);
      window.removeEventListener("storage", refreshOnVerifiedStorage);
      document.removeEventListener("visibilitychange", refreshOnVisibility);
    };
  }, [router]);

  useEffect(() => {
    if (!state.emailVerified) return;

    try {
      localStorage.setItem(EMAIL_VERIFIED_EVENT_KEY, String(Date.now()));
    } catch {
      // Storage can be unavailable in private browsing; refresh still handles it.
    }
    setOpen(false);
    router.refresh();
  }, [router, state.emailVerified]);

  function sendVerificationEmail() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email);
      setState(await resendAction(state, formData));
    });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1320]/55 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-email-title"
    >
      <div className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#F05A7E_0%,#D8568A_52%,#125B9A_100%)] px-7 py-7 text-white">
          <button
            type="button"
            onClick={dismiss}
            className="pointer-events-auto absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            aria-label="Dismiss email verification reminder"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
          <div className="mb-5 inline-flex items-center gap-2 rounded-pill border border-white/40 bg-white/15 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Optional security step
          </div>
          <h2
            id="verify-email-title"
            className="max-w-[360px] text-4xl font-black italic leading-[0.98] tracking-tight"
          >
            Verify your email to start flying.
          </h2>
          <p className="mt-3 max-w-[390px] text-sm font-medium leading-6 text-white/88">
            {hasVerificationEmailBeenSent
              ? "A verification link has been sent. You can keep setting up your Creative Wings account now while we wait for confirmation."
              : "Send yourself a verification link when you are ready. You can keep setting up your Creative Wings account now."}
          </p>
          <Sparkles className="absolute bottom-6 right-8 h-12 w-12 rotate-12 text-[#FFE6A3]" aria-hidden />
        </div>

        <div className="space-y-5 px-7 py-6">
          <div className="flex items-start gap-3 rounded-2xl border border-[#E6E8EE] bg-[#F8F9FB] px-4 py-3">
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-extrabold text-body">Verification pending for</p>
              <p className="mt-0.5 break-all text-sm font-semibold text-secondary">{email}</p>
              {hasVerificationEmailBeenSent && (
                <p className="mt-1 text-xs font-semibold text-text-muted">
                  {sentAtLabel ? `Last sent: ${sentAtLabel}` : "Email sent."}
                </p>
              )}
            </div>
          </div>

          <div aria-live="polite" className="min-h-[48px]">
            {pending ? (
              <p className="rounded-xl border border-info/30 bg-info-soft px-4 py-3 text-sm font-semibold text-secondary">
                Sending your verification email...
              </p>
            ) : state.error ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm font-semibold text-destructive">
                {state.error}
              </p>
            ) : successMessage ? (
              <div className="rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm font-semibold text-success">
                <p>{successMessage}</p>
                {sentAtLabel && (
                  <p className="mt-1 text-xs font-bold text-success/80">
                    Last sent: <time dateTime={emailVerificationSentAt ?? undefined}>{sentAtLabel}</time>
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={sendVerificationEmail}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-pill bg-primary px-7 text-base font-extrabold text-primary-foreground shadow-soft transition-all duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              disabled={pending}
            >
              <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} aria-hidden />
              {pending ? "Sending..." : primaryButtonLabel}
            </button>
            <button
              type="button"
              className="inline-flex h-14 w-full items-center justify-center rounded-pill border border-secondary/40 bg-background px-7 font-extrabold text-secondary transition-all duration-150 hover:border-foreground/40 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={dismiss}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
