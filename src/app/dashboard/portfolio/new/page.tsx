import Link from "next/link";

import { ProjectForm } from "@/components/portfolio/project-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "New project" };

export default async function NewPortfolioProjectPage() {
  const { user } = await requireUser();
  const supabase = await createClient();
  const { data: creator } = await supabase
    .from("creators")
    .select("id, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!creator) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Become a creator first</CardTitle>
          <CardDescription>
            <Link href="/onboarding" className="font-bold text-primary hover:underline">
              Continue onboarding
            </Link>{" "}
            to create your creator profile.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <Link href="/dashboard/portfolio" className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted hover:text-primary">
          ← Back to portfolio
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-body md:text-4xl">
          New project
        </h1>
        <p className="text-text-secondary">Showcase a piece of work in your public Behance-style portfolio.</p>
      </header>

      <ProjectForm submitLabel="Create project" />
    </div>
  );
}
