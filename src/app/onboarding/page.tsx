import { redirect } from "next/navigation";
import { Check, Flame, Flower2, Palette, Feather, Sparkles, Star } from "lucide-react";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { resendVerificationAction } from "@/app/(auth)/actions";
import { EmailVerificationModal } from "./email-verification-modal";
import { PickRoleForm } from "./pick-role-form";

export const metadata = { title: "Welcome to Creative Wings" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role, onboarded_at, is_minor, guardian_name, email_verified_at, email_verification_sent_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarded_at) redirect("/dashboard");

  const intendedRole =
    (user.user_metadata?.intended_role as string | undefined) ?? profile?.role ?? "contestant";
  const isProfileEmailVerified = Boolean(profile?.email_verified_at);
  const showEmailVerificationModal = Boolean(
    user.email && profile && !profileError && !isProfileEmailVerified,
  );

  return (
    <div className="bg-background">
      {showEmailVerificationModal && (
        <EmailVerificationModal
          email={user.email!}
          initialEmailVerificationSentAt={profile?.email_verification_sent_at ?? null}
          resendAction={resendVerificationAction}
        />
      )}
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#FCE6EC_0%,#F8F9FB_50%,#E1ECF6_100%)] px-6 py-16 text-center md:py-20">
        <Sticker className="left-[10%] top-14 -rotate-6 bg-[#FCE6EC] text-primary" icon={Sparkles} />
        <Sticker className="right-[12%] top-16 rotate-12 bg-[#E1ECF6] text-secondary" icon={Star} />
        <Sticker className="left-[6%] top-[48%] -rotate-3 bg-[#FCE6EC] text-primary" icon={Flower2} />
        <Sticker className="right-[8%] top-[52%] rotate-[16deg] bg-[#E1ECF6] text-secondary" icon={Feather} />
        <Sticker className="left-[16%] bottom-12 -rotate-12 bg-[#FCE6EC] text-primary" icon={Palette} small />
        <Sticker className="right-[18%] bottom-10 rotate-6 bg-[#E1ECF6] text-secondary" icon={Flame} small />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-7">
          <span className="inline-flex items-center gap-2 rounded-pill bg-success-soft px-3.5 py-1.5 text-sm font-semibold text-success">
            <Check className="h-3.5 w-3.5" aria-hidden />
            {registered === "1" ? "Account registered successfully · Step 1 of 1" : "Account ready · Step 1 of 1"}
          </span>
          <div className="space-y-2">
            <h1 className="font-primary text-5xl font-black italic leading-[1.05] tracking-tight text-body md:text-[64px]">
              What brings you to
              <span className="relative mx-auto block w-fit">
                Creative Wings?
                <span className="absolute -bottom-2 left-1/2 h-1.5 w-[92%] -translate-x-1/2 rounded-full bg-primary" />
              </span>
            </h1>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
            {registered === "1"
              ? "You already successfully registered. Select your role to finish setting up your Creative Wings account."
              : "Pick the path that fits how you want to fly. You can change this later in settings."}
          </p>
        </div>
      </section>

      <section className="bg-background px-6 pb-12 pt-8">
        <div className="mx-auto max-w-[1280px]">
        {profile?.is_minor && (
          <p className="mx-auto mb-8 max-w-2xl rounded-2xl border border-primary/30 bg-brand-soft px-5 py-4 text-sm text-text-secondary">
            Your account is linked to guardian{" "}
            <span className="font-semibold text-body">{profile.guardian_name ?? "your parent"}</span>.
            You can sign in on your own — they&apos;ll receive monitoring access to help keep your
            experience safe.
          </p>
        )}
          <PickRoleForm intendedRole={intendedRole} />
        </div>
      </section>
    </div>
  );
}

function Sticker({
  icon: Icon,
  className,
  small,
}: {
  icon: typeof Sparkles;
  className: string;
  small?: boolean;
}) {
  return (
    <div
      className={`absolute hidden place-items-center rounded-full shadow-elevated md:grid ${small ? "h-12 w-12" : "h-16 w-16"} ${className}`}
      aria-hidden
    >
      <Icon className={small ? "h-7 w-7" : "h-8 w-8"} />
    </div>
  );
}
