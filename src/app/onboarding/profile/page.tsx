import { redirect } from "next/navigation";
import { ShieldCheck, Sparkles, Star } from "lucide-react";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { CompleteProfileForm } from "./complete-profile-form";

export const metadata = { title: "Complete your profile" };
export const dynamic = "force-dynamic";

export default async function OnboardingProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select(
      "role, full_name, display_name, phone, country, city, is_minor, guardian_name, guardian_email, onboarded_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.role || profile.role === "admin") redirect("/onboarding");
  if (profile.onboarded_at) redirect("/dashboard");

  const role = profile.role as "contestant" | "creator" | "organizer";
  const isContestant = role === "contestant";
  const isMinorContestant = isContestant && profile.is_minor;
  const guardianLabel = profile.guardian_name ?? profile.guardian_email;
  const headline = isMinorContestant
    ? "Tell us about the student joining."
    : isContestant
      ? "Tell us who is joining."
      : "Complete your profile";
  const subhead = isContestant
    ? isMinorContestant
      ? "This profile is for the student contestant. Guardian details are already linked from signup."
      : "Just your name and a few optional details so we can place you in the right Creative Wings experience."
    : "Spend a minute on the basics now. You can add more details later from your dashboard.";

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#FCE6EC_0%,#F8F9FB_100%)] px-6 py-12 text-center md:py-16">
        <Sticker className="left-[9%] top-10 -rotate-12 bg-[#FCE6EC] text-primary" icon={Sparkles} />
        <Sticker className="right-[10%] top-12 rotate-12 bg-[#E1ECF6] text-secondary" icon={Star} />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-5">
          <div className="inline-flex items-center gap-2 rounded-pill bg-white/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted shadow-soft">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
            Step 2 of 3 · {isContestant ? "Contestant setup" : "Profile setup"}
          </div>
          <h1 className="font-primary text-4xl font-black italic leading-[1.05] tracking-tight text-body md:text-5xl">
            {headline}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-text-secondary">{subhead}</p>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <CompleteProfileForm
            role={role}
            isMinor={profile.is_minor}
            guardianName={profile.guardian_name}
            guardianEmail={profile.guardian_email}
            defaults={{
              full_name: profile.full_name ?? profile.display_name ?? "",
              phone: profile.phone ?? "",
              country: profile.country ?? "Malaysia",
              city: profile.city ?? "",
            }}
          />

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-border bg-white p-6 shadow-elevated">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-primary">
                <Sparkles className="h-7 w-7" aria-hidden />
              </div>
              <h2 className="text-xl font-extrabold text-body">
                {isMinorContestant
                  ? "Student profile, guardian linked"
                  : isContestant
                    ? "Ready to join campaigns"
                    : "Your dashboard is waiting"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {isMinorContestant
                  ? `We only need the student's basics here. Guardian monitoring${
                      guardianLabel ? ` for ${guardianLabel}` : ""
                    } stays linked in the background.`
                  : isContestant
                    ? "We only need enough information to identify you, contact you if needed, and personalize local opportunities."
                    : "Finish this step to unlock your dashboard. You can refine your public details anytime."}
              </p>
            </div>

            <div className="rounded-2xl bg-info-soft p-4 text-sm font-semibold leading-6 text-secondary">
              <div className="mb-2 flex items-center gap-2 text-body">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                Privacy first
              </div>
              {isMinorContestant
                ? "Student contestant details stay private unless work is published later with the right consent."
                : "Your contestant details stay private unless you choose to publish work later."}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function Sticker({
  icon: Icon,
  className,
}: {
  icon: typeof Sparkles;
  className: string;
}) {
  return (
    <div
      className={`absolute hidden h-14 w-14 place-items-center rounded-full shadow-elevated md:grid ${className}`}
      aria-hidden
    >
      <Icon className="h-7 w-7" />
    </div>
  );
}
