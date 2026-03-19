"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { IncidentsHeader } from "@/components/incidents/incidents-header";
import { IncidentStats } from "@/components/incidents/incident-stats";
import { IncidentFiltersBar } from "@/components/incidents/incident-filters";
import { IncidentList } from "@/components/incidents/incident-list";
import {
  getIncidents,
  acknowledgeIncident,
  resolveIncident,
  semanticSearch,
} from "@/lib/client-services/incidents.service";
import type { SearchResult } from "@/lib/client-services/incidents.service";
import type { IncidentListItem } from "@/lib/mappers/incident.mappers";
import type { IncidentFilters } from "@/components/incidents/incident-filters";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

const DEFAULT_FILTERS: IncidentFilters = {
  search: "",
  type: "all",
  status: "all",
  severity: "all",
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<IncidentFilters>(DEFAULT_FILTERS);

  // Semantic search state
  const [aiQuery, setAiQuery] = useState("");
  const [aiResults, setAiResults] = useState<SearchResult[]>([]);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiError, setAiError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function loadIncidents(showInitialLoader = false) {
    if (showInitialLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      setIncidents(await getIncidents());
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load incidents"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadIncidents(true);
  }, []);

  // Debounced AI search — fires 600ms after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!aiQuery.trim()) {
      setAiResults([]);
      setAiError("");
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setAiSearching(true);
      setAiError("");
      try {
        setAiResults(await semanticSearch(aiQuery.trim()));
      } catch (err) {
        setAiError(err instanceof Error ? err.message : "Search failed");
        setAiResults([]);
      } finally {
        setAiSearching(false);
      }
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [aiQuery]);

  async function handleAcknowledge(id: string) {
    try {
      await acknowledgeIncident(id);
      setIncidents((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "acknowledged" } : i))
      );
    } catch (err) {
      setError(getErrorMessage(err, "Failed to acknowledge incident"));
    }
  }

  async function handleResolve(id: string) {
    try {
      await resolveIncident(id);
      setIncidents((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "resolved" } : i))
      );
    } catch (err) {
      setError(getErrorMessage(err, "Failed to resolve incident"));
    }
  }

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    return incidents.filter((i) => {
      if (filters.type !== "all" && i.type !== filters.type) return false;
      if (filters.status !== "all" && i.status !== filters.status) return false;
      if (filters.severity !== "all" && i.severity !== filters.severity)
        return false;
      if (
        q &&
        !i.cameraName.toLowerCase().includes(q) &&
        !i.zoneName.toLowerCase().includes(q) &&
        !i.description.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [incidents, filters]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 overflow-y-auto font-sans selection:bg-blue-200">
      <IncidentsHeader />
      <IncidentStats incidents={incidents} isLoading={isLoading} />

      {/* AI Semantic Search */}
      <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-4 text-blue-500" />
          <span className="text-sm font-semibold text-blue-700">AI Search</span>
          <span className="text-xs text-slate-400">Describe what you're looking for in plain language</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder='e.g. "person in red jacket near entrance" or "car parked overnight"'
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          {aiQuery && (
            <button onClick={() => setAiQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="size-4" />
            </button>
          )}
        </div>
        {aiSearching && <p className="mt-2 text-xs text-blue-500 animate-pulse">Searching...</p>}
        {aiError && <p className="mt-2 text-xs text-red-500">{aiError}</p>}
        {aiResults.length > 0 && (
          <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-500 mb-1">{aiResults.length} result{aiResults.length !== 1 ? "s" : ""}</p>
            {aiResults.map((r) => (
              <div key={r.detection_id} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-700 uppercase">{r.object_class ?? "Unknown"}</span>
                    {r.threat_level && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.threat_level === "HIGH" ? "bg-red-100 text-red-700" : r.threat_level === "MEDIUM" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {r.threat_level}
                      </span>
                    )}
                    <span className="text-[10px] text-blue-600 font-medium">score {r.score.toFixed(2)}</span>
                  </div>
                  {r.zone_name && <p className="text-[10px] text-yellow-600 font-semibold mt-0.5">{r.zone_name} · {r.camera_id}</p>}
                  {r.vlm_summary && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{r.vlm_summary}</p>}
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(r.detected_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <IncidentFiltersBar filters={filters} onChange={setFilters} />
      <IncidentList
        incidents={filtered}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRefresh={() => loadIncidents(false)}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </div>
  );
}
