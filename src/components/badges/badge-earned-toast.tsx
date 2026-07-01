"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, X } from "lucide-react";

import { markBadgesNotifiedAction } from "@/app/dashboard/badges/actions";

type Props = {
  pending: { slug: string; name: string }[];
};

export function BadgeEarnedToast({ pending }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [queue, setQueue] = useState(pending);
  const [current, setCurrent] = useState<(typeof pending)[0] | null>(null);

  useEffect(() => {
    const fromQuery = (searchParams.get("badges") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (fromQuery.length > 0) {
      const extras = fromQuery
        .filter((slug) => !pending.some((p) => p.slug === slug))
        .map((slug) => ({ slug, name: slug.replace(/-/g, " ") }));
      setQueue((q) => [...q, ...extras]);
      const url = new URL(window.location.href);
      url.searchParams.delete("badges");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router, pending]);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((q) => q.slice(1));
    }
  }, [queue, current]);

  async function dismiss() {
    if (current) {
      await markBadgesNotifiedAction([current.slug]);
    }
    setCurrent(null);
  }

  if (!current) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-lg border bg-background p-4 shadow-lg">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-primary">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="flex-1 text-sm">
        <div className="font-bold">Badge unlocked!</div>
        <p className="text-muted-foreground">You earned {current.name}.</p>
      </div>
      <button type="button" onClick={dismiss} className="text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
