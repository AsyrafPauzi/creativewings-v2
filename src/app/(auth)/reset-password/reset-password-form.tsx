"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { ArrowLeft, Check, Eye, EyeOff, Lock, TriangleAlert, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { scorePassword } from "@/lib/password-strength";
import { resetPasswordAction, type AuthFormState } from "../actions";
import { AuthSubmitButton } from "@/components/auth/auth-ui";

const initial: AuthFormState = {};

export function ResetPasswordForm({ expired }: { expired?: boolean }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initial);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const pw = useMemo(() => scorePassword(password), [password]);
  const matches = password.length > 0 && password === confirm;

  return (
    <form action={formAction} className="space-y-[22px]">
      {expired && <ExpiredLinkAlert />}

      <PasswordField
        id="password"
        name="password"
        label="New password"
        value={password}
        onChange={setPassword}
        show={showPassword}
        onToggle={() => setShowPassword((v) => !v)}
        minLength={8}
        required
      />
      <div className="flex items-center gap-1.5" aria-live="polite">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-pill",
              i < Math.min(3, pw.segments)
                ? pw.strength === "strong"
                  ? "bg-success"
                  : "bg-warning"
                : "bg-border",
            )}
          />
        ))}
        <span
          className={cn(
            "min-w-[48px] text-right text-[11px] font-extrabold",
            password
              ? pw.strength === "strong"
                ? "text-success"
                : "text-warning"
              : "text-text-muted",
          )}
        >
          {password ? pw.label : "Weak"}
        </span>
      </div>

      <PasswordField
        id="confirm_password"
        name="confirm_password"
        label="Confirm password"
        value={confirm}
        onChange={setConfirm}
        show={showConfirm}
        onToggle={() => setShowConfirm((v) => !v)}
        required
      />
      <p
        className={cn(
          "flex items-center gap-2 text-xs font-bold",
          matches ? "text-success" : "text-text-muted",
          confirm && !matches && "text-destructive",
        )}
        aria-live="polite"
      >
        {matches ? (
          <Check className="h-3.5 w-3.5" aria-hidden />
        ) : confirm ? (
          <X className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Check className="h-3.5 w-3.5 opacity-50" aria-hidden />
        )}
        {matches ? "Passwords match" : confirm ? "Passwords don't match" : "Passwords must match"}
      </p>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-text-secondary">
          Password rules
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {pw.rules.map((rule) => (
            <li key={rule.label} className="flex items-center gap-2 text-xs font-bold">
              <div
                className={cn(
                  "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full",
                  rule.met ? "bg-[#E7F6EE] text-success" : "bg-destructive-soft text-destructive",
                )}
              >
                {rule.met ? (
                  <Check className="h-3 w-3" aria-hidden />
                ) : (
                  <X className="h-3 w-3" aria-hidden />
                )}
              </div>
              <span className="text-body">{rule.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive">
          {state.error}
        </p>
      )}

      <AuthSubmitButton
        pending={pending}
        pendingLabel="Saving…"
        disabled={!matches || password.length < 8}
        icon={Check}
      >
        Save new password
      </AuthSubmitButton>

      <Link
        href="/sign-in"
        className="flex w-full items-center justify-center gap-1.5 text-[13px] font-bold text-text-secondary hover:text-body"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Cancel and go back
      </Link>
    </form>
  );
}

function ExpiredLinkAlert() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-destructive bg-destructive-soft px-3.5 py-3 text-destructive">
      <TriangleAlert className="h-[18px] w-[18px] shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-extrabold">This link expired.</p>
        <p className="mt-0.5 text-xs font-medium">
          Reset links are good for 60 minutes — request a new one.
        </p>
      </div>
      <Link
        href="/forgot-password"
        className="shrink-0 rounded-pill bg-destructive px-3.5 py-2 text-xs font-extrabold text-destructive-foreground hover:bg-destructive/90"
      >
        Request new
      </Link>
    </div>
  );
}

function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  show,
  onToggle,
  minLength,
  required,
}: {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  minLength?: number;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-body">
        {label}
      </label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-[18px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-secondary"
          aria-hidden
        />
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          minLength={minLength}
          required={required}
          className={cn(
            "h-14 rounded-xl border-[#C9CDD6] px-[18px] pl-12 pr-14 text-[15px] font-medium shadow-none placeholder:text-body focus-visible:border-success focus-visible:ring-success/30",
            value && "border-success",
          )}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-[12px] top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-text-secondary hover:bg-surface hover:text-body"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </div>
    </div>
  );
}
