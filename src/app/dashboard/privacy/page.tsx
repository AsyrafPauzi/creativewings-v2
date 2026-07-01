import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  Download,
  FileDown,
  FileText,
  History,
  Info,
  Lock,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireUser } from "@/lib/auth";
import { loadPrivacyState } from "@/lib/pdpa";
import {
  cancelAccountDeletionAction,
  downloadExportAction,
  reacceptPolicyAction,
  requestDataExportAction,
  scheduleAccountDeletionAction,
  updateConsentAction,
} from "./actions";

export const metadata = { title: "Privacy & Data" };

const CONSENT_ITEMS: {
  id:
    | "consent_account"
    | "consent_transactional"
    | "consent_marketing"
    | "consent_badge_emails"
    | "consent_analytics"
    | "consent_third_party"
    | "consent_public_profile";
  title: string;
  body: string;
  required?: boolean;
  field?:
    | "consent_marketing"
    | "consent_badge_emails"
    | "consent_analytics"
    | "consent_third_party"
    | "consent_public_profile";
}[] = [
  {
    id: "consent_account",
    title: "Account & service",
    body: "Required to operate your account, deliver campaigns, and issue certificates.",
    required: true,
  },
  {
    id: "consent_transactional",
    title: "Email notifications (transactional)",
    body: "Required for sign-in, password changes, and submission status.",
    required: true,
  },
  {
    id: "consent_marketing",
    title: "Marketing emails",
    body: "Occasional newsletters about new campaigns, schools and creator stories.",
    field: "consent_marketing",
  },
  {
    id: "consent_badge_emails",
    title: "Badge notification emails",
    body: "Get an email when you unlock a new badge on Creative Wings.",
    field: "consent_badge_emails",
  },
  {
    id: "consent_analytics",
    title: "Analytics",
    body: "Anonymous product analytics to help us improve UX. Never sold.",
    field: "consent_analytics",
  },
  {
    id: "consent_third_party",
    title: "Sponsor & partner offers",
    body: "Targeted offers from organizers whose campaigns you joined.",
    field: "consent_third_party",
  },
  {
    id: "consent_public_profile",
    title: "Public portfolio (Creators)",
    body: "Show your profile, projects and submissions on a public Behance-style page.",
    field: "consent_public_profile",
  },
];

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtBytes(n: number | null | undefined) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

const EVENT_LABEL: Record<string, string> = {
  accept_signup: "Privacy notice accepted",
  accept_update: "Updated privacy notice accepted",
  consent_change: "Consent preferences changed",
  withdraw: "Consent withdrawn",
  reaccept: "Privacy notice re-accepted",
};

export default async function PrivacyPage() {
  const { user, profile } = await requireUser();
  const state = await loadPrivacyState(user.id);

  const versionAccepted = state.profile?.pdpa_version_accepted;
  const acceptedAt = state.profile?.pdpa_consent_at;
  const currentVersion = state.currentVersion?.version ?? "—";
  const upToDate =
    versionAccepted && state.currentVersion
      ? versionAccepted === state.currentVersion.version
      : false;

  const flags = {
    marketing: state.profile?.consent_marketing ?? false,
    badge_emails: state.profile?.consent_badge_emails ?? true,
    analytics: state.profile?.consent_analytics ?? true,
    third_party: state.profile?.consent_third_party ?? false,
    public_profile: state.profile?.consent_public_profile ?? true,
  };

  const deletion = state.deletion?.status === "scheduled" ? state.deletion : null;
  const lastReadyExport = state.exports.find((e) => e.status === "ready");

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-pill border bg-card px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-text-muted">
            <Lock className="h-3 w-3" /> Privacy & data
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-body">
            Your data, your rules
          </h1>
          <p className="max-w-2xl text-sm text-text-secondary">
            Review what we hold, control how it&apos;s used, export a copy, or delete your
            account permanently. Powered by Malaysia&apos;s PDPA 2010 — read the{" "}
            <Link href="/pdpa" className="font-semibold text-primary underline-offset-2 hover:underline">
              full notice
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/pdpa">
              <FileText className="h-4 w-4" /> Read full notice
            </Link>
          </Button>
          <form action={requestDataExportAction}>
            <input type="hidden" name="format" value="json" />
            <Button type="submit">
              <Download className="h-4 w-4" /> Export now
            </Button>
          </form>
        </div>
      </header>

      {/* Status banner ------------------------------------------------------- */}
      {deletion ? (
        <Card className="border-destructive/30 bg-destructive-soft">
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-destructive">
                <AlertTriangle className="h-5 w-5 text-white" />
              </span>
              <div>
                <div className="text-sm font-extrabold text-destructive">
                  Account scheduled for deletion on {fmtDate(deletion.scheduled_for)}
                </div>
                <div className="text-xs font-medium text-destructive/90">
                  You can cancel any time before then. After that, your personal data
                  is permanently erased.
                </div>
              </div>
            </div>
            <form action={cancelAccountDeletionAction}>
              <Button type="submit" variant="outline" className="border-destructive text-destructive">
                Cancel deletion
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className={upToDate ? "border-success/30 bg-success-soft" : "border-warning/30 bg-warning-soft"}>
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span
                className={`grid h-10 w-10 place-items-center rounded-md ${
                  upToDate ? "bg-success" : "bg-warning"
                }`}
              >
                <ShieldCheck className="h-5 w-5 text-white" />
              </span>
              <div>
                <div className={`text-sm font-extrabold ${upToDate ? "text-success" : "text-warning"}`}>
                  {upToDate
                    ? `Privacy notice v${versionAccepted} · accepted ${fmtDate(acceptedAt)}`
                    : `Action needed: please re-accept v${currentVersion}`}
                </div>
                <div className={`text-xs font-medium ${upToDate ? "text-success" : "text-warning"}`}>
                  {upToDate
                    ? "Your account is in good standing. No outstanding consent requests."
                    : "We've updated the notice since your last acceptance. Re-accept to continue with full access."}
                </div>
              </div>
            </div>
            {!upToDate && (
              <form action={reacceptPolicyAction}>
                <Button type="submit">Re-accept v{currentVersion}</Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Consent toggles ----------------------------------------------------- */}
      <Card className="overflow-hidden">
        <span aria-hidden className="block h-1 w-full bg-primary" />
        <CardContent className="space-y-5 p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-soft text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-body">Consent preferences</h2>
              <p className="text-sm text-text-secondary">
                Toggle individual consents at any time. Withdrawing required consents
                will end your account.
              </p>
            </div>
          </div>

          <form action={updateConsentAction} className="space-y-3">
            {CONSENT_ITEMS.map((item) => {
              const isOn = item.required
                ? true
                : item.field
                  ? flags[item.field.replace("consent_", "") as keyof typeof flags]
                  : false;
              return (
                <label
                  key={item.id}
                  className="flex items-center gap-4 rounded-md border bg-surface px-4 py-3"
                >
                  <div className="flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-body">{item.title}</span>
                      {item.required && (
                        <span className="inline-flex items-center gap-1 rounded-pill bg-info-soft px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-info">
                          <Lock className="h-2.5 w-2.5" /> Required
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-secondary">{item.body}</div>
                  </div>
                  <Toggle
                    name={item.field ?? ""}
                    defaultChecked={isOn}
                    disabled={item.required}
                  />
                </label>
              );
            })}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit">Save preferences</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Export + Delete ---------------------------------------------------- */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Export */}
        <Card className="overflow-hidden">
          <span aria-hidden className="block h-1 w-full bg-info" />
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-info-soft text-info">
                <Download className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-body">Export my data</h2>
                <p className="text-sm text-text-secondary">
                  A single JSON archive of every record we hold about you. Ready in
                  under a minute.
                </p>
              </div>
            </div>

            <div className="rounded-md bg-info-soft p-4">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-info">
                Includes
              </div>
              <ul className="mt-2 space-y-1 text-xs font-semibold text-info">
                <li>· Profile, identity & guardian info</li>
                <li>· Campaign submissions & uploaded files</li>
                <li>· Payment receipts & coupons</li>
                <li>· Notifications, consent log, audit entries</li>
              </ul>
            </div>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
                Past exports
              </div>
              <div className="mt-2 space-y-2">
                {state.exports.length === 0 && (
                  <div className="rounded-md border bg-surface p-3 text-xs text-text-muted">
                    No exports yet.
                  </div>
                )}
                {state.exports.map((ex) => (
                  <form
                    key={ex.id}
                    action={downloadExportAction}
                    className="flex items-center gap-3 rounded-md border bg-surface px-3 py-2"
                  >
                    <input type="hidden" name="export_id" value={ex.id} />
                    <FileDown className="h-4 w-4 text-text-muted" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-bold text-body">
                        cw-data-{ex.id.slice(0, 8)}.{ex.format === "json" ? "json" : ex.format}
                      </div>
                      <div className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
                        {fmtDate(ex.requested_at)} · {fmtBytes(ex.file_size)} ·{" "}
                        <span
                          className={
                            ex.status === "ready"
                              ? "text-success"
                              : ex.status === "failed"
                                ? "text-destructive"
                                : "text-warning"
                          }
                        >
                          {ex.status}
                        </span>
                      </div>
                    </div>
                    {ex.status === "ready" && (
                      <Button type="submit" size="sm" variant="outline">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </form>
                ))}
              </div>
            </div>

            <form action={requestDataExportAction}>
              <input type="hidden" name="format" value="json" />
              <Button type="submit" className="w-full" variant="secondary">
                <Download className="h-4 w-4" /> Generate new export
              </Button>
            </form>
            {lastReadyExport?.expires_at && (
              <p className="text-[11px] text-text-muted">
                Latest archive available until {fmtDate(lastReadyExport.expires_at)}.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Delete */}
        <Card className="overflow-hidden">
          <span aria-hidden className="block h-1 w-full bg-destructive" />
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-destructive-soft text-destructive">
                <Trash2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-body">Delete my account</h2>
                <p className="text-sm text-text-secondary">
                  You&apos;ll have 30 days to change your mind. After that, your data is
                  permanently erased.
                </p>
              </div>
            </div>

            <div className="rounded-md bg-destructive-soft p-4">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-destructive">
                What happens next
              </div>
              <ol className="mt-2 space-y-2 text-xs font-semibold text-destructive">
                {[
                  "Account locked & marked for deletion",
                  "You can sign in within 30 days to cancel",
                  "All your submissions are anonymized",
                  "Personal data is permanently erased",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-2">
                    <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-destructive text-[10px] font-extrabold text-white">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {deletion ? (
              <form action={cancelAccountDeletionAction} className="space-y-2">
                <p className="text-xs text-text-secondary">
                  Account scheduled for deletion on {fmtDate(deletion.scheduled_for)}.
                </p>
                <Button type="submit" variant="outline" className="w-full">
                  Cancel deletion
                </Button>
              </form>
            ) : (
              <form action={scheduleAccountDeletionAction} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reason" className="text-xs uppercase tracking-wide text-text-muted">
                    Help us improve (optional)
                  </Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    placeholder="Tell us why you're leaving…"
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-xs uppercase tracking-wide text-text-muted">
                    Type <span className="font-extrabold text-destructive">DELETE</span> to confirm
                  </Label>
                  <Input id="confirm" name="confirm" placeholder="DELETE" required />
                </div>
                <Button type="submit" variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4" /> Schedule account deletion
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit log ---------------------------------------------------------- */}
      <Card className="overflow-hidden">
        <span aria-hidden className="block h-1 w-full bg-info" />
        <CardContent className="space-y-4 p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-info-soft text-info">
              <History className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-body">Consent & data history</h2>
              <p className="text-sm text-text-secondary">
                Every change to your privacy preferences and every data request is
                logged here.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface text-left text-[10px] font-extrabold uppercase tracking-[0.16em] text-text-muted">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Event</th>
                  <th className="px-3 py-2">Detail</th>
                  <th className="px-3 py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {state.consents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-text-muted">
                      No history yet.
                    </td>
                  </tr>
                )}
                {state.consents.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-3 py-2 font-bold text-body">{fmtDate(c.created_at)}</td>
                    <td className="px-3 py-2 font-bold text-primary">
                      {EVENT_LABEL[c.event] ?? c.event}
                    </td>
                    <td className="px-3 py-2 text-text-secondary">
                      v{c.policy_version} ·{" "}
                      <span className="text-text-muted">
                        m:{c.consent_marketing ? "y" : "n"} a:{c.consent_analytics ? "y" : "n"}{" "}
                        3p:{c.consent_third_party ? "y" : "n"} pub:{c.consent_public_profile ? "y" : "n"}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-bold text-body">
                      {c.user_agent?.toLowerCase().includes("mobi")
                        ? "Mobile"
                        : c.user_agent
                          ? "Web"
                          : "System"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Compliance footer -------------------------------------------------- */}
      <div className="flex items-start gap-3 rounded-md border bg-surface p-4 text-xs text-text-secondary">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div>
          Need help with a request? Email{" "}
          <a className="font-semibold text-primary" href="mailto:dpo@creativewings.asia">
            dpo@creativewings.asia
          </a>{" "}
          or call <span className="font-semibold">+603 7785 1248</span>. We answer within 21
          days as required by PDPA.{" "}
          <Link href="/pdpa" className="font-semibold text-primary">
            Read the full notice <ChevronRight className="inline h-3 w-3" />
          </Link>
        </div>
      </div>
      <p className="sr-only">Signed in as {profile.email}</p>
    </div>
  );
}

function Toggle({
  name,
  defaultChecked,
  disabled,
}: {
  name: string;
  defaultChecked: boolean;
  disabled?: boolean;
}) {
  return (
    <span className="relative inline-flex h-6 w-11 flex-shrink-0 items-center">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="peer sr-only"
      />
      <span className="absolute inset-0 rounded-full bg-border-strong transition-colors peer-checked:bg-primary peer-disabled:opacity-50" />
      <span
        aria-hidden
        className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
      />
    </span>
  );
}
