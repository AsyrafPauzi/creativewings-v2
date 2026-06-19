"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Facebook,
  Globe,
  Lock,
  Mail,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { scorePassword } from "@/lib/password-strength";
import {
  facebookOAuthAction,
  googleOAuthAction,
  signUpAction,
  type AuthFormState,
} from "../actions";

const initial: AuthFormState = {};

const MONTHS = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 100 }, (_, i) => String(CURRENT_YEAR - i));

function deriveAgeCategory(dob: string): null | { years: number; bucket: string; label: string } {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const ms = Date.now() - d.getTime();
  const yrs = Math.floor(ms / (365.25 * 24 * 3600 * 1000));
  if (yrs < 0 || yrs > 130) return null;
  if (yrs < 13) return { years: yrs, bucket: "under_13", label: "Under 13 · Guardian required" };
  if (yrs < 18) return { years: yrs, bucket: "teen", label: "Teen · Guardian required" };
  if (yrs < 25) return { years: yrs, bucket: "young_adult", label: "Young adult" };
  return { years: yrs, bucket: "adult", label: "Adult" };
}

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initial);
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [password, setPassword] = useState("");
  const dayOptions = useMemo(() => {
    const year = Number(birthYear || CURRENT_YEAR);
    const month = Number(birthMonth || "01");
    const days = new Date(year, month, 0).getDate();
    return Array.from({ length: days }, (_, i) => String(i + 1).padStart(2, "0"));
  }, [birthMonth, birthYear]);
  const dob = useMemo(() => {
    if (!birthDay || !birthMonth || !birthYear) return "";
    return `${birthYear}-${birthMonth}-${birthDay}`;
  }, [birthDay, birthMonth, birthYear]);
  const ageInfo = useMemo(() => deriveAgeCategory(dob), [dob]);
  const needsGuardian = ageInfo?.bucket === "under_13" || ageInfo?.bucket === "teen";
  const pw = useMemo(() => scorePassword(password), [password]);

  useEffect(() => {
    if (birthDay && !dayOptions.includes(birthDay)) {
      setBirthDay(dayOptions.at(-1) ?? "");
    }
  }, [birthDay, dayOptions]);

  if (state.message) {
    return (
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-elevated">
        <h2 className="text-2xl font-black italic tracking-tight text-body">You&apos;re in.</h2>
        <p className="text-sm font-medium text-text-secondary">{state.message}</p>
        <Link
          href="/sign-in"
          className="inline-flex text-sm font-extrabold text-primary hover:underline"
        >
          Continue to sign in →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-[18px]">
      <input type="hidden" name="role" value="contestant" />
      <input type="hidden" name="next" value="/onboarding" />
      <input type="hidden" name="date_of_birth" value={dob} />
      {ageInfo && <input type="hidden" name="age_category" value={ageInfo.bucket} />}

      <div className="space-y-3.5">
        <SignUpField
          id="full_name"
          name="full_name"
          label="Full name"
          icon={User}
          autoComplete="name"
          placeholder="Asyraf Pauzi"
          required
        />

        <SignUpField
          id="email"
          name="email"
          label="Email"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="asyraf@creativewings.my"
          required
        />

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#555555]"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-[18px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#555555]"
              aria-hidden
            />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-xl border-[#C9CDD6] bg-white pl-12 pr-11 text-[15px] font-medium shadow-none"
              required
            />
          </div>
          {password && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-pill",
                    i < Math.min(pw.segments, 3)
                      ? pw.strength === "strong"
                        ? "bg-[#16A34A]"
                        : pw.strength === "fair"
                          ? "bg-warning"
                          : "bg-destructive"
                      : "bg-[#C9CDD6]",
                  )}
                />
              ))}
              <p className={cn("pl-1 text-[11px] font-bold", pw.strength === "strong" ? "text-[#16A34A]" : "text-text-muted")}>
                {pw.label}
              </p>
            </div>
          )}
          <p className="text-xs font-medium text-[#8A8F99]">
            At least 8 chars, mix in a number and a symbol.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#555555]">
            Date of birth
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            <DateSelect
              label="Day"
              value={birthDay}
              onChange={setBirthDay}
              options={dayOptions.map((day) => ({ value: day, label: String(Number(day)) }))}
              placeholder="DD"
            />
            <DateSelect
              label="Month"
              value={birthMonth}
              onChange={setBirthMonth}
              options={MONTHS}
              placeholder="MMM"
              featured
            />
            <DateSelect
              label="Year"
              value={birthYear}
              onChange={setBirthYear}
              options={YEAR_OPTIONS.map((year) => ({ value: year, label: year }))}
              placeholder="YYYY"
            />
          </div>
          <div className="flex items-center gap-2 rounded-pill border border-[#FCE6EC] bg-[#FFF8FA] px-3 py-2">
            <Calendar className="h-4 w-4 shrink-0 text-[#F05A7E]" aria-hidden />
            <p className="text-[11px] font-bold text-[#F05A7E]">
              {ageInfo
                ? `${MONTHS.find((m) => m.value === birthMonth)?.label ?? birthMonth} ${Number(birthDay)}, ${birthYear} · ${ageInfo.years} years old · ${ageInfo.label}`
                : "Choose day, month and year to calculate guardian requirements."}
            </p>
          </div>
        </div>
      </div>

      {needsGuardian && (
        <div className="space-y-3 rounded-[14px] border border-[#F05A7E] bg-[#FCE6EC] p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#F05A7E]">
            Guardian information
          </div>
          <p className="text-xs font-medium leading-[1.5] text-[#555555]">
            A parent or guardian must be linked to accounts for users under 18. The student can
            sign in independently; the guardian receives monitoring access.
          </p>
          <div className="space-y-3.5">
            <SignUpField
              id="guardian_name"
              name="guardian_name"
              label="Guardian full name"
              icon={User}
              placeholder="Siti Aminah Rahman"
              required={needsGuardian}
            />
            <SignUpField
              id="guardian_email"
              name="guardian_email"
              label="Guardian email"
              type="email"
              icon={Mail}
              placeholder="siti.aminah@email.com"
              required={needsGuardian}
            />
          </div>
        </div>
      )}

      <div className="space-y-2.5 rounded-xl border border-[#E6E8EE] bg-[#F8F9FB] p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#555555]">
          Your data, your call
        </p>
        <ConsentRow
          name="pdpa_consent"
          title="PDPA Notice"
          description="I agree to the PDPA terms. Required."
          required
          defaultChecked
          linkHref="/pdpa"
          linkLabel="Read full PDPA notice →"
        />
        <ConsentRow
          name="consent_marketing"
          title="Marketing emails"
          description="Optional. Untick to stop news, drops and campaign reminder emails."
          defaultChecked
        />
      </div>

      {state.error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-14 w-full rounded-pill bg-[#F05A7E] text-[15px] font-extrabold text-white shadow-none hover:bg-[#CC4A6B]"
      >
        {pending ? "Creating account…" : "Create my account"}
        {!pending && <ArrowRight className="h-[18px] w-[18px]" aria-hidden />}
      </Button>

      <SignUpDivider />
      <SignUpSocialButtons
        googleAction={googleOAuthAction}
        facebookAction={facebookOAuthAction}
      />

      <p className="flex justify-center gap-2 text-[13px] font-medium text-[#555555]">
        Already a member?
        <Link href="/sign-in" className="font-extrabold text-[#125B9A] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

function DateSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  featured,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  featured?: boolean;
}) {
  return (
    <label
      className={cn(
        "relative block rounded-[14px] border bg-white px-3.5 py-2.5 transition-colors",
        featured ? "border-[#F05A7E] bg-[#FCE6EC]" : "border-[#C9CDD6]",
      )}
    >
      <span
        className={cn(
          "block text-[9px] font-extrabold uppercase tracking-[0.14em]",
          featured ? "text-[#CC4A6B]" : "text-[#8A8F99]",
        )}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className={cn(
          "mt-1 h-7 w-full appearance-none bg-transparent pr-5 text-[18px] font-black leading-none outline-none",
          featured ? "italic text-[#CC4A6B]" : "text-[#0B1320]",
          !value && "text-[#8A8F99]",
        )}
        aria-label={label}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute bottom-4 right-3.5 h-4 w-4",
          featured ? "text-[#F05A7E]" : "text-[#555555]",
        )}
        aria-hidden
      />
    </label>
  );
}

function SignUpField({
  id,
  label,
  icon: Icon,
  className,
  ...props
}: ComponentProps<typeof Input> & {
  label: string;
  icon: LucideIcon;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#555555]"
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-[18px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#555555]"
          aria-hidden
        />
        <Input
          id={id}
          className="h-14 rounded-xl border-[#C9CDD6] bg-white pl-12 text-[15px] font-medium text-[#0B1320] shadow-none placeholder:text-[#0B1320]/70"
          {...props}
        />
      </div>
    </div>
  );
}

function ConsentRow({
  name,
  title,
  description,
  required,
  defaultChecked,
  linkHref,
  linkLabel,
}: {
  name: string;
  title: string;
  description: string;
  required?: boolean;
  defaultChecked?: boolean;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        name={name}
        required={required}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-5 w-5 rounded-[5px] border-[#C9CDD6] accent-[#F05A7E]"
      />
      <div>
        <p className="text-[13px] font-extrabold text-[#0B1320]">{title}</p>
        <p className="text-xs font-medium text-[#8A8F99]">{description}</p>
        {linkHref && linkLabel && (
          <Link href={linkHref} className="mt-1 inline-block text-xs font-bold text-[#125B9A] hover:underline">
            {linkLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

function SignUpDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-[#E6E8EE]" />
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8A8F99]">
        Or join with
      </span>
      <span className="h-px flex-1 bg-[#E6E8EE]" />
    </div>
  );
}

function SignUpSocialButtons({
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
