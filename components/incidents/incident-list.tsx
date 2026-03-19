"use client";

import React from "react";
import {
  Activity,
  RefreshCw,
  Camera,
  MapPin,
  Clock,
  CheckCheck,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import type {
  IncidentListItem,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from "@/lib/mappers/incident.mappers";


type IncidentListProps = {
  incidents: IncidentListItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string;
  onRefresh: () => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
};

const SEVERITY_STYLES: Record<IncidentSeverity, { bar: string; badge: string }> = {
  low: { bar: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200" },
  medium: { bar: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  high: { bar: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
};

const STATUS_STYLES: Record<IncidentStatus, string> = {
  open: "bg-amber-50 text-amber-700 border-amber-200",
  acknowledged: "bg-blue-50 text-blue-700 border-blue-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const TYPE_STYLES: Record<IncidentType, string> = {
  intrusion: "bg-red-50 text-red-700 border-red-100",
  motion: "bg-blue-50 text-blue-700 border-blue-100",
  system: "bg-amber-50 text-amber-700 border-amber-100",
};

function formatTimestamp(ts: string) {
  try {
    const date = new Date(ts);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

type IncidentCardProps = {
  incident: IncidentListItem;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
};

function IncidentCard({ incident, onAcknowledge, onResolve }: IncidentCardProps) {
  const severity = SEVERITY_STYLES[incident.severity];
  const statusClass = STATUS_STYLES[incident.status];
  const typeClass = TYPE_STYLES[incident.type];

  return (
    <div className="bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white rounded-xl p-4 transition-all group flex flex-col gap-3 relative overflow-hidden shadow-sm hover:shadow">
      <div className={`absolute top-0 left-0 w-1 h-full ${severity.bar}`} />

      <div className="flex flex-wrap items-start justify-between gap-2 ml-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md border capitalize ${typeClass}`}
          >
            {incident.objectClass}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md border capitalize ${severity.badge}`}
          >
            {incident.severity}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md border capitalize ${statusClass}`}
          >
            {incident.status}
          </span>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {incident.status === "open" && (
            <button
              type="button"
              onClick={() => onAcknowledge(incident.id)}
              title="Acknowledge"
              className="flex items-center gap-1 p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors text-xs"
            >
              <CheckCheck className="size-3.5" />
            </button>
          )}
          {incident.status !== "resolved" && (
            <button
              type="button"
              onClick={() => onResolve(incident.id)}
              title="Resolve"
              className="flex items-center gap-1 p-1.5 rounded-md hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors text-xs"
            >
              <CheckCircle className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {incident.description && (
        <p className="text-sm text-slate-700 ml-2 leading-snug">
          {incident.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ml-2 text-slate-500">
        <span className="flex items-center gap-1.5">
          <Camera className="size-3.5" />
          {incident.cameraName}
        </span>
        {incident.zoneName !== "—" && (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {incident.zoneName}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" />
          {formatTimestamp(incident.timestamp)}
        </span>
      </div>

      <div className="ml-2 font-mono text-[10px] text-slate-400">
        ID: {incident.id}
      </div>
    </div>
  );
}

export function IncidentList({
  incidents,
  isLoading,
  isRefreshing,
  error,
  onRefresh,
  onAcknowledge,
  onResolve,
}: IncidentListProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            Incident Log
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {incidents.length} incident{incidents.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium transition-colors text-slate-600 disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="overflow-y-auto space-y-3 pr-1 -mr-1 custom-scrollbar max-h-[calc(100vh-28rem)]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Activity className="size-10 text-slate-300 mb-3 animate-pulse" />
            <p className="text-slate-400 font-medium">Loading incidents...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-slate-400 font-medium">No incidents found.</p>
            <p className="text-slate-500 text-sm mt-1">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          incidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onAcknowledge={onAcknowledge}
              onResolve={onResolve}
            />
          ))
        )}
      </div>
    </div>
  );
}
