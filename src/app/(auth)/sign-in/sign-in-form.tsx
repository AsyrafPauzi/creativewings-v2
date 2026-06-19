"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";

import {
  facebookOAuthAction,
  googleOAuthAction,
  signInAction,
  type AuthFormState,
} from "../actions";
import { Input } from "@/components/ui/input";
import {
  AuthDivider,
  AuthField,
  AuthFooterLink,
  AuthLegalNotice,
  AuthSocialButtons,
  AuthSubmitButton,
} from "@/components/auth/auth-ui";

const initial: AuthFormState = {};

export function SignInForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initial);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-[22px]">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-4">
        <AuthField
          id="email"
          name="email"
          label="Email"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="asyraf@creativewings.my"
          required
        />

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-[11px] font-extrabold uppercase tracking-[0.09em] text-text-secondary"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-[18px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-secondary"
              aria-hidden
            />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="h-14 rounded-xl border-[#C9CDD6] px-[18px] pl-12 pr-14 text-[15px] font-medium shadow-none placeholder:text-body focus-visible:border-primary focus-visible:ring-primary/30"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-[12px] top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-text-secondary hover:bg-surface hover:text-body"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
          <p className="text-xs font-medium text-text-muted">
            Use the password you set when you joined.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2.5 text-[13px] font-semibold text-body">
          <input
            type="checkbox"
            name="remember"
            defaultChecked
            className="h-5 w-5 rounded-md border-border accent-primary focus:ring-primary"
          />
          Remember me on this device
        </label>
        <Link
          href="/forgot-password"
          className="text-[13px] font-bold text-secondary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive">
          {state.error}
        </p>
      )}

      <AuthSubmitButton pending={pending} pendingLabel="Signing in…">
        Sign in
      </AuthSubmitButton>

      <AuthDivider label="Or continue with" />
      <AuthSocialButtons
        googleAction={googleOAuthAction}
        facebookAction={facebookOAuthAction}
      />

      <AuthFooterLink prompt="New here?" linkText="Create an account" href="/sign-up" />
      <AuthLegalNotice />
    </form>
  );
}
