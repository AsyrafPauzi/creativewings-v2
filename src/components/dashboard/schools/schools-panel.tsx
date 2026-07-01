"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SchoolRow } from "@/lib/supabase/database.types";

import { deleteSchoolAction, saveSchoolAction } from "@/app/dashboard/campaigns/[id]/schools/actions";

type Props = {
  campaignId: string;
  schools: SchoolRow[];
};

export function SchoolsPanel({ campaignId, schools }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = schools.find((s) => s.id === editingId);

  const saveAction = saveSchoolAction.bind(null, campaignId);

  return (
    <div className="space-y-6">
      <form action={saveAction} className="grid gap-4 md:grid-cols-3">
        {editingId ? <input type="hidden" name="school_id" value={editingId} /> : null}
        <div className="space-y-2">
          <Label htmlFor="school_code">School code (3 digits)</Label>
          <Input
            id="school_code"
            name="school_code"
            maxLength={3}
            placeholder="001"
            defaultValue={editing?.school_code ?? ""}
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="school_name">School name</Label>
          <Input
            id="school_name"
            name="school_name"
            defaultValue={editing?.school_name ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={editing?.city ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={editing?.country ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coupon_code">Sponsor coupon (optional)</Label>
          <Input
            id="coupon_code"
            name="coupon_code"
            placeholder="SCHOOL100"
            defaultValue={editing?.coupon_code ?? ""}
          />
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-3">
          <Button type="submit">{editingId ? "Update school" : "Add school"}</Button>
          {editingId ? (
            <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
              Cancel edit
            </Button>
          ) : null}
        </div>
      </form>

      <ul className="divide-y rounded-md border">
        {schools.length === 0 ? (
          <li className="p-4 text-sm text-muted-foreground">No schools yet.</li>
        ) : (
          schools.map((school) => (
            <li
              key={school.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <div className="font-bold">
                  {school.school_code} — {school.school_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {[school.city, school.country].filter(Boolean).join(", ") || "—"}
                  {school.coupon_code ? ` · Coupon: ${school.coupon_code}` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(school.id)}>
                  Edit
                </Button>
                <form action={deleteSchoolAction.bind(null, campaignId, school.id)}>
                  <Button type="submit" size="sm" variant="destructive">
                    Delete
                  </Button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
