import Link from "next/link";
import {
  BarChart3,
  Building2,
  Compass,
  Folder,
  LayoutDashboard,
  Lock,
  ListChecks,
  Megaphone,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CWRole } from "@/lib/supabase/database.types";

type NavItem = { href: string; label: string; icon: React.ReactNode };

function navFor(role: CWRole, isAdmin: boolean): NavItem[] {
  const common: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  ];

  const contestant: NavItem[] = [
    { href: "/dashboard/submissions", label: "My submissions", icon: <ListChecks className="h-4 w-4" /> },
    { href: "/dashboard/badges", label: "Badges", icon: <Sparkles className="h-4 w-4" /> },
    { href: "/dashboard/wallet", label: "Wallet", icon: <Wallet className="h-4 w-4" /> },
    { href: "/campaigns", label: "Browse campaigns", icon: <Compass className="h-4 w-4" /> },
  ];

  const creator: NavItem[] = [
    { href: "/dashboard/portfolio", label: "My portfolio", icon: <Folder className="h-4 w-4" /> },
    { href: "/dashboard/submissions", label: "My submissions", icon: <ListChecks className="h-4 w-4" /> },
    { href: "/dashboard/badges", label: "Badges", icon: <Sparkles className="h-4 w-4" /> },
    { href: "/dashboard/wallet", label: "Wallet", icon: <Wallet className="h-4 w-4" /> },
  ];

  const organizer: NavItem[] = [
    { href: "/dashboard/campaigns", label: "Campaigns", icon: <Trophy className="h-4 w-4" /> },
    { href: "/dashboard/organizer", label: "Organization", icon: <Building2 className="h-4 w-4" /> },
    { href: "/dashboard/reports", label: "Reports", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/dashboard/wallet", label: "Wallet", icon: <Wallet className="h-4 w-4" /> },
  ];

  const admin: NavItem[] = [
    { href: "/dashboard/admin", label: "Admin overview", icon: <ShieldCheck className="h-4 w-4" /> },
    { href: "/dashboard/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { href: "/dashboard/admin/moderation", label: "Moderation", icon: <Megaphone className="h-4 w-4" /> },
  ];

  const tail: NavItem[] = [
    { href: "/dashboard/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
    { href: "/dashboard/privacy", label: "Privacy & Data", icon: <Lock className="h-4 w-4" /> },
  ];

  switch (role) {
    case "organizer":
      return [...common, ...organizer, ...(isAdmin ? admin : []), ...tail];
    case "creator":
      return [...common, ...creator, ...(isAdmin ? admin : []), ...tail];
    case "admin":
      return [...common, ...admin, ...tail];
    default:
      return [...common, ...contestant, ...(isAdmin ? admin : []), ...tail];
  }
}

const ROLE_LABELS: Record<CWRole, string> = {
  contestant: "Contestant",
  creator: "Creator",
  organizer: "Organizer",
  admin: "Admin",
};

export interface DashboardShellProps {
  role: CWRole;
  isAdmin: boolean;
  user: { full_name: string | null; email: string; avatar_url: string | null };
  children: React.ReactNode;
}

export function DashboardShell({ role, isAdmin, user, children }: DashboardShellProps) {
  const items = navFor(role, isAdmin);
  const initial = (user.full_name || user.email || "?").slice(0, 1).toUpperCase();
  const roleLabel = isAdmin ? "Admin" : ROLE_LABELS[role];

  return (
    <div className="grid min-h-screen md:grid-cols-[260px_1fr] bg-surface">
      <aside className="hidden border-r bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Link href="/">
            <Logo size={26} />
          </Link>
        </div>

        <div className="px-6 py-4 border-b">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Mode</div>
          <div className="mt-1 inline-flex items-center gap-2 rounded-pill border bg-surface px-3 py-1 text-xs font-bold text-body">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {roleLabel}
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface hover:text-body",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-sm font-extrabold text-primary">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-body">{user.full_name || "Your account"}</div>
              <div className="truncate text-xs text-text-muted">{user.email}</div>
            </div>
          </div>
          <form action={signOutAction} className="mt-3">
            <Button variant="outline" size="sm" type="submit" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:hidden">
          <Link href="/">
            <Logo size={24} />
          </Link>
          <form action={signOutAction}>
            <Button variant="ghost" size="sm" type="submit">Sign out</Button>
          </form>
        </header>
        <main
          className="flex-1 p-6 md:p-10"
          style={{
            backgroundImage:
              "linear-gradient(180deg, hsl(var(--brand-soft)) 0%, hsl(var(--surface)) 22%)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 280px",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
