"use client";

import React, { useState } from "react";
import {
  Activity,
  RefreshCw,
  Trash2,
  Clock,
  Shield,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Camera,
} from "lucide-react";
import type { ZoneListItem, ZoneRule } from "@/lib/mappers/zone.mappers";

type ZoneListProps = {
  zones: ZoneListItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string;
  onRefresh: () => void;
  onDeleteZone: (zoneId: string) => Promise<void>;
  onDeleteRule: (zoneId: string, ruleId: string) => Promise<void>;
};

const SEVERITY_BADGE: Record<string, string> = {
  HIGH:   "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-orange-100 text-orange-700 border-orange-200",
  LOW:    "bg-yellow-100 text-yellow-700 border-yellow-200",
};

function RuleChip({ rule, onDelete }: { rule: ZoneRule; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px]">
      <AlertTriangle className="size-3 text-orange-400 shrink-0" />
      <span className="font-semibold text-slate-700 capitalize">{rule.trigger_type.replace(/_/g, " ")}</span>
      <span className={`px-1.5 py-0.5 rounded border font-bold ${SEVERITY_BADGE[rule.severity] ?? SEVERITY_BADGE.LOW}`}>
        {rule.severity}
      </span>
      <span className="text-slate-400">{rule.object_classes.join(", ")}</span>
      <button type="button" onClick={onDelete}
        className="ml-auto text-slate-300 hover:text-red-400 transition-colors">
        ×
      </button>
    </div>
  );
}

export function ZoneList({
  zones, isLoading, isRefreshing, error, onRefresh, onDeleteZone, onDeleteRule,
}: ZoneListProps) {
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  const [deletingZone, setDeletingZone] = useState<string | null>(null);

  async function handleDeleteZone(zoneId: string) {
    if (!confirm("Delete this zone and all its rules?")) return;
    setDeletingZone(zoneId);
    try {
      await onDeleteZone(zoneId);
    } finally {
      setDeletingZone(null);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="size-5 text-indigo-500" />
            Zone List
          </h2>
          <p className="text-xs text-slate-500 mt-1">Configured zones · click to expand rules</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 disabled:opacity-50">
          <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="size-10 text-slate-300 mb-3" />
            <p className="text-slate-400 font-medium">Loading zones...</p>
          </div>
        )}

        {zones.map((zone) => {
          const expanded = expandedZone === zone.id;
          return (
            <div key={zone.id}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow overflow-hidden">

              {/* Zone header row */}
              <div className="flex items-start gap-2 p-4 relative">
                {/* active indicator stripe */}
                <div className={`absolute top-0 left-0 w-1 h-full ${zone.active ? "bg-green-500" : "bg-slate-300"}`} />

                <div className="flex-1 ml-2 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{zone.name}</h3>
                    <span className="shrink-0 text-[10px] font-semibold capitalize px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                      {zone.type}
                    </span>
                    {!zone.active && (
                      <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
                    {zone.dwell > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />{zone.dwell}s dwell
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Camera className="size-3 text-slate-400" />
                      Camera: <span className="font-mono">{zone.camera_id}</span>
                    </span>
                    <span>{zone.points} pts</span>
                    <span className="flex items-center gap-1">
                      <Shield className="size-3 text-indigo-400" />
                      {zone.rules.length} rule{zone.rules.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button type="button"
                    onClick={() => setExpandedZone(expanded ? null : zone.id)}
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-indigo-500 transition-colors">
                    {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                  </button>
                  <button type="button"
                    onClick={() => handleDeleteZone(zone.id)}
                    disabled={deletingZone === zone.id}
                    className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded rules */}
              {expanded && (
                <div className="px-4 pb-4 pt-0 space-y-2 border-t border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide pt-2">Threat Rules</p>
                  {zone.rules.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No rules configured. Rules control what triggers alerts in this zone.</p>
                  )}
                  {zone.rules.map((rule) => (
                    <RuleChip
                      key={rule.rule_id}
                      rule={rule}
                      onDelete={() => onDeleteRule(zone.id, rule.rule_id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {!isLoading && zones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="size-10 text-slate-300 mb-3" />
            <p className="text-slate-400 font-medium">No zones configured yet.</p>
            <p className="text-slate-600 text-sm mt-1">Use the canvas to draw a new zone.</p>
          </div>
        )}
      </div>
    </div>
  );
}
