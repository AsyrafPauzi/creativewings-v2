import { SignInForm } from "./sign-in-form";
import { AuthFormHeader, AuthSplitPage } from "@/components/auth/auth-ui";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthSplitPage variant="sign-in">
      <AuthFormHeader
        title="Welcome back."
        subtitle="Enter your email and password to land back in your studio."
      />
      <SignInForm next={next ?? "/dashboard"} />
    </AuthSplitPage>
  );
}
