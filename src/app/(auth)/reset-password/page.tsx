import { ResetPasswordForm } from "./reset-password-form";

export const metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Set a new password</h1>
      <p className="mt-2 text-muted-foreground">
        Choose something strong — at least 8 characters.
      </p>
      <div className="mt-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
