"use client";

import { useActionState, useState } from "react";

import {
  saveCampaignChildrenAction,
  uploadCampaignMediaAction,
  type ChildrenFormState,
} from "@/app/dashboard/campaigns/children-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  AgeBracketRow,
  CustomFieldRow,
  CWFieldType,
  FaqItemRow,
  PrizeRow,
} from "@/lib/supabase/database.types";
import { slugify } from "@/lib/utils";

const initial: ChildrenFormState = {};

const FIELD_TYPES: CWFieldType[] = [
  "text",
  "textarea",
  "number",
  "phone",
  "email",
  "date",
  "select",
  "checkbox",
  "file",
];

interface Props {
  campaignId: string;
  enableAgeBrackets: boolean;
  prizes: PrizeRow[];
  faqItems: FaqItemRow[];
  ageBrackets: AgeBracketRow[];
  customFields: CustomFieldRow[];
  bannerUrl: string | null;
  heroUrl: string | null;
}

export function CampaignChildrenPanel({
  campaignId,
  enableAgeBrackets,
  prizes: initialPrizes,
  faqItems,
  ageBrackets,
  customFields,
  bannerUrl,
  heroUrl,
}: Props) {
  const saveAction = saveCampaignChildrenAction.bind(null, campaignId);
  const mediaAction = uploadCampaignMediaAction.bind(null, campaignId);
  const [childState, childFormAction, childPending] = useActionState(saveAction, initial);
  const [mediaState, mediaFormAction, mediaPending] = useActionState(mediaAction, initial);

  const [prizes, setPrizes] = useState(
    initialPrizes.length
      ? initialPrizes.map((p) => ({
          title: p.title,
          description: p.description ?? "",
          rank: p.rank ?? "",
          sort_order: p.sort_order,
        }))
      : [{ title: "", description: "", rank: "", sort_order: 0 }],
  );
  const [faq, setFaq] = useState(
    faqItems.length
      ? faqItems.map((f) => ({ question: f.question, answer: f.answer, sort_order: f.sort_order }))
      : [{ question: "", answer: "", sort_order: 0 }],
  );
  const [brackets, setBrackets] = useState(
    ageBrackets.length
      ? ageBrackets.map((b) => ({
          key: b.key,
          label: b.label,
          min_age: b.min_age,
          max_age: b.max_age,
          sort_order: b.sort_order,
        }))
      : [{ key: "", label: "", min_age: 7, max_age: 12, sort_order: 0 }],
  );
  const [fields, setFields] = useState(
    customFields.length
      ? customFields.map((f) => ({
          label: f.label,
          field_type: f.field_type,
          options: f.options ?? "",
          required: f.required,
          sort_order: f.sort_order,
        }))
      : [{ label: "", field_type: "text" as CWFieldType, options: "", required: false, sort_order: 0 }],
  );

  return (
    <div className="space-y-6">
      <form action={childFormAction} className="space-y-6">
        <input
          type="hidden"
          name="prizes_json"
          value={JSON.stringify(
            prizes
              .filter((p) => p.title.trim())
              .map((p) => ({
                title: p.title.trim(),
                description: p.description.trim() || undefined,
                rank: p.rank === "" ? null : Number(p.rank),
                sort_order: p.sort_order,
              })),
          )}
        />
        <input
          type="hidden"
          name="faq_json"
          value={JSON.stringify(faq.filter((f) => f.question.trim() && f.answer.trim()))}
        />
        <input
          type="hidden"
          name="age_brackets_json"
          value={JSON.stringify(
            brackets
              .filter((b) => b.label.trim())
              .map((b) => ({
                key: b.key.trim() || slugify(b.label),
                label: b.label.trim(),
                min_age: b.min_age,
                max_age: b.max_age,
                sort_order: b.sort_order,
              })),
          )}
        />
        <input
          type="hidden"
          name="custom_fields_json"
          value={JSON.stringify(fields.filter((f) => f.label.trim()))}
        />

        <Card>
          <CardHeader>
            <CardTitle>Prizes</CardTitle>
            <CardDescription>Prize tiers shown on the public campaign page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {prizes.map((p, i) => (
              <div key={i} className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_80px_1fr_auto]">
                <Input
                  placeholder="Prize title"
                  value={p.title}
                  onChange={(e) => {
                    const next = [...prizes];
                    next[i] = { ...next[i], title: e.target.value };
                    setPrizes(next);
                  }}
                />
                <Input
                  type="number"
                  placeholder="Rank"
                  value={p.rank}
                  onChange={(e) => {
                    const next = [...prizes];
                    next[i] = { ...next[i], rank: e.target.value };
                    setPrizes(next);
                  }}
                />
                <Input
                  placeholder="Description"
                  value={p.description}
                  onChange={(e) => {
                    const next = [...prizes];
                    next[i] = { ...next[i], description: e.target.value };
                    setPrizes(next);
                  }}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => setPrizes(prizes.filter((_, j) => j !== i))}>
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPrizes([...prizes, { title: "", description: "", rank: "", sort_order: prizes.length }])}
            >
              + Add prize
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
            <CardDescription>Questions contestants ask before submitting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {faq.map((f, i) => (
              <div key={i} className="space-y-2 rounded-md border p-4">
                <Input
                  placeholder="Question"
                  value={f.question}
                  onChange={(e) => {
                    const next = [...faq];
                    next[i] = { ...next[i], question: e.target.value };
                    setFaq(next);
                  }}
                />
                <Textarea
                  placeholder="Answer"
                  rows={3}
                  value={f.answer}
                  onChange={(e) => {
                    const next = [...faq];
                    next[i] = { ...next[i], answer: e.target.value };
                    setFaq(next);
                  }}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => setFaq(faq.filter((_, j) => j !== i))}>
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFaq([...faq, { question: "", answer: "", sort_order: faq.length }])}
            >
              + Add FAQ
            </Button>
          </CardContent>
        </Card>

        {enableAgeBrackets ? (
          <Card>
            <CardHeader>
              <CardTitle>Age brackets</CardTitle>
              <CardDescription>Categories contestants choose on the submit form.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {brackets.map((b, i) => (
                <div key={i} className="grid gap-3 rounded-md border p-4 md:grid-cols-4">
                  <Input
                    placeholder="Label (e.g. Junior)"
                    value={b.label}
                    onChange={(e) => {
                      const next = [...brackets];
                      next[i] = {
                        ...next[i],
                        label: e.target.value,
                        key: slugify(e.target.value) || next[i].key,
                      };
                      setBrackets(next);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Min age"
                    value={b.min_age}
                    onChange={(e) => {
                      const next = [...brackets];
                      next[i] = { ...next[i], min_age: parseInt(e.target.value, 10) || 0 };
                      setBrackets(next);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Max age"
                    value={b.max_age}
                    onChange={(e) => {
                      const next = [...brackets];
                      next[i] = { ...next[i], max_age: parseInt(e.target.value, 10) || 0 };
                      setBrackets(next);
                    }}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setBrackets(brackets.filter((_, j) => j !== i))}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setBrackets([
                    ...brackets,
                    { key: "", label: "", min_age: 7, max_age: 12, sort_order: brackets.length },
                  ])
                }
              >
                + Add bracket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enable &quot;Age brackets&quot; in campaign toggles above to configure categories.
          </p>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Custom participant fields</CardTitle>
            <CardDescription>Extra questions on the submission form.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((f, i) => (
              <div key={i} className="grid gap-3 rounded-md border p-4 md:grid-cols-2">
                <Input
                  placeholder="Field label"
                  value={f.label}
                  onChange={(e) => {
                    const next = [...fields];
                    next[i] = { ...next[i], label: e.target.value };
                    setFields(next);
                  }}
                />
                <Select
                  value={f.field_type}
                  onChange={(e) => {
                    const next = [...fields];
                    next[i] = { ...next[i], field_type: e.target.value as CWFieldType };
                    setFields(next);
                  }}
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
                {f.field_type === "select" && (
                  <Input
                    className="md:col-span-2"
                    placeholder="Options (comma-separated)"
                    value={f.options}
                    onChange={(e) => {
                      const next = [...fields];
                      next[i] = { ...next[i], options: e.target.value };
                      setFields(next);
                    }}
                  />
                )}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) => {
                      const next = [...fields];
                      next[i] = { ...next[i], required: e.target.checked };
                      setFields(next);
                    }}
                  />
                  Required
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setFields(fields.filter((_, j) => j !== i))}>
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setFields([
                  ...fields,
                  { label: "", field_type: "text", options: "", required: false, sort_order: fields.length },
                ])
              }
            >
              + Add field
            </Button>
          </CardContent>
        </Card>

        {childState.error && <p className="text-sm text-destructive">{childState.error}</p>}
        {childState.success && <p className="text-sm text-success">{childState.success}</p>}

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={childPending}>
            {childPending ? "Saving…" : "Save prizes, FAQ & fields"}
          </Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Campaign images</CardTitle>
          <CardDescription>Banner and hero images shown on the public campaign page.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={mediaFormAction} className="space-y-4" encType="multipart/form-data">
            {(bannerUrl || heroUrl) && (
              <div className="flex flex-wrap gap-4">
                {bannerUrl && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">Current banner</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bannerUrl} alt="" className="h-20 w-36 rounded-md object-cover" />
                  </div>
                )}
                {heroUrl && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">Current hero</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroUrl} alt="" className="h-20 w-36 rounded-md object-cover" />
                  </div>
                )}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="banner_file">Banner image</Label>
                <Input id="banner_file" name="banner_file" type="file" accept="image/jpeg,image/png,image/webp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_file">Hero image</Label>
                <Input id="hero_file" name="hero_file" type="file" accept="image/jpeg,image/png,image/webp" />
              </div>
            </div>
            {mediaState.error && <p className="text-sm text-destructive">{mediaState.error}</p>}
            {mediaState.success && <p className="text-sm text-success">{mediaState.success}</p>}
            <Button type="submit" variant="outline" disabled={mediaPending}>
              {mediaPending ? "Uploading…" : "Upload images"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
