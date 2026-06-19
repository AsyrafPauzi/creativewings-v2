import { createHash, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { createAdminClient } from "@/lib/supabase/server";

const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_TOKEN_TTL_HOURS = 24;
const VERIFICATION_TEMPLATE_PATH = path.join("supabase", "templates", "verify-email.html");
const FALLBACK_VERIFICATION_TEMPLATE = `<!doctype html>
<html>
  <body style="margin:0;background:#f8f9fb;font-family:Arial,sans-serif;color:#0b1320;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:32px;background:#f05a7e;color:#ffffff;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">{{ .SiteName }}</p>
                <h1 style="margin:0;font-size:32px;line-height:36px;font-style:italic;">Verify your email to start flying.</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 20px;font-size:15px;line-height:24px;">Confirm <strong>{{ .Email }}</strong> for {{ .SiteName }}. This link expires in {{ .LinkExpiryHours }} hours.</p>
                <p style="margin:0 0 24px;">
                  <a href="{{ .ConfirmationURL }}" style="display:inline-block;border-radius:999px;background:#f05a7e;color:#ffffff;padding:14px 22px;text-decoration:none;font-weight:800;">Verify email</a>
                </p>
                <p style="margin:0;color:#667085;font-size:12px;line-height:20px;">If the button does not work, paste this link into your browser:<br><a href="{{ .ConfirmationURL }}" style="color:#125b9a;word-break:break-all;">{{ .ConfirmationURL }}</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

let verificationTemplateCache: string | undefined;

type AdminClient = ReturnType<typeof createAdminClient>;
type VerificationEmailErrorCode =
  | "missing_email_config"
  | "invalid_resend_from_email"
  | "resend_auth_failed"
  | "resend_rate_limited"
  | "resend_sender_rejected"
  | "resend_send_failed";

export class VerificationEmailError extends Error {
  code: VerificationEmailErrorCode;
  details?: string;

  constructor(message: string, code: VerificationEmailErrorCode, details?: string) {
    super(message);
    this.name = "VerificationEmailError";
    this.code = code;
    this.details = details;
  }
}

export type SendVerificationResult =
  | { status: "sent"; sentAt: string }
  | { status: "already_verified" }
  | { status: "missing_email" };

export type VerifyEmailResult =
  | { status: "verified" }
  | { status: "expired"; email?: string }
  | { status: "invalid" };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function buildSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function buildSiteName() {
  return process.env.NEXT_PUBLIC_SITE_NAME ?? "Creative Wings";
}

function buildVerificationUrl(token: string) {
  const url = new URL("/auth/callback", buildSiteUrl());
  url.searchParams.set("type", "email_verification");
  url.searchParams.set("token", token);
  return url.toString();
}

function getMissingEmailConfig() {
  return ["RESEND_API_KEY", "RESEND_FROM_EMAIL"].filter((key) => !process.env[key]);
}

function assertResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const missingConfig = getMissingEmailConfig();

  if (missingConfig.length > 0) {
    throw new VerificationEmailError(
      `Missing required email config: ${missingConfig.join(", ")}.`,
      "missing_email_config",
    );
  }

  const fromEmail = extractEmailAddress(from!);
  if (!fromEmail.includes("@")) {
    throw new VerificationEmailError(
      "RESEND_FROM_EMAIL must include a valid sender email address.",
      "invalid_resend_from_email",
    );
  }

  return { apiKey: apiKey!, from: from! };
}

function extractEmailAddress(value: string) {
  const match = value.match(/<([^>]+)>/);
  return (match ? match[1] : value).trim();
}

function parseResendError(body: string) {
  if (!body) return "";
  try {
    const parsed = JSON.parse(body) as { message?: unknown; error?: unknown; name?: unknown };
    const parts = [parsed.message, parsed.error, parsed.name]
      .filter((part): part is string => typeof part === "string" && part.length > 0);
    return parts.join(" ");
  } catch {
    return body;
  }
}

function isSenderOrDomainError(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("domain") ||
    lower.includes("sender") ||
    lower.includes("from") ||
    lower.includes("verify")
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function readVerificationTemplate() {
  if (verificationTemplateCache) return verificationTemplateCache;

  try {
    verificationTemplateCache = await readFile(
      path.join(process.cwd(), VERIFICATION_TEMPLATE_PATH),
      "utf8",
    );
    return verificationTemplateCache;
  } catch {
    return FALLBACK_VERIFICATION_TEMPLATE;
  }
}

function renderVerificationTemplate(
  template: string,
  values: Record<string, string>,
) {
  return template.replace(/{{\s*\.([A-Za-z][A-Za-z0-9_]*)\s*}}/g, (match, key: string) => {
    return values[key] ?? match;
  });
}

async function buildVerificationHtml(email: string, verificationUrl: string) {
  const template = await readVerificationTemplate();

  return renderVerificationTemplate(template, {
    ConfirmationURL: escapeHtml(verificationUrl),
    Email: escapeHtml(email),
    LinkExpiryHours: escapeHtml(String(VERIFICATION_TOKEN_TTL_HOURS)),
    SiteName: escapeHtml(buildSiteName()),
    SiteURL: escapeHtml(buildSiteUrl()),
  });
}

async function sendResendEmail(email: string, verificationUrl: string) {
  const { apiKey, from } = assertResendConfig();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Verify your Creative Wings email - it takes 5 seconds.",
      html: await buildVerificationHtml(email, verificationUrl),
    }),
  });

  const body = await response.text().catch(() => "");
  const resendError = parseResendError(body);

  if (response.status === 429) {
    throw new VerificationEmailError(
      "Resend rate limit reached. Please wait a minute and try again.",
      "resend_rate_limited",
      resendError,
    );
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new VerificationEmailError(
        "Resend rejected the API key. Check RESEND_API_KEY.",
        "resend_auth_failed",
        resendError,
      );
    }

    if (isSenderOrDomainError(resendError)) {
      throw new VerificationEmailError(
        "Resend rejected RESEND_FROM_EMAIL. Verify the sender domain in Resend or use a verified sender.",
        "resend_sender_rejected",
        resendError,
      );
    }

    throw new VerificationEmailError(
      "Resend could not send the verification email. Check RESEND_API_KEY, RESEND_FROM_EMAIL, and sender domain setup.",
      "resend_send_failed",
      resendError || `HTTP ${response.status}`,
    );
  }
}

export async function sendAppVerificationEmailForUser(
  admin: AdminClient,
  userId: string,
  email: string,
): Promise<SendVerificationResult> {
  if (!email) return { status: "missing_email" };

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("email_verified_at")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (profile?.email_verified_at) return { status: "already_verified" };
  assertResendConfig();

  const token = randomBytes(VERIFICATION_TOKEN_BYTES).toString("base64url");
  const now = new Date();
  const sentAt = now.toISOString();
  const expiresAt = new Date(
    now.getTime() + VERIFICATION_TOKEN_TTL_HOURS * 60 * 60 * 1000,
  ).toISOString();

  const { error: tokenError } = await admin
    .from("email_verification_tokens")
    .upsert(
      {
        user_id: userId,
        token_hash: hashToken(token),
        expires_at: expiresAt,
      },
      { onConflict: "user_id" },
    );

  if (tokenError) throw tokenError;

  try {
    await sendResendEmail(email, buildVerificationUrl(token));
  } catch (error) {
    await admin.from("email_verification_tokens").delete().eq("user_id", userId);
    throw error;
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      email_verification_sent_at: sentAt,
    })
    .eq("id", userId);

  if (updateError) throw updateError;

  return { status: "sent", sentAt };
}

export async function sendAppVerificationEmailForAddress(
  email: string,
): Promise<SendVerificationResult> {
  if (!email) return { status: "missing_email" };

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, email_verified_at")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  if (!profile) return { status: "missing_email" };

  return sendAppVerificationEmailForUser(admin, profile.id, email);
}

export async function verifyAppEmailToken(token: string): Promise<VerifyEmailResult> {
  if (!token) return { status: "invalid" };

  const admin = createAdminClient();
  const tokenHash = hashToken(token);
  const { data: tokenRow, error } = await admin
    .from("email_verification_tokens")
    .select("user_id, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) throw error;
  if (!tokenRow) return { status: "invalid" };

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, email, email_verified_at")
    .eq("id", tokenRow.user_id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) return { status: "invalid" };

  if (profile.email_verified_at) {
    await admin.from("email_verification_tokens").delete().eq("user_id", profile.id);
    return { status: "verified" };
  }

  const expiresAt = tokenRow.expires_at ? new Date(tokenRow.expires_at) : null;

  if (!expiresAt || expiresAt.getTime() <= Date.now()) {
    await admin
      .from("email_verification_tokens")
      .delete()
      .eq("user_id", profile.id);
    return { status: "expired", email: profile.email };
  }

  const { data: updatedProfile, error: updateError } = await admin
    .from("profiles")
    .update({
      email_verified_at: new Date().toISOString(),
    })
    .eq("id", profile.id)
    .select("email_verified_at")
    .single();

  if (updateError) throw updateError;
  if (!updatedProfile?.email_verified_at) {
    throw new Error("Email verification update did not persist.");
  }

  const { error: deleteError } = await admin
    .from("email_verification_tokens")
    .delete()
    .eq("user_id", profile.id);

  if (deleteError) throw deleteError;

  return { status: "verified" };
}
