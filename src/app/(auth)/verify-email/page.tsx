import { AuthSplitPage } from "@/components/auth/auth-ui";
import { createClient } from "@/lib/supabase/server";
import { VerifyEmailPanel } from "./verify-email-panels";

export const metadata = { title: "Verify your email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("onboarded_at")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };
  const signedInEmail = user?.email ?? "";
  const displayEmail = signedInEmail || email || "";
  const continueHref = profile?.onboarded_at ? "/dashboard" : "/onboarding";

  return (
    <AuthSplitPage variant="verify-email">
      <VerifyEmailPanel
        continueHref={continueHref}
        email={displayEmail}
        isAuthenticated={Boolean(user)}
      />
    </AuthSplitPage>
  );
}
