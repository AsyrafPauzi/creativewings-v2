"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import {
  addProjectAssetAction,
  deleteProjectAssetAction,
} from "@/app/dashboard/portfolio/actions";

interface AssetRow {
  id: string;
  asset_type: string;
  url: string;
  caption: string | null;
  sort_order: number;
}

interface ProjectAssetsProps {
  projectId: string;
  assets: AssetRow[];
}

export function ProjectAssets({ projectId, assets }: ProjectAssetsProps) {
  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {assets.length === 0 && (
          <li className="rounded-md border border-dashed p-4 text-center text-sm text-text-muted">
            No assets yet. Add the first one below.
          </li>
        )}
        {assets.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-4 rounded-md border bg-surface p-3"
          >
            <Preview type={a.asset_type} url={a.url} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-pill bg-background px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  {a.asset_type}
                </span>
                <span className="text-xs text-text-muted">#{a.sort_order}</span>
              </div>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer noopener"
                className="line-clamp-1 text-sm font-bold text-body hover:text-primary"
              >
                {a.url}
              </a>
              {a.caption && <div className="text-xs text-text-secondary">{a.caption}</div>}
            </div>
            <form action={deleteProjectAssetAction.bind(null, projectId, a.id)}>
              <Button
                type="submit"
                size="icon-sm"
                variant="outline"
                className="text-destructive border-destructive/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </form>
          </li>
        ))}
      </ul>

      <form
        action={addProjectAssetAction.bind(null, projectId)}
        className="space-y-3 rounded-md border bg-background p-4"
      >
        <div className="grid gap-3 md:grid-cols-[140px_1fr_120px]">
          <div className="grid gap-1.5">
            <Label htmlFor="asset_type">Type</Label>
            <Select id="asset_type" name="asset_type" defaultValue="image">
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" required placeholder="https://…" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sort_order">Order</Label>
            <Input id="sort_order" name="sort_order" type="number" defaultValue={assets.length} />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="caption">Caption (optional)</Label>
          <Input id="caption" name="caption" placeholder="Describe this image or link" />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="secondary">Add asset</Button>
        </div>
      </form>
    </div>
  );
}

function Preview({ type, url }: { type: string; url: string }) {
  if (type === "image") {
    return (
      <Image
        src={url}
        alt=""
        width={80}
        height={56}
        unoptimized
        className="h-14 w-20 rounded-sm border object-cover"
      />
    );
  }
  return (
    <div className="grid h-14 w-20 place-items-center rounded-sm border bg-surface text-[10px] font-bold uppercase text-text-muted">
      {type}
    </div>
  );
}
