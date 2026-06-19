import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { verifyAppEmailToken } from "@/lib/email-verification";

function safeNextPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/onboarding");
  const isVerifyEmailFlow = next.startsWith("/verify-email");

  if (type === "email_verification" && token) {
    try {
      const result = await verifyAppEmailToken(token);
      if (result.status === "verified") {
        revalidatePath("/onboarding");
        revalidatePath("/dashboard");
        revalidatePath("/verify-email");
        return NextResponse.redirect(`${origin}/verify-email/success`);
      }

      const expiredUrl = new URL("/verify-email/expired", origin);
      if (result.status === "expired" && result.email) {
        expiredUrl.searchParams.set("email", result.email);
      }
      return NextResponse.redirect(expiredUrl);
    } catch {
      return NextResponse.redirect(`${origin}/verify-email/expired`);
    }
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    if (next === "/reset-password") {
      return NextResponse.redirect(`${origin}/forgot-password?expired=1`);
    }

    if (isVerifyEmailFlow) {
      return NextResponse.redirect(`${origin}/verify-email/expired`);
    }
  }

  if (isVerifyEmailFlow || searchParams.has("error") || searchParams.has("error_code")) {
    return NextResponse.redirect(`${origin}/verify-email/expired`);
  }

  return NextResponse.redirect(`${origin}/sign-in?error=callback`);
}
