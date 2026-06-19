import Link from "next/link";

import { signOutAction } from "@/app/(auth)/actions";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

const LINKS = [
  { href: "/programmes", label: "Programmes" },
  { href: "/sustainable-development-goals", label: "SDG Goals" },
  { href: "/creators", label: "Creators" },
  { href: "/organizers", label: "Organizers" },
  { href: "/brand-story", label: "Story" },
  { href: "/press", label: "Press" },
];

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="cw-container flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="Creative Wings home">
          <Logo size={28} />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-semibold text-text-secondary md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-body"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <form action={signOutAction}>
                <Button type="submit" size="default" variant="ghost" className="hidden sm:inline-flex">
                  Log out
                </Button>
              </form>
              <Button asChild size="default">
                <Link href="/dashboard">My account</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="default" variant="ghost" className="hidden sm:inline-flex">
                <Link href="/sign-in">Log in</Link>
              </Button>
              <Button asChild size="default">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
