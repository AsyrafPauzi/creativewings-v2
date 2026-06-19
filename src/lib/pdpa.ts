import { createClient, createAdminClient } from "@/lib/supabase/server";
import type {
  AccountDeletionRequestRow,
  CWPdpaConsentEvent,
  DataExportRequestRow,
  PdpaConsentRow,
  PdpaPolicyVersionRow,
  ProfileRow,
} from "@/lib/supabase/database.types";

export interface ConsentFlags {
  marketing: boolean;
  analytics: boolean;
  third_party: boolean;
  public_profile: boolean;
}

export const DEFAULT_CONSENT: ConsentFlags = {
  marketing: false,
  analytics: true,
  third_party: false,
  public_profile: true,
};

/**
 * Returns the policy version that's currently in force. Falls back to the
 * most recent row if no row is flagged is_current (e.g. before the seed has
 * propagated).
 */
export async function getCurrentPolicyVersion(): Promise<PdpaPolicyVersionRow | null> {
  const supabase = await createClient();
  const current = await supabase
    .from("pdpa_policy_versions")
    .select("*")
    .eq("is_current", true)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (current.data) return current.data as PdpaPolicyVersionRow;

  const fallback = await supabase
    .from("pdpa_policy_versions")
    .select("*")
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (fallback.data as PdpaPolicyVersionRow | null) ?? null;
}

export async function listPolicyVersions(): Promise<PdpaPolicyVersionRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pdpa_policy_versions")
    .select("*")
    .order("effective_from", { ascending: false });
  return (data as PdpaPolicyVersionRow[] | null) ?? [];
}

export async function loadPrivacyState(userId: string) {
  const supabase = await createClient();
  const [profileRes, consentsRes, exportsRes, deletionRes, currentVersion] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("pdpa_consents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("data_export_requests")
      .select("*")
      .eq("user_id", userId)
      .order("requested_at", { ascending: false })
      .limit(10),
    supabase
      .from("account_deletion_requests")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    getCurrentPolicyVersion(),
  ]);

  return {
    profile: (profileRes.data as ProfileRow | null) ?? null,
    consents: (consentsRes.data as PdpaConsentRow[] | null) ?? [],
    exports: (exportsRes.data as DataExportRequestRow[] | null) ?? [],
    deletion: (deletionRes.data as AccountDeletionRequestRow | null) ?? null,
    currentVersion,
  };
}

export async function recordConsent(opts: {
  userId: string;
  policyVersion: string;
  event: CWPdpaConsentEvent;
  flags: ConsentFlags;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const admin = createAdminClient();
  await admin.from("pdpa_consents").insert({
    user_id: opts.userId,
    policy_version: opts.policyVersion,
    event: opts.event,
    consent_marketing: opts.flags.marketing,
    consent_analytics: opts.flags.analytics,
    consent_third_party: opts.flags.third_party,
    consent_public_profile: opts.flags.public_profile,
    ip_address: opts.ip ?? null,
    user_agent: opts.userAgent ?? null,
  });

  await admin
    .from("profiles")
    .update({
      pdpa_version_accepted: opts.policyVersion,
      pdpa_consent_at: new Date().toISOString(),
      consent_marketing: opts.flags.marketing,
      consent_analytics: opts.flags.analytics,
      consent_third_party: opts.flags.third_party,
      consent_public_profile: opts.flags.public_profile,
      consent_updated_at: new Date().toISOString(),
    })
    .eq("id", opts.userId);
}

/**
 * Gathers every user-owned row across the data model and returns it as a
 * single JSON-friendly object. Only a small number of tables hold user PII
 * directly so this stays manageable even for active accounts.
 */
export async function buildUserDataExport(userId: string) {
  const admin = createAdminClient();
  const select = (table: string, column: string = "user_id") =>
    admin.from(table).select("*").eq(column, userId);

  const [
    profile,
    consents,
    submissions,
    walletEntries,
    badges,
    portfolio,
    exports,
    deletion,
  ] = await Promise.all([
    admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
    admin
      .from("pdpa_consents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    admin
      .from("submissions")
      .select("*")
      .eq("contestant_id", userId)
      .order("created_at", { ascending: false }),
    select("wallet_entries"),
    select("user_badges"),
    admin
      .from("portfolio_projects")
      .select("*, portfolio_project_assets(*)")
      .eq("creator_id", userId),
    select("data_export_requests"),
    select("account_deletion_requests"),
  ]);

  return {
    exported_at: new Date().toISOString(),
    user_id: userId,
    profile: profile.data ?? null,
    consents: consents.data ?? [],
    submissions: submissions.data ?? [],
    wallet_entries: walletEntries.data ?? [],
    badges: badges.data ?? [],
    portfolio: portfolio.data ?? [],
    data_export_requests: exports.data ?? [],
    account_deletion_requests: deletion.data ?? [],
  };
}
