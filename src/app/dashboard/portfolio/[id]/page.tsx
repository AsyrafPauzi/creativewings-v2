import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";

import { ProjectForm } from "@/components/portfolio/project-form";
import { ProjectAssets } from "@/components/portfolio/project-assets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { deleteProjectAction } from "../actions";

export const metadata = { title: "Edit project" };

export default async function EditPortfolioProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: creator } = await supabase
    .from("creators")
    .select("id, slug")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!creator) notFound();

  const { data: project } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("id", id)
    .eq("creator_id", creator.id)
    .maybeSingle();
  if (!project) notFound();

  const { data: assets } = await supabase
    .from("portfolio_project_assets")
    .select("id, asset_type, url, caption, sort_order")
    .eq("project_id", project.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/dashboard/portfolio" className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted hover:text-primary">
            ← Back to portfolio
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-body md:text-4xl">
            {project.title}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={project.is_published ? "success" : "outline"}>
              {project.is_published ? "Published" : "Draft"}
            </Badge>
            <span className="text-xs text-text-muted">/profile/{creator.slug}#{project.slug}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {project.is_published && (
            <Button asChild variant="outline">
              <Link href={`/profile/${creator.slug}`}>View public</Link>
            </Button>
          )}
          <form action={deleteProjectAction.bind(null, project.id)}>
            <Button type="submit" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive-soft">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </form>
        </div>
      </header>

      <ProjectForm
        defaultValues={{
          title: project.title,
          description: project.description ?? "",
          cover_url: project.cover_url ?? "",
          tools: (project.tools ?? []).join(", "),
          tags: (project.tags ?? []).join(", "),
          sdg_goals: (project.sdg_goals ?? []).join(", "),
          external_url: project.external_url ?? "",
          is_published: project.is_published,
        }}
        projectId={project.id}
        submitLabel="Save changes"
      />

      <Card>
        <CardHeader>
          <CardTitle>Project gallery</CardTitle>
          <CardDescription>
            Add multiple images, videos, or links to bring your project to life.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectAssets projectId={project.id} assets={assets ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
