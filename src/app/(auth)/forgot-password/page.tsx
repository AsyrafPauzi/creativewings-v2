import Link from "next/link";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Forgot your password?</h1>
      <p className="mt-2 text-muted-foreground">
        We&apos;ll send you a secure link to reset it.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        <Link className="font-medium text-primary hover:underline" href="/sign-in">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
