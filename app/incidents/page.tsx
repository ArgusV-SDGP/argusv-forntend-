"use client";

import React, { useEffect, useMemo, useState } from "react";
import { IncidentsHeader } from "@/components/incidents/incidents-header";
import { IncidentStats } from "@/components/incidents/incident-stats";
import { IncidentFiltersBar } from "@/components/incidents/incident-filters";
import { IncidentList } from "@/components/incidents/incident-list";
import {
  getIncidents,
  acknowledgeIncident,
  resolveIncident,
} from "@/lib/client-services/incidents.service";
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
