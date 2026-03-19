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
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  async function loadZones(showInitialLoader = false) {
    if (showInitialLoader) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      setZones(await getZones());
      setListError("");
    } catch (error) {
      setListError(getErrorMessage(error, "Failed to load zones"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadZones(true);
    authFetch("/api/cameras")
      .then((r) => r.json())
      .then((d) => setCameras(Array.isArray(d) ? d : []))
      .catch(() => {});
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
          />
        </div>

        <div className="xl:col-span-5 flex flex-col">
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
