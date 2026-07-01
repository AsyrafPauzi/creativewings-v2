"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  uploadOrganizerMediaAction,
  type OrganizerMediaState,
} from "@/app/dashboard/organizer/actions";

const initial: OrganizerMediaState = {};

interface Props {
  logoUrl: string | null;
  bannerUrl: string | null;
}

export function OrganizerMediaUpload({ logoUrl, bannerUrl }: Props) {
  const [state, formAction, pending] = useActionState(uploadOrganizerMediaAction, initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo & banner</CardTitle>
        <CardDescription>Shown on your public organizer page and campaign cards.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" encType="multipart/form-data">
          {(logoUrl || bannerUrl) && (
            <div className="flex flex-wrap gap-4">
              {logoUrl && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">Current logo</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
                </div>
              )}
              {bannerUrl && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">Current banner</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bannerUrl} alt="" className="h-20 w-40 rounded-md object-cover" />
                </div>
              )}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logo_file">Logo image</Label>
              <Input id="logo_file" name="logo_file" type="file" accept="image/jpeg,image/png,image/webp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner_file">Banner image</Label>
              <Input id="banner_file" name="banner_file" type="file" accept="image/jpeg,image/png,image/webp" />
            </div>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.success && <p className="text-sm text-success">{state.success}</p>}
          <Button type="submit" variant="outline" disabled={pending}>
            {pending ? "Uploading…" : "Upload images"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
