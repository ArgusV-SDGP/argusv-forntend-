"use client";

import React from "react";
import { Search, X } from "lucide-react";
import type { IncidentType, IncidentStatus, IncidentSeverity } from "@/lib/mappers/incident.mappers";

export type IncidentFilters = {
  search: string;
  type: IncidentType | "all";
  status: IncidentStatus | "all";
  severity: IncidentSeverity | "all";
};

type IncidentFiltersProps = {
  filters: IncidentFilters;
  onChange: (filters: IncidentFilters) => void;
};

const TYPE_OPTIONS: { value: IncidentType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "motion", label: "Motion" },
  { value: "door", label: "Door" },
  { value: "rfid", label: "RFID" },
  { value: "system", label: "System" },
  { value: "tag", label: "Tag" },
  { value: "intrusion", label: "Intrusion" },
];

const STATUS_OPTIONS: { value: IncidentStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "resolved", label: "Resolved" },
];

const SEVERITY_OPTIONS: { value: IncidentSeverity | "all"; label: string }[] = [
  { value: "all", label: "All Severities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const selectClass =
  "bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";

export function IncidentFiltersBar({ filters, onChange }: IncidentFiltersProps) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.severity !== "all";

  function reset() {
    onChange({ search: "", type: "all", status: "all", severity: "all" });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-3 flex-wrap items-center">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by camera, zone, or description..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      <select
        value={filters.type}
        onChange={(e) =>
          onChange({ ...filters, type: e.target.value as IncidentType | "all" })
        }
        className={selectClass}
      >
        {TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={filters.severity}
        onChange={(e) =>
          onChange({
            ...filters,
            severity: e.target.value as IncidentSeverity | "all",
          })
        }
        className={selectClass}
      >
        {SEVERITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) =>
          onChange({
            ...filters,
            status: e.target.value as IncidentStatus | "all",
          })
        }
        className={selectClass}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors"
        >
          <X className="size-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
