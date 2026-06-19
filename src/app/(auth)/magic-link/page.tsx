import { AuthFormHeader, AuthSplitPage } from "@/components/auth/auth-ui";
import { MagicLinkForm } from "./magic-link-form";

export const metadata = { title: "Magic link sign-in" };

export default function MagicLinkPage() {
  return (
    <AuthSplitPage variant="magic-link">
      <AuthFormHeader
        title="Skip the password."
        subtitle="Enter your email and we'll send a one-tap login link — good for 15 minutes."
      />
      <MagicLinkForm />
    </AuthSplitPage>
  );
}
