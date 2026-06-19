import { AuthSplitPage } from "@/components/auth/auth-ui";
import { createClient } from "@/lib/supabase/server";
import { VerifyEmailExpiredPanel } from "../verify-email-panels";

export const metadata = { title: "Confirmation link expired" };

export default async function VerifyEmailExpiredPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const resendEmail = user?.email ?? email ?? "";

  return (
    <AuthSplitPage variant="verify-expired">
      <VerifyEmailExpiredPanel email={resendEmail} isAuthenticated={Boolean(user)} />
    </AuthSplitPage>
  );
}
