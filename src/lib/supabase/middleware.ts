import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookiesToSet = { name: string; value: string; options?: CookieOptions }[];

const PUBLIC_PATHS = [
  "/",
  "/campaigns",
  "/organizers",
  "/creators",
  "/about",
  "/legal",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/magic-link",
  "/auth/callback",
];

const AUTH_ONLY_PATHS = ["/dashboard", "/onboarding", "/settings"];
const AUTH_ENTRY_PATHS = ["/sign-in", "/sign-up"];

function isPasswordRecoveryPath(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/reset-password" || pathname.startsWith("/reset-password/")) {
    return true;
  }
  return pathname === "/auth/callback" && searchParams.get("next") === "/reset-password";
}

function isAppEmailVerificationPath(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  return (
    pathname === "/auth/callback" &&
    searchParams.get("type") === "email_verification" &&
    Boolean(searchParams.get("token"))
  );
}

function isVerifyEmailPath(pathname: string) {
  return pathname === "/verify-email" || pathname.startsWith("/verify-email/");
}

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/reset-password/")) return true;
  if (pathname.startsWith("/verify-email/")) return true;
  if (pathname.startsWith("/magic-link/")) return true;
  if (pathname.startsWith("/campaigns/")) return true;
  if (pathname.startsWith("/organizer/")) return true;
  if (pathname.startsWith("/profile/")) return true;
  if (pathname.startsWith("/api/public/")) return true;
  return false;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const needsAuth = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));

  if (needsAuth && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded_at")
      .eq("id", user.id)
      .maybeSingle();

    const onboardingComplete = Boolean(profile?.onboarded_at);
    const isOnboardingPath = pathname.startsWith("/onboarding");
    const isAuthEntryPath = AUTH_ENTRY_PATHS.includes(pathname);
    const isPasswordRecovery = isPasswordRecoveryPath(request);
    const isEmailVerification = isAppEmailVerificationPath(request) || isVerifyEmailPath(pathname);

    if (!onboardingComplete && !isOnboardingPath && !isPasswordRecovery && !isEmailVerification) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/onboarding";
      if (isAuthEntryPath) {
        redirectUrl.searchParams.set("registered", "1");
      }
      return NextResponse.redirect(redirectUrl);
    }

    if (onboardingComplete && isAuthEntryPath) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export function shouldHandle(pathname: string) {
  return !isPublicPath(pathname) || AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));
}
