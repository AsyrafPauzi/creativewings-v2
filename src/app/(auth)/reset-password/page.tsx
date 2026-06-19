import { ResetPasswordForm } from "./reset-password-form";
import { AuthFormHeader, AuthSplitPage } from "@/components/auth/auth-ui";
import { redirect } from "next/navigation";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string;
    error?: string;
    error_code?: string;
    error_description?: string;
    expired?: string;
  }>;
}) {
  const { code, error, error_code, error_description, expired } = await searchParams;

  if (expired === "1" || error || error_code || error_description) {
    redirect("/forgot-password?expired=1");
  }

  if (code) {
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=/reset-password`);
  }

  return (
    <AuthSplitPage variant="reset-password">
      <AuthFormHeader
        title="Set a new key."
        subtitle="Type your new password twice. Make sure both match before saving."
      />
      <ResetPasswordForm />
    </AuthSplitPage>
  );
}
