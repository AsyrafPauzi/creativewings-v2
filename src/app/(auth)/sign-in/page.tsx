import Link from "next/link";

import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">
        Sign in to manage your campaigns, submissions, and certificates.
      </p>
      <div className="mt-8">
        <SignInForm next={next ?? "/dashboard"} />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link className="font-medium text-primary hover:underline" href="/sign-up">
          Create one
        </Link>
      </p>
    </div>
  );
}
