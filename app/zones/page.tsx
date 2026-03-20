"use client";

import React, { useEffect, useState } from "react";
import { ZonesHeader } from "../../components/zones/zones-header";
import { DrawZone } from "../../components/zones/draw-zone";
import { ZoneList } from "../../components/zones/zone-list";
import {
  createZone, createZoneRule, deleteZone, deleteZoneRule, getZones,
} from "@/lib/client-services/zones.service";
import { authFetch } from "@/lib/client-services/auth.service";
import type { CreateZonePayload, CreateRulePayload, ZoneListItem } from "@/lib/mappers/zone.mappers";

type CameraItem = { camera_id: string; name: string; status: string };

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ZonesPage() {
  const [zones, setZones] = useState<ZoneListItem[]>([]);
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [camerasLoading, setCamerasLoading] = useState(true);
  const [camerasError, setCamerasError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [cameraFilter, setCameraFilter] = useState<string>("all");

  async function loadZones(
    showInitialLoader = false,
    cameraFilterOverride?: string,
  ) {
    if (showInitialLoader) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const id = cameraFilterOverride ?? cameraFilter;
      const cameraId = id !== "all" ? id : undefined;
      setZones(await getZones(cameraId));
      setListError("");
    } catch (error) {
      setListError(getErrorMessage(error, "Failed to load zones"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    loadZones(true);

    (async () => {
      setCamerasLoading(true);
      setCamerasError("");
      try {
        const res = await authFetch("/api/cameras");
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        setCameras(Array.isArray(data) ? data : []);
      } catch (e) {
        if (cancelled) return;
        setCamerasError(getErrorMessage(e, "Failed to load cameras"));
        setCameras([]);
      } finally {
        if (cancelled) return;
        setCamerasLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateZone(zonePayload: CreateZonePayload, rules: CreateRulePayload[]) {
    setIsCreating(true);
    setFormError("");
    setFormSuccess("");
    try {
      const created = await createZone(zonePayload);
      const zoneId = created?.zone_id;
      if (zoneId && rules.length > 0) {
        await Promise.all(rules.map((r) => createZoneRule(zoneId, r).catch(() => null)));
      }
      setFormSuccess("Zone created successfully");
      await loadZones(false);
      return true;
    } catch (error) {
      setFormError(getErrorMessage(error, "Failed to create zone"));
      return false;
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteZone(zoneId: string) {
    try {
      await deleteZone(zoneId);
      setZones((prev) => prev.filter((z) => z.id !== zoneId));
    } catch (error) {
      setListError(getErrorMessage(error, "Failed to delete zone"));
    }
  }

  async function handleDeleteRule(zoneId: string, ruleId: string) {
    try {
      await deleteZoneRule(zoneId, ruleId);
      setZones((prev) =>
        prev.map((z) =>
          z.id === zoneId
            ? { ...z, rules: z.rules.filter((r) => r.rule_id !== ruleId) }
            : z
        )
      );
    } catch (error) {
      setListError(getErrorMessage(error, "Failed to delete rule"));
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 overflow-y-auto font-sans">
      <ZonesHeader />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        <div className="xl:col-span-7 flex flex-col gap-6">
          <DrawZone
            cameras={cameras}
            onCreateZone={handleCreateZone}
            isCreating={isCreating}
            formError={formError}
            formSuccess={formSuccess}
            camerasLoading={camerasLoading}
            camerasError={camerasError}
          />
        </div>

        <div className="xl:col-span-5 flex flex-col">
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Camera Filter
              <select
                value={cameraFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setCameraFilter(v);
                  loadZones(false, v);
                }}
                disabled={camerasLoading}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
              >
                <option value="all">All cameras</option>
                {cameras.map((c) => (
                  <option key={c.camera_id} value={c.camera_id}>
                    {c.name} ({c.camera_id})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ZoneList
            zones={zones}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            error={listError}
            onRefresh={() => loadZones(false)}
            onDeleteZone={handleDeleteZone}
            onDeleteRule={handleDeleteRule}
          />
        </div>
      </div>
    </div>
  );
}
