"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { Provider } from "@supabase/supabase-js";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  sendAppVerificationEmailForUser,
  VerificationEmailError,
} from "@/lib/email-verification";
import { DEFAULT_CONSENT, getCurrentPolicyVersion } from "@/lib/pdpa";

export interface AuthFormState {
  error?: string;
  message?: string;
  email?: string;
  emailVerificationSentAt?: string;
  emailVerified?: boolean;
}

const VALID_ROLES = new Set(["contestant", "creator", "organizer"]);
const OAUTH_PROVIDERS = new Set<Provider>(["google", "facebook"]);
type SignUpPersistenceStage =
  | "profile_upsert"
  | "guardian_lookup"
  | "guardian_link_upsert"
  | "pdpa_consent_insert";

function safeNextPath(value: FormDataEntryValue | null, fallback: string) {
  const next = String(value ?? "").trim();
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"), "/dashboard");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }
  revalidatePath("/", "layout");
  redirect(next);
}

async function oauthSignIn(provider: Provider, formData: FormData): Promise<void> {
  const next = safeNextPath(formData.get("next"), "/dashboard");

  if (!OAUTH_PROVIDERS.has(provider)) {
    redirect("/sign-in?error=oauth_provider");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) redirect("/sign-in?error=oauth");
  if (data.url) redirect(data.url);
  redirect("/sign-in?error=oauth");
}

export async function googleOAuthAction(formData: FormData): Promise<void> {
  await oauthSignIn("google", formData);
}

export async function facebookOAuthAction(formData: FormData): Promise<void> {
  await oauthSignIn("facebook", formData);
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "contestant");
  const dob = String(formData.get("date_of_birth") ?? "").trim();
  const ageCategory = String(formData.get("age_category") ?? "").trim();
  const guardianName = String(formData.get("guardian_name") ?? "").trim();
  const guardianEmail = String(formData.get("guardian_email") ?? "").trim();
  const pdpaConsent = formData.get("pdpa_consent") === "on";

  if (!email || !password) return { error: "Please enter your email and password." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!VALID_ROLES.has(role)) return { error: "Please choose a valid role." };
  if (!dob) return { error: "Please enter your date of birth." };
  if (!pdpaConsent) return { error: "Please accept the Terms and PDPA consent to continue." };

  const needsGuardian = ageCategory === "under_13" || ageCategory === "teen";
  if (needsGuardian && (!guardianName || !guardianEmail)) {
    return { error: "Guardian name and email are required for users under 18." };
  }
  if (
    needsGuardian &&
    guardianEmail.toLowerCase() === email.toLowerCase()
  ) {
    return { error: "Guardian email must be different from your student email." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  const { error: signUpError, data } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      intended_role: role,
      date_of_birth: dob,
      age_category: ageCategory || null,
      is_minor: needsGuardian,
      guardian_name: needsGuardian ? guardianName : null,
      guardian_email: needsGuardian ? guardianEmail : null,
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  // The auth trigger creates the profile row; we extend it with the new fields
  // and log a PDPA consent event tied to the current policy version.
  let guardianLinkSaved = !needsGuardian;
  if (data.user?.id) {
    try {
      const policy = await getCurrentPolicyVersion();
      const flags = {
        ...DEFAULT_CONSENT,
        marketing: formData.get("consent_marketing") === "on",
        analytics: DEFAULT_CONSENT.analytics,
        third_party: DEFAULT_CONSENT.third_party,
        public_profile: DEFAULT_CONSENT.public_profile,
      };
      const update: Record<string, unknown> = {
        full_name: fullName || null,
        date_of_birth: dob,
        is_minor: needsGuardian,
        email_verified_at: null,
        email_verification_sent_at: null,
        pdpa_consent_at: new Date().toISOString(),
        pdpa_version_accepted: policy?.version ?? null,
        consent_marketing: flags.marketing,
        consent_analytics: flags.analytics,
        consent_third_party: flags.third_party,
        consent_public_profile: flags.public_profile,
        consent_updated_at: new Date().toISOString(),
      };
      if (needsGuardian) {
        update.guardian_name = guardianName;
        update.guardian_email = guardianEmail;
        update.guardian_consent_at = new Date().toISOString();
      }
      const { error: profileError } = await admin
        .from("profiles")
        .upsert(
          {
            id: data.user.id,
            email,
            ...update,
          },
          { onConflict: "id" },
        );
      if (profileError) throw signUpPersistenceError("profile_upsert", profileError);

      if (needsGuardian) {
        const { data: existingGuardian, error: guardianLookupError } = await admin
          .from("profiles")
          .select("id")
          .ilike("email", guardianEmail)
          .maybeSingle();
        if (guardianLookupError) {
          throw signUpPersistenceError("guardian_lookup", guardianLookupError);
        }

        const { error: guardianLinkError } = await admin.from("guardian_links").upsert(
          {
            student_id: data.user.id,
            guardian_id: existingGuardian?.id ?? null,
            guardian_name: guardianName,
            guardian_email: guardianEmail,
            status: existingGuardian ? "active" : "pending_invite",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "student_id" },
        );
        if (guardianLinkError) {
          throw signUpPersistenceError("guardian_link_upsert", guardianLinkError);
        }
        guardianLinkSaved = true;
      }

      if (policy) {
        const h = await headers();
        const { error: pdpaConsentError } = await admin.from("pdpa_consents").insert({
          user_id: data.user.id,
          policy_version: policy.version,
          event: "accept_signup",
          consent_marketing: flags.marketing,
          consent_analytics: flags.analytics,
          consent_third_party: flags.third_party,
          consent_public_profile: flags.public_profile,
          ip_address:
            h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            h.get("x-real-ip") ||
            null,
          user_agent: h.get("user-agent") ?? null,
        });
        if (pdpaConsentError) {
          throw signUpPersistenceError("pdpa_consent_insert", pdpaConsentError);
        }
      }
    } catch (error) {
      logSignUpPersistenceError(error);
      if (needsGuardian) {
        return {
          error: describeGuardianSaveError(error),
        };
      }
      // Non-fatal for adult accounts — onboarding can collect anything missed here.
    }
  }

  if (needsGuardian && !guardianLinkSaved) {
    return {
      error:
        "Account created, but guardian monitoring details could not be linked. Please contact support before the student continues.",
    };
  }

  if (data.user?.id) {
    try {
      await sendAppVerificationEmailForUser(admin, data.user.id, email);
    } catch {
      // Verification is intentionally non-blocking; the onboarding modal lets
      // the user retry once mail delivery is configured or temporarily healthy.
    }
  }

  const { error: signInAfterSignupError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInAfterSignupError) {
    return {
      error:
        `Account created, but we could not sign you in automatically: ${signInAfterSignupError.message}`,
    };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding?registered=1");
}

function signUpPersistenceError(stage: SignUpPersistenceStage, error: unknown) {
  return Object.assign(new Error(`Signup persistence failed at ${stage}`), {
    stage,
    cause: error,
  });
}

function logSignUpPersistenceError(error: unknown) {
  const wrapped = error as {
    stage?: unknown;
    cause?: unknown;
    message?: unknown;
  };
  const cause = (wrapped.cause ?? error) as {
    code?: unknown;
    message?: unknown;
    details?: unknown;
    hint?: unknown;
  };

  console.error("Signup persistence failed", {
    stage: typeof wrapped.stage === "string" ? wrapped.stage : "unknown",
    code: typeof cause.code === "string" ? cause.code : undefined,
    message: typeof cause.message === "string" ? cause.message : String(wrapped.message ?? error),
    details: typeof cause.details === "string" ? cause.details : undefined,
    hint: typeof cause.hint === "string" ? cause.hint : undefined,
  });
}

function describeGuardianSaveError(error: unknown) {
  const wrapped = error as { stage?: unknown; cause?: unknown };
  const cause = (wrapped.cause ?? error) as { code?: unknown; message?: unknown };
  const code = typeof cause.code === "string" ? cause.code : "";
  const message = typeof cause.message === "string" ? cause.message : "";
  const isDevelopment = process.env.NODE_ENV !== "production";
  const missingGuardianSchema =
    code === "42P01" ||
    code === "42703" ||
    code === "PGRST204" ||
    code === "PGRST205" ||
    message.includes("guardian_links") ||
    message.includes("is_minor") ||
    message.toLowerCase().includes("schema cache");

  if (isDevelopment && missingGuardianSchema) {
    return "Account created, but guardian setup could not finish because the guardian database migration is missing or not refreshed. Apply 20260617120000_guardian_links.sql to the configured Supabase project, then retry with a new email or delete this test user first.";
  }

  return "Account created, but guardian setup could not finish. Please contact support before the student continues.";
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOutToSignInAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/sign-in");
}

export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Please enter your email." };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });
  if (error) return { error: error.message };
  redirect(
    `/forgot-password?sent=1&email=${encodeURIComponent(email)}&sentAt=${Date.now()}`,
  );
}

export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords must match before saving." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/reset-password/success");
}

export async function magicLinkAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Please enter your email." };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard` },
  });
  if (error) return { error: error.message };
  redirect(`/magic-link/sent?email=${encodeURIComponent(email)}`);
}

export async function resendVerificationAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const requestedEmail = String(formData.get("email") ?? "").trim();
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Please sign in before resending your verification email." };
  }

  const email = user.email?.trim();
  if (!email) {
    return { error: "Your signed-in account does not have an email address." };
  }

  if (requestedEmail && requestedEmail.toLowerCase() !== email.toLowerCase()) {
    return {
      error:
        "This page is signed in with a different email. Sign out first if you want to use another account.",
      email,
    };
  }

  try {
    const admin = createAdminClient();
    const result = await sendAppVerificationEmailForUser(admin, user.id, email);
    if (result.status === "already_verified") {
      revalidatePath("/onboarding");
      revalidatePath("/verify-email");
      return { message: "This email is already verified.", email, emailVerified: true };
    }
    if (result.status === "missing_email") {
      return { error: "Your account email could not be found. Please sign in again.", email };
    }
    revalidatePath("/onboarding");
    revalidatePath("/verify-email");
    return {
      message: "Verification email sent. Check your inbox, spam, or promotions folder.",
      email,
      emailVerificationSentAt: result.sentAt,
    };
  } catch (error) {
    return {
      error: describeVerificationError(error),
      email,
    };
  }
}

function describeVerificationError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (error instanceof VerificationEmailError) {
    if (error.code === "missing_email_config" || error.code === "invalid_resend_from_email") {
      return isDevelopment
        ? `${error.message} Update .env.local and restart the dev server.`
        : "Email sending is not configured yet. Please contact support.";
    }

    if (error.code === "resend_auth_failed") {
      return isDevelopment
        ? "Resend rejected RESEND_API_KEY. Check the key in .env.local and restart the dev server."
        : "Email sending is not configured yet. Please contact support.";
    }

    if (error.code === "resend_sender_rejected") {
      return isDevelopment
        ? "Resend rejected RESEND_FROM_EMAIL. Verify the sender domain in Resend or use a verified sender, then restart the dev server."
        : "Email sending is not configured yet. Please contact support.";
    }

    if (error.code === "resend_rate_limited") {
      return "Email sending is temporarily rate limited. Please wait a minute, then try again.";
    }

    return isDevelopment
      ? `${error.message}${error.details ? ` (${error.details})` : ""}`
      : "Verification email could not be sent. Please try again later.";
  }

  if (message.includes("RESEND_API_KEY") || message.includes("RESEND_FROM_EMAIL")) {
    return isDevelopment
      ? `${message} Update .env.local and restart the dev server.`
      : "Email sending is not configured yet. Please contact support.";
  }

  if (message.toLowerCase().includes("rate limit") || code === "rate_limit_exceeded") {
    return "Email sending is temporarily rate limited. Please wait a minute, then try again.";
  }

  if (
    code === "42P01" ||
    code === "42703" ||
    code === "PGRST204" ||
    code === "PGRST205" ||
    message.includes("email_verification_tokens") ||
    message.includes("email_verified_at") ||
    message.includes("email_verification_sent_at") ||
    message.toLowerCase().includes("schema cache")
  ) {
    return "Email verification database fields are missing. Apply migration 20260618130600_app_email_verification.sql, restart the dev server, then try again.";
  }

  if (isDevelopment && message) return message;
  return "Verification email could not be sent. Please check email settings and try again.";
}
