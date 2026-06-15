import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-lg cw-gradient-bg text-white font-bold">
            CW
          </span>
          <span className="font-semibold tracking-tight">Creative Wings</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-7 text-sm font-medium md:flex">
          <Link
            href="/sustainable-development-goals"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Sustainable Development Goals
          </Link>
          <Link
            href="/brand-story"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Brand Story
          </Link>
          <Link
            href="/activities"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Activities
          </Link>
          <Link
            href="/competitions"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Competitions
          </Link>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <Button asChild size="sm" variant="brand">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <Link href="/sign-in">Login</Link>
              </Button>
              <Button asChild size="sm" variant="brand">
                <Link href="/sign-up">Registration</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
