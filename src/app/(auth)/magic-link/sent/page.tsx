import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthFormHeader, AuthSplitPage } from "@/components/auth/auth-ui";

export const metadata = { title: "Magic link sent" };

export default async function MagicLinkSentPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthSplitPage variant="magic-link">
      <div className="space-y-6">
        <AuthFormHeader
          title="Magic link sent."
          subtitle="Tap the link in our email and you'll be signed in. Good for 15 minutes."
        />
        {email && (
          <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-body">
            Sent to {email}
          </p>
        )}
        <div className="flex flex-col gap-3">
          <Button asChild variant="outline" className="w-full rounded-pill font-bold">
            <Link href="/sign-in">Use password instead</Link>
          </Button>
          <Link
            href="/magic-link"
            className="inline-flex items-center justify-center gap-2 text-sm font-extrabold text-secondary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Try a different email
          </Link>
        </div>
      </div>
    </AuthSplitPage>
  );
}
