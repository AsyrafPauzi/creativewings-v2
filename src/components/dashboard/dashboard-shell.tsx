import Link from "next/link";
import {
  BarChart3,
  Building2,
  Compass,
  Folder,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Settings,
  Sparkles,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";

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
  ];

  const business: NavItem[] = [
    { href: "/dashboard/campaigns", label: "Campaigns", icon: <Trophy className="h-4 w-4" /> },
    { href: "/dashboard/organizer", label: "Organisation", icon: <Building2 className="h-4 w-4" /> },
    { href: "/dashboard/reports", label: "Reports", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/dashboard/wallet", label: "Wallet", icon: <Wallet className="h-4 w-4" /> },
  ];

  const admin: NavItem[] = [
    { href: "/dashboard/admin", label: "Admin", icon: <Megaphone className="h-4 w-4" /> },
    { href: "/dashboard/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
  ];

  const tail: NavItem[] = [
    { href: "/dashboard/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ];

  switch (role) {
    case "business":
      return [...common, ...business, ...(isAdmin ? admin : []), ...tail];
    case "creator":
      return [...common, ...creator, ...(isAdmin ? admin : []), ...tail];
    case "admin":
      return [...common, ...admin, ...tail];
    default:
      return [...common, ...contestant, ...(isAdmin ? admin : []), ...tail];
  }
}

export interface DashboardShellProps {
  role: CWRole;
  isAdmin: boolean;
  user: { full_name: string | null; email: string; avatar_url: string | null };
  children: React.ReactNode;
}

export function DashboardShell({ role, isAdmin, user, children }: DashboardShellProps) {
  const items = navFor(role, isAdmin);
  const initial = (user.full_name || user.email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
      <aside className="hidden border-r bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg cw-gradient-bg text-white">
              CW
            </span>
            Creative Wings
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user.full_name || "Your account"}</div>
              <div className="truncate text-xs text-muted-foreground">{user.email}</div>
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
        <header className="flex h-16 items-center justify-between border-b px-4 md:hidden">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg cw-gradient-bg text-white">
              CW
            </span>
            Creative Wings
          </Link>
          <form action={signOutAction}>
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </header>
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
