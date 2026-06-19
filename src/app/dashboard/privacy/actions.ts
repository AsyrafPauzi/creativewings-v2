"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { requireUser } from "@/lib/auth";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  buildUserDataExport,
  DEFAULT_CONSENT,
  getCurrentPolicyVersion,
  recordConsent,
  type ConsentFlags,
} from "@/lib/pdpa";
import type { CWExportFormat } from "@/lib/supabase/database.types";

const EXPORT_BUCKET = "pdpa-exports";

async function clientContext() {
  const h = await headers();
  return {
    ip:
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      null,
    userAgent: h.get("user-agent") ?? null,
  };
}

function readConsentFlags(formData: FormData): ConsentFlags {
  return {
    marketing: formData.get("consent_marketing") === "on",
    analytics: formData.get("consent_analytics") === "on",
    third_party: formData.get("consent_third_party") === "on",
    public_profile: formData.get("consent_public_profile") === "on",
  };
}

export async function updateConsentAction(formData: FormData) {
  const { user } = await requireUser();
  const ctx = await clientContext();
  const policy = await getCurrentPolicyVersion();
  if (!policy) {
    throw new Error("No active PDPA policy version is configured.");
  }
  const flags = { ...DEFAULT_CONSENT, ...readConsentFlags(formData) };
  await recordConsent({
    userId: user.id,
    policyVersion: policy.version,
    event: "consent_change",
    flags,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });

  revalidatePath("/dashboard/privacy");
}

export async function reacceptPolicyAction() {
  const { user } = await requireUser();
  const ctx = await clientContext();
  const policy = await getCurrentPolicyVersion();
  if (!policy) return;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "consent_marketing, consent_analytics, consent_third_party, consent_public_profile",
    )
    .eq("id", user.id)
    .maybeSingle();

  const flags: ConsentFlags = {
    marketing: profile?.consent_marketing ?? DEFAULT_CONSENT.marketing,
    analytics: profile?.consent_analytics ?? DEFAULT_CONSENT.analytics,
    third_party: profile?.consent_third_party ?? DEFAULT_CONSENT.third_party,
    public_profile:
      profile?.consent_public_profile ?? DEFAULT_CONSENT.public_profile,
  };

  await recordConsent({
    userId: user.id,
    policyVersion: policy.version,
    event: "reaccept",
    flags,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });

  revalidatePath("/dashboard/privacy");
}

export async function requestDataExportAction(formData: FormData) {
  const { user } = await requireUser();
  const format = (String(formData.get("format") ?? "json") as CWExportFormat);

  const admin = createAdminClient();
  // Create the request row up front so the user sees it immediately.
  const { data: request } = await admin
    .from("data_export_requests")
    .insert({
      user_id: user.id,
      status: "processing",
      format,
    })
    .select("id")
    .single();

  if (!request) throw new Error("Could not create export request.");

  try {
    const archive = await buildUserDataExport(user.id);
    const json = JSON.stringify(archive, null, 2);
    const bytes = new TextEncoder().encode(json);

    const fileName = `${user.id}/${request.id}.json`;

    // Best-effort: ensure the bucket exists. Ignore "already exists" errors.
    await admin.storage.createBucket(EXPORT_BUCKET, { public: false }).catch(() => {});
    const upload = await admin.storage
      .from(EXPORT_BUCKET)
      .upload(fileName, bytes, {
        contentType: "application/json",
        upsert: true,
      });

    if (upload.error) throw upload.error;

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await admin
      .from("data_export_requests")
      .update({
        status: "ready",
        file_path: fileName,
        file_size: bytes.byteLength,
        expires_at: expires,
        completed_at: new Date().toISOString(),
      })
      .eq("id", request.id);
  } catch (err) {
    await admin
      .from("data_export_requests")
      .update({
        status: "failed",
        failed_reason: err instanceof Error ? err.message : "Unknown error",
        completed_at: new Date().toISOString(),
      })
      .eq("id", request.id);
  }

  revalidatePath("/dashboard/privacy");
}

export async function scheduleAccountDeletionAction(formData: FormData) {
  const { user } = await requireUser();
  const ctx = await clientContext();
  const reason = String(formData.get("reason") ?? "").trim() || null;
  const confirm = String(formData.get("confirm") ?? "").trim();

  if (confirm !== "DELETE") {
    throw new Error("Please type DELETE to confirm.");
  }

  const admin = createAdminClient();
  const scheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await admin
    .from("account_deletion_requests")
    .upsert(
      {
        user_id: user.id,
        status: "scheduled",
        reason,
        scheduled_for: scheduledFor,
        cancelled_at: null,
        completed_at: null,
        failed_reason: null,
        requested_ip: ctx.ip,
      },
      { onConflict: "user_id" },
    );

  // Log a withdraw event so it shows up in the user's audit list.
  const policy = await getCurrentPolicyVersion();
  if (policy) {
    await admin.from("pdpa_consents").insert({
      user_id: user.id,
      policy_version: policy.version,
      event: "withdraw",
      consent_marketing: false,
      consent_analytics: false,
      consent_third_party: false,
      consent_public_profile: false,
      ip_address: ctx.ip,
      user_agent: ctx.userAgent,
    });
  }

  revalidatePath("/dashboard/privacy");
}

export async function cancelAccountDeletionAction() {
  const { user } = await requireUser();
  const admin = createAdminClient();
  await admin
    .from("account_deletion_requests")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("status", "scheduled");

  revalidatePath("/dashboard/privacy");
}

export async function downloadExportAction(formData: FormData) {
  const { user } = await requireUser();
  const exportId = String(formData.get("export_id") ?? "");
  if (!exportId) throw new Error("Missing export id.");

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("data_export_requests")
    .select("file_path, user_id, status")
    .eq("id", exportId)
    .maybeSingle();

  if (!row || row.user_id !== user.id || row.status !== "ready" || !row.file_path) {
    throw new Error("Export not available.");
  }

  const signed = await admin.storage
    .from(EXPORT_BUCKET)
    .createSignedUrl(row.file_path, 60 * 5);

  if (!signed.data?.signedUrl) {
    throw new Error("Could not sign download URL.");
  }

  redirect(signed.data.signedUrl);
}
