import { AuthSplitPage } from "@/components/auth/auth-ui";
import { createClient } from "@/lib/supabase/server";
import { VerifyEmailSuccessPanel } from "../verify-email-panels";

export const metadata = { title: "Email verified" };

export default async function VerifyEmailSuccessPage() {
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
  const continueHref = profile?.onboarded_at ? "/dashboard" : "/onboarding";

  return (
    <AuthSplitPage variant="verify-success">
      <VerifyEmailSuccessPanel continueHref={continueHref} />
    </AuthSplitPage>
  );
}
