"use client";

import React from "react";
import { Activity, CheckCheck, Tag, Siren } from "lucide-react";
import type { IncidentListItem } from "@/lib/mappers/incident.mappers";

type IncidentStatsProps = {
  incidents: IncidentListItem[];
  isLoading: boolean;
};

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: string;
  isLoading: boolean;
};

function StatCard({ icon, label, value, accent, isLoading }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${accent}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
          {label}
        </p>
        {isLoading ? (
          <div className="h-7 w-12 bg-slate-100 rounded mt-1 animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        )}
      </div>
    </div>
  );
}

export function IncidentStats({ incidents, isLoading }: IncidentStatsProps) {
  const total = incidents.length;
  const open = incidents.filter((i) => i.status === "open").length;
  const critical = incidents.filter((i) => i.severity === "critical").length;
  const resolved = incidents.filter((i) => i.status === "resolved").length;

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <StatCard
        icon={<Activity className="size-6 text-blue-600" />}
        label="Total"
        value={total}
        accent=""
        isLoading={isLoading}
      />
      <StatCard
        icon={<Tag className="size-6 text-amber-600" />}
        label="Open"
        value={open}
        accent=""
        isLoading={isLoading}
      />
      <StatCard
        icon={<Siren className="size-6 text-red-600" />}
        label="Critical"
        value={critical}
        accent=""
        isLoading={isLoading}
      />
      <StatCard
        icon={<CheckCheck className="size-6 text-emerald-600" />}
        label="Resolved"
        value={resolved}
        accent=""
        isLoading={isLoading}
      />
    </div>
  );
}
