"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CampaignReport } from "@/lib/reports/aggregate";

const STATUS_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#64748b"];

export function ReportsDashboard({ report }: { report: CampaignReport }) {
  const kpiPct =
    report.campaign.kpi_target > 0
      ? Math.min(100, Math.round((report.totals.submissions / report.campaign.kpi_target) * 100))
      : null;

  const base = `/dashboard/reports/export/${report.campaign.id}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Submissions" value={String(report.totals.submissions)} />
        <KpiCard label="Paid entries" value={String(report.totals.paid)} />
        <KpiCard
          label="Revenue"
          value={formatCurrency(report.totals.revenue, report.campaign.currency)}
        />
        <KpiCard label="Total votes" value={String(report.totals.votes)} />
        <KpiCard
          label="KPI progress"
          value={kpiPct != null ? `${kpiPct}%` : "—"}
          hint={
            report.campaign.kpi_target
              ? `${report.totals.submissions} / ${report.campaign.kpi_target}`
              : undefined
          }
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Exports</CardTitle>
            <CardDescription>Download roster and summary reports.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`${base}/roster`}>
                <Download className="h-4 w-4" /> CSV roster
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`${base}/xlsx`}>
                <FileSpreadsheet className="h-4 w-4" /> XLSX
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`${base}/pdf`}>
                <FileText className="h-4 w-4" /> PDF
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Participants by day" description="New submissions over time">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={report.participantsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by day" description="Paid orders over time">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={report.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="By status" description="Submission status breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={report.byStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(props) => {
                  const entry = props as { status?: string; count?: number };
                  return `${entry.status ?? ""} (${entry.count ?? 0})`;
                }}
              >
                {report.byStatus.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="By school" description="Top participating schools">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={report.bySchool.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="school_name" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">{label}</div>
        <div className="mt-1 text-2xl font-extrabold text-body">{value}</div>
        {hint ? <div className="mt-0.5 text-xs text-text-secondary">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
