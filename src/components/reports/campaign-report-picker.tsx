"use client";

import { useRouter } from "next/navigation";

export function CampaignReportPicker({
  campaigns,
  selectedId,
}: {
  campaigns: { id: string; title: string }[];
  selectedId: string;
}) {
  const router = useRouter();

  return (
    <select
      className="rounded-md border bg-card px-3 py-2 text-sm font-semibold text-body"
      value={selectedId}
      onChange={(e) => router.push(`/dashboard/reports?campaign=${e.target.value}`)}
    >
      {campaigns.map((c) => (
        <option key={c.id} value={c.id}>
          {c.title}
        </option>
      ))}
    </select>
  );
}
