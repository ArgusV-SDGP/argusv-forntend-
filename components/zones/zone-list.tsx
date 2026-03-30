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
  HIGH:   "bg-red-500/15 text-red-400 border-red-500/30",
  MEDIUM: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  LOW:    "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

function RuleChip({ rule, onDelete }: { rule: ZoneRule; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[10px]">
      <AlertTriangle className="size-3 text-orange-400 shrink-0" />
      <span className="font-semibold text-white/70 capitalize">{rule.trigger_type.replace(/_/g, " ")}</span>
      <span className={`px-1.5 py-0.5 rounded border font-bold ${SEVERITY_BADGE[rule.severity] ?? SEVERITY_BADGE.LOW}`}>
        {rule.severity}
      </span>
      <span className="text-white/30">{rule.object_classes.join(", ")}</span>
      <button type="button" onClick={onDelete}
        className="ml-auto text-white/20 hover:text-red-400 transition-colors">
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="size-5 text-[#18ffbe]" />
            Zone List
          </h2>
          <p className="text-xs text-white/30 mt-1">Configured zones · click to expand rules</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-white/50 hover:text-white disabled:opacity-40 transition-colors">
          <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="size-10 text-white/10 mb-3" />
            <p className="text-white/30 font-medium">Loading zones...</p>
          </div>
        )}

        {zones.map((zone) => {
          const expanded = expandedZone === zone.id;
          return (
            <div key={zone.id}
              className="border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03] rounded-xl transition-all overflow-hidden bg-white/[0.02]">

              {/* Zone header row */}
              <div className="flex items-start gap-2 p-4 relative">
                <div className={`absolute top-0 left-0 w-0.5 h-full ${zone.active ? "bg-[#18ffbe]" : "bg-white/20"}`} />

                <div className="flex-1 ml-3 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white/90 truncate">{zone.name}</h3>
                    <span className="shrink-0 text-[10px] font-semibold capitalize px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      {zone.type}
                    </span>
                    {!zone.active && (
                      <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-white/40 border border-white/10">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/30 flex-wrap">
                    {zone.dwell > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />{zone.dwell}s dwell
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Camera className="size-3" />
                      Camera: <span className="font-mono">{zone.camera_id}</span>
                    </span>
                    <span>{zone.points} pts</span>
                    <span className="flex items-center gap-1">
                      <Shield className="size-3 text-[#18ffbe]/50" />
                      {zone.rules.length} rule{zone.rules.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button type="button"
                    onClick={() => setExpandedZone(expanded ? null : zone.id)}
                    className="p-1.5 rounded-md hover:bg-white/[0.06] text-white/30 hover:text-white/70 transition-colors">
                    {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                  </button>
                  <button type="button"
                    onClick={() => handleDeleteZone(zone.id)}
                    disabled={deletingZone === zone.id}
                    className="p-1.5 rounded-md hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors disabled:opacity-40">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded rules */}
              {expanded && (
                <div className="px-4 pb-4 pt-0 space-y-2 border-t border-white/[0.06]">
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wide pt-2">Threat Rules</p>
                  {zone.rules.length === 0 && (
                    <p className="text-xs text-white/25 italic">No rules configured. Rules control what triggers alerts in this zone.</p>
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
            <Activity className="size-10 text-white/10 mb-3" />
            <p className="text-white/30 font-medium">No zones configured yet.</p>
            <p className="text-white/50 text-sm mt-1">Use the canvas to draw a new zone.</p>
          </div>
        )}
      </div>
    </div>
  );
}
