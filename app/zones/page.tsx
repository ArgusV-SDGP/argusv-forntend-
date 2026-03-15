"use client";

import React, { useEffect, useState } from "react";
import { ZonesHeader } from "../../components/zones/zones-header";
import { DrawZone } from "../../components/zones/draw-zone";
import { ZoneList } from "../../components/zones/zone-list";
import {
  createZone,
  getZones,
} from "@/lib/client-services/zones.service";
import type {
  CreateZonePayload,
  ZoneListItem,
} from "@/lib/mappers/zone.mappers";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ZonesPage() {
  const [zones, setZones] = useState<ZoneListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  async function loadZones(showInitialLoader = false) {
    if (showInitialLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

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
  }, []);

  async function handleCreateZone(payload: CreateZonePayload) {
    setIsCreating(true);
    setFormError("");
    setFormSuccess("");

    try {
      await createZone(payload);
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 overflow-y-auto font-sans selection:bg-blue-200">
      <ZonesHeader />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        <div className="xl:col-span-7 flex flex-col gap-6">
          <DrawZone
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
          />
        </div>
      </div>
    </div>
  );
}