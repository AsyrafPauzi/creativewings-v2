"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createProjectAction, updateProjectAction, type PortfolioFormState } from "@/app/dashboard/portfolio/actions";

export interface ProjectFormDefaults {
  title: string;
  description: string;
  cover_url: string;
  tools: string;
  tags: string;
  sdg_goals: string;
  external_url: string;
  is_published: boolean;
}

interface ProjectFormProps {
  defaultValues?: ProjectFormDefaults;
  projectId?: string;
  submitLabel: string;
}

const EMPTY: ProjectFormDefaults = {
  title: "",
  description: "",
  cover_url: "",
  tools: "",
  tags: "",
  sdg_goals: "",
  external_url: "",
  is_published: false,
};

export function ProjectForm({ defaultValues = EMPTY, projectId, submitLabel }: ProjectFormProps) {
  const action = projectId
    ? updateProjectAction.bind(null, projectId)
    : createProjectAction;
  const [state, formAction] = useActionState<PortfolioFormState, FormData>(
    action,
    {} as PortfolioFormState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-md border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-bold text-body">Basics</h2>
        <p className="mt-1 text-sm text-text-secondary">Title, cover image, and a short story.</p>

        <div className="mt-5 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="title">Project title</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={defaultValues.title}
              placeholder="A brand identity for…"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="cover_url">Cover image URL</Label>
            <Input
              id="cover_url"
              name="cover_url"
              type="url"
              defaultValue={defaultValues.cover_url}
              placeholder="https://…"
            />
            <p className="text-xs text-text-muted">Use a 4:3 image for the best preview.</p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={defaultValues.description}
              placeholder="Tell the story behind this project — challenge, process, outcome."
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="external_url">External link (optional)</Label>
            <Input
              id="external_url"
              name="external_url"
              type="url"
              defaultValue={defaultValues.external_url}
              placeholder="https://your-portfolio.com/case-study"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-bold text-body">Tools, tags & SDGs</h2>
        <p className="mt-1 text-sm text-text-secondary">Help discovery — comma-separated.</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="tools">Tools</Label>
            <Input
              id="tools"
              name="tools"
              defaultValue={defaultValues.tools}
              placeholder="Figma, Illustrator, Cinema 4D"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={defaultValues.tags}
              placeholder="branding, illustration, motion"
            />
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label htmlFor="sdg_goals">SDG goals (numbers, comma-separated)</Label>
            <Input
              id="sdg_goals"
              name="sdg_goals"
              defaultValue={defaultValues.sdg_goals}
              placeholder="4, 13"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-bold text-body">Publishing</h2>
        <p className="mt-1 text-sm text-text-secondary">Drafts are visible only to you.</p>

        <label className="mt-5 flex items-center gap-3 rounded-md border p-3">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={defaultValues.is_published}
            className="h-4 w-4 rounded border-input"
          />
          <span className="text-sm font-semibold text-body">Publish to my public portfolio</span>
        </label>
      </div>

      {state.error && (
        <div className="rounded-md border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state.ok && (
        <div className="rounded-md border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
          Saved.
        </div>
      )}

      <div className="flex justify-end">
        <Submit label={submitLabel} />
      </div>
    </form>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}
