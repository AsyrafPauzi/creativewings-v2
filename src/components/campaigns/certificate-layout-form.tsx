"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Json } from "@/lib/supabase/database.types";

import { saveCertificateSettingsAction } from "@/app/dashboard/campaigns/[id]/certificate-actions";

type Props = {
  campaignId: string;
  templateUrl: string | null;
  layout: Json;
};

export function CertificateLayoutForm({ campaignId, templateUrl, layout }: Props) {
  const layoutObj =
    layout && typeof layout === "object" && !Array.isArray(layout)
      ? (layout as Record<string, Record<string, unknown>>)
      : {};

  const block = (key: string, prefix: string) => {
    const b = layoutObj[key] ?? {};
    return {
      x: Number(b.x ?? 400),
      y: Number(b.y ?? 320),
      fontSize: Number(b.fontSize ?? 24),
      fontFamily: String(b.fontFamily ?? "Helvetica"),
      color: String(b.color ?? "#1a1a1a"),
      prefix,
    };
  };

  const name = block("name", "name");
  const date = block("date", "date");
  const title = block("campaign_title", "title");

  const action = saveCertificateSettingsAction.bind(null, campaignId);

  return (
    <form action={action} className="space-y-6" encType="multipart/form-data">
      <div className="space-y-2">
        <Label htmlFor="template">Certificate template (PNG/JPG)</Label>
        <Input id="template" name="template" type="file" accept="image/jpeg,image/png,image/webp" />
        {templateUrl ? (
          <p className="text-xs text-muted-foreground">
            Current:{" "}
            <a href={templateUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              View template
            </a>
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Participant name", ...name },
          { label: "Date", ...date },
          { label: "Campaign title", ...title },
        ].map((field) => (
          <fieldset key={field.prefix} className="space-y-3 rounded-md border p-4">
            <legend className="px-1 text-sm font-bold">{field.label}</legend>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor={`${field.prefix}_x`}>X</Label>
                <Input id={`${field.prefix}_x`} name={`${field.prefix}_x`} type="number" defaultValue={field.x} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${field.prefix}_y`}>Y</Label>
                <Input id={`${field.prefix}_y`} name={`${field.prefix}_y`} type="number" defaultValue={field.y} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${field.prefix}_fontSize`}>Size</Label>
                <Input
                  id={`${field.prefix}_fontSize`}
                  name={`${field.prefix}_fontSize`}
                  type="number"
                  defaultValue={field.fontSize}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${field.prefix}_color`}>Color</Label>
                <Input
                  id={`${field.prefix}_color`}
                  name={`${field.prefix}_color`}
                  defaultValue={field.color}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor={`${field.prefix}_fontFamily`}>Font</Label>
                <Input
                  id={`${field.prefix}_fontFamily`}
                  name={`${field.prefix}_fontFamily`}
                  defaultValue={field.fontFamily}
                />
              </div>
            </div>
          </fieldset>
        ))}
      </div>

      <Button type="submit">Save certificate settings</Button>
    </form>
  );
}
