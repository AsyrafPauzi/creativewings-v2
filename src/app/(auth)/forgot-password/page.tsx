import { ForgotPasswordForm, ForgotPasswordSentPanel } from "./forgot-password-form";
import { AuthFormHeader, AuthSplitPage } from "@/components/auth/auth-ui";

export const metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; email?: string; expired?: string }>;
}) {
  const { sent, email, expired } = await searchParams;
  const isSent = sent === "1";

  return (
    <AuthSplitPage variant={isSent ? "forgot-password-sent" : "forgot-password"}>
      {isSent ? (
        <ForgotPasswordSentPanel email={email?.trim()} />
      ) : (
        <>
          <AuthFormHeader
            title="Lost the door key?"
            subtitle="Enter the email tied to your account. We'll mail a reset link that's good for one hour."
          />
          <ForgotPasswordForm expired={expired === "1"} />
        </>
      )}
    </AuthSplitPage>
  );
}
