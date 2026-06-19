import Link from "next/link";
import { ArrowRight, Check, Shield } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { AuthSplitPage } from "@/components/auth/auth-ui";

export const metadata = { title: "Password updated" };

export default function ResetPasswordSuccessPage() {
  return (
    <AuthSplitPage variant="reset-success" formMaxWidth="max-w-[480px]">
      <div className="flex flex-col items-center gap-7 text-center">
        <Logo size={28} />

        <div
          className="grid h-[200px] w-[200px] rotate-6 place-items-center rounded-full border-[3px] border-success bg-[#E7F6EE] text-success"
          aria-hidden
        >
          <Check className="h-24 w-24" strokeWidth={1.7} />
        </div>

        <div className="space-y-2.5">
          <h1 className="text-[34px] font-black italic leading-[1.05] tracking-tight text-body">
            All set.
          </h1>
          <p className="mx-auto max-w-[420px] text-[15px] font-medium leading-[1.5] text-text-secondary">
            Your password has been updated. Sign in to keep flying.
          </p>
        </div>

        <p className="inline-flex items-center gap-2 rounded-pill bg-[#E7F6EE] px-3.5 py-2 text-xs font-extrabold tracking-[0.04em] text-success">
          <Shield className="h-3.5 w-3.5" aria-hidden />
          All other sessions were signed out
        </p>

        <Button asChild size="xl" className="h-14 w-full rounded-pill text-[15px] font-extrabold">
          <Link href="/dashboard">
            Go to my dashboard
            <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
          </Link>
        </Button>
      </div>
    </AuthSplitPage>
  );
}
