import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Facebook,
  Globe,
  Info,
  Search,
  Sparkles,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { AuthCreativeVariant } from "./auth-config";
import { AuthCreativePanel } from "./auth-creative-panel";

export function AuthSplitPage({
  variant,
  children,
  className,
  formMaxWidth = "max-w-[480px]",
}: {
  variant: AuthCreativeVariant;
  children: React.ReactNode;
  className?: string;
  formMaxWidth?: string;
}) {
  return (
    <div className="grid min-h-full flex-1 md:grid-cols-[minmax(0,720px)_minmax(0,1fr)]">
      <AuthCreativePanel variant={variant} />
      <div
        data-auth-split-form
        className={cn(
          "flex items-center justify-center bg-background px-6 py-10 md:px-20 md:py-14",
          className,
        )}
      >
        <div className={cn("w-full space-y-[22px]", formMaxWidth)}>{children}</div>
      </div>
    </div>
  );
}

export function AuthFrameHeader() {
  return (
    <header className="shrink-0 border-b border-border bg-background">
      <div className="flex h-9 items-center justify-center overflow-hidden bg-[#0B1320] px-10">
        <span className="mr-3 h-2 w-2 rounded-full bg-primary" aria-hidden />
        <p className="whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.12em] text-white">
          ● 12 LIVE COMPETITIONS · RM 1.2M IN PRIZES · DEADLINE THIS WEEK · NEW: PROGRAMMES HUB · APPLY BY AUG 28 · ● 12 LIVE COMPETITIONS · RM 1.2M IN PRIZES · DEADLINE THIS WEEK ●
        </p>
        <span className="ml-3 h-2 w-2 rounded-full bg-primary" aria-hidden />
      </div>
      <div className="flex h-16 items-center justify-between gap-8 px-10">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Creative Wings home">
            <Logo size={32} />
          </Link>
          <nav className="hidden items-center gap-[26px] text-sm font-semibold text-text-secondary lg:flex">
            <Link href="/programmes" className="hover:text-body">
              Programmes
            </Link>
            <Link href="/sustainable-development-goals" className="hover:text-body">
              SDG Goals
            </Link>
            <Link href="/brand-story" className="hover:text-body">
              Stories
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden h-10 w-60 items-center gap-2 rounded-pill border border-border bg-surface px-3.5 text-text-muted lg:flex">
            <Search className="h-4 w-4" aria-hidden />
            <span className="flex-1 text-sm font-medium">Search competitions...</span>
            <span className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold">
              /
            </span>
          </div>
          <Button asChild variant="ghost" className="rounded-pill px-3.5">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild className="h-10 rounded-pill px-[18px] font-bold">
            <Link href="/sign-up">
              <Sparkles className="h-4 w-4" aria-hidden />
              Join free
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function AuthFormHeader({
  title,
  subtitle,
  showLogo = true,
}: {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}) {
  return (
    <div className="space-y-[22px]">
      {showLogo && (
        <div>
          <Logo size={28} />
        </div>
      )}
      <div className="space-y-2">
        <h1 data-motion="hero-item" className="text-[34px] font-black italic leading-[1.05] tracking-tight text-body">
          {title}
        </h1>
        {subtitle && (
          <p data-motion="hero-item" className="text-[15px] font-medium leading-[1.5] text-text-secondary">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function AuthField({
  id,
  label,
  icon: Icon,
  helper,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  icon?: LucideIcon;
  helper?: string;
}) {
  return (
    <div className={cn("space-y-2", className)} data-motion="field">
      <label
        htmlFor={id}
        className="text-[11px] font-extrabold uppercase tracking-[0.09em] text-text-secondary"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-[18px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-secondary"
            aria-hidden
          />
        )}
        <Input
          id={id}
          className={cn(
            "h-14 rounded-xl border-[#C9CDD6] px-[18px] text-[15px] font-medium shadow-none placeholder:text-body focus-visible:border-primary focus-visible:ring-primary/30",
            Icon && "pl-12",
          )}
          {...props}
        />
      </div>
      {helper && <p className="text-xs font-medium text-text-muted">{helper}</p>}
    </div>
  );
}

export function AuthSubmitButton({
  children,
  pending,
  pendingLabel,
  className,
  disabled,
  icon: Icon = ArrowRight,
}: {
  children: React.ReactNode;
  pending?: boolean;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <Button
      type="submit"
      size="xl"
      disabled={pending || disabled}
      className={cn("h-14 w-full rounded-pill text-[15px] font-extrabold", className)}
    >
      {pending ? (pendingLabel ?? "Working…") : children}
      {!pending && <Icon className="h-[18px] w-[18px]" aria-hidden />}
    </Button>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-3 text-[11px] font-bold uppercase tracking-[0.13em] text-text-muted">
          {label}
        </span>
      </div>
    </div>
  );
}

export function AuthSocialButtons({
  googleAction,
  facebookAction,
}: {
  googleAction: (formData: FormData) => void | Promise<void>;
  facebookAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        type="submit"
        formAction={googleAction}
        formNoValidate
        className="flex h-[52px] items-center justify-center gap-2.5 rounded-pill border border-[#C9CDD6] bg-white px-[18px] text-[13px] font-bold text-[#0B1320] transition-colors hover:bg-[#F8F9FB]"
      >
        <Globe className="h-[18px] w-[18px] text-[#0F4D83]" aria-hidden />
        Google
      </button>
      <button
        type="submit"
        formAction={facebookAction}
        formNoValidate
        className="flex h-[52px] items-center justify-center gap-2.5 rounded-pill border border-[#C9CDD6] bg-white px-[18px] text-[13px] font-bold text-[#0B1320] transition-colors hover:bg-[#F8F9FB]"
      >
        <Facebook className="h-[18px] w-[18px] text-[#0F4D83]" aria-hidden />
        Facebook
      </button>
    </div>
  );
}

export function AuthFooterLink({
  prompt,
  linkText,
  href,
}: {
  prompt: string;
  linkText: string;
  href: string;
}) {
  return (
    <p className="text-center text-[13px] font-medium text-text-secondary">
      {prompt}{" "}
      <Link href={href} className="font-extrabold text-primary hover:underline">
        {linkText}
      </Link>
    </p>
  );
}

export function AuthLegalNotice({ action = "signing in" }: { action?: string }) {
  return (
    <p className="text-center text-[11px] leading-relaxed text-text-muted">
      By {action} you agree to our{" "}
      <Link href="/legal/terms" className="font-bold text-text-secondary hover:underline">
        Terms
      </Link>{" "}
      and{" "}
      <Link href="/pdpa" className="font-bold text-text-secondary hover:underline">
        PDPA Notice
      </Link>
      .
    </p>
  );
}

export function AuthInfoBanner({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#E1ECF6] px-3.5 py-3 text-secondary">
      <Info className="h-[18px] w-[18px] shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 text-xs font-medium leading-tight">{children}</div>
      {action}
    </div>
  );
}

export function AuthCallout({
  title,
  body,
  actionLabel,
  actionHref,
  tone = "warning",
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  tone?: "warning" | "destructive";
}) {
  const styles =
    tone === "destructive"
      ? "border-destructive/30 bg-destructive-soft"
      : "border-warning/30 bg-warning-soft";

  return (
    <div className={cn("rounded-xl border px-4 py-3", styles)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-body">{title}</p>
          <p className="mt-0.5 text-xs font-medium text-text-secondary">{body}</p>
        </div>
        {actionLabel && actionHref && (
          <Button asChild size="sm" variant={tone === "destructive" ? "destructive" : "outline"}>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export function AuthSlimFooter() {
  return (
    <footer className="shrink-0 border-t border-border bg-surface">
      <div className="flex min-h-[49px] flex-col items-center justify-between gap-3 px-6 py-3.5 text-[11px] font-medium text-text-muted sm:flex-row md:px-10">
        <p>© {new Date().getFullYear()} Creative Wings  ·  Built with kindness in KL.</p>
        <div className="flex items-center gap-4 font-bold text-text-secondary">
          <span>Support</span>
          <Link href="/pdpa" className="hover:text-body">
            PDPA
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-background px-2.5 py-1">
            EN  ·  BM
          </span>
        </div>
      </div>
    </footer>
  );
}
