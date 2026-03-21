"use client";

import { AlertCircle, CheckSquare, Square } from "lucide-react";

import type {
  CameraZone,
  CameraZonesResponse,
  ZoneViewMode,
} from "@/lib/client-services/camera-zones.service";

type MainCameraZoneDetailsProps = {
  selectedCameraName: string | null;
  selectedCameraId: string;
  viewMode: ZoneViewMode;
  visibleZones: CameraZone[];
  zoneCount: number;
  zoneData: CameraZonesResponse | null;
  zonesLoading: boolean;
  zonesError: string | null;
  allZonesSelected: boolean;
  selectedZoneIds: string[];
  onToggleZone: (zoneId: string) => void;
  onToggleSelectAll: () => void;
};

function formatBBox(
  zone: CameraZone,
  frame: CameraZonesResponse["frame"] | null | undefined,
) {
  const src = frame?.width && frame?.height ? zone.bbox_px : zone.bbox_norm;
  if (!src) return "N/A";

  return Object.entries(src)
    .map(([key, value]) => `${key}: ${value ?? "N/A"}`)
    .join(", ");
}

export function MainCameraZoneDetails({
  selectedCameraName,
  selectedCameraId,
  viewMode,
  visibleZones,
  zoneCount,
  zoneData,
  zonesLoading,
  zonesError,
  allZonesSelected,
  selectedZoneIds,
  onToggleZone,
  onToggleSelectAll,
}: MainCameraZoneDetailsProps) {
  return (
    <section className="min-h-0 overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,250,252,0.92)_100%)] shadow-[0_20px_60px_-40px_rgba(15,23,42,0.25)]">
      <div className="flex h-full min-h-0 flex-col p-4 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">Zone Details</p>
            <p className="mt-1 text-sm text-slate-500">
              Assigned zones and metadata now sit directly under the live stream for quicker
              inspection.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-slate-900 px-3 py-1.5 text-white">
              {selectedCameraName ?? "No camera selected"}
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1.5 text-sky-700">
              {viewMode === "with_zones" ? "Overlay enabled" : "Overlay hidden"}
            </span>
            <span className="rounded-full bg-slate-200 px-3 py-1.5 text-slate-700">
              {visibleZones.length} visible
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="rounded-[24px] border border-slate-200 bg-slate-900 px-4 py-3 text-white shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
              Zone Visibility
            </p>
            <p className="mt-1 text-sm font-semibold">
              {viewMode === "with_zones"
                ? `${visibleZones.length} of ${zoneCount} assigned zone${zoneCount === 1 ? "" : "s"} on screen`
                : "Zone overlay hidden"}
            </p>
          </div>

          <div className="rounded-full bg-slate-200 px-4 py-2 text-xs font-medium text-slate-700">
            {zoneCount > 0
              ? `${zoneCount} zone${zoneCount === 1 ? "" : "s"} available`
              : "No assigned zones"}
          </div>
        </div>

        {viewMode === "with_zones" ? (
          <div className="mt-5 rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
            {zoneCount > 0 ? (
              <>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Zone Configuration
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Select the zones that should appear over the video.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleSelectAll}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    {allZonesSelected ? (
                      <CheckSquare className="size-4 text-emerald-300" />
                    ) : (
                      <Square className="size-4 text-white/75" />
                    )}
                    {allZonesSelected ? "Clear visible zones" : "Show all zones"}
                  </button>
                </div>

                <div className="mt-4 max-h-40 overflow-y-auto pr-1">
                  <div className="flex flex-wrap gap-2">
                    {zoneData?.zones.map((zone) => {
                      const checked = selectedZoneIds.includes(zone.zone_id);
                      return (
                        <button
                          key={zone.zone_id}
                          type="button"
                          onClick={() => onToggleZone(zone.zone_id)}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                            checked
                              ? "border-sky-300 bg-sky-50 text-sky-900"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                          }`}
                        >
                          {checked ? (
                            <CheckSquare className="size-4 text-sky-600" />
                          ) : (
                            <Square className="size-4 text-slate-400" />
                          )}
                          <span>{zone.name || zone.zone_id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : !zonesLoading && !zonesError ? (
              <p className="text-sm text-slate-500">No zones assigned to this camera.</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5">
          {zonesLoading ? <p className="text-sm text-slate-500">Loading zones...</p> : null}

          {zonesError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4" />
                <span>{zonesError}</span>
              </div>
            </div>
          ) : null}

          {!zonesLoading && !zonesError && zoneCount === 0 && viewMode !== "with_zones" ? (
            <p className="text-sm text-slate-500">No zones assigned to this camera.</p>
          ) : null}

          {!zonesLoading && !zonesError && viewMode === "without_zones" ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Zone overlays are currently hidden. Use the checkbox in the video configuration panel
              to enable them.
            </div>
          ) : null}

          {!zonesLoading &&
          !zonesError &&
          viewMode === "with_zones" &&
          zoneCount > 0 &&
          visibleZones.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No zones are currently selected. Choose one or more zones from the configuration
              section under the video.
            </div>
          ) : null}

          {!zonesLoading && !zonesError && viewMode === "with_zones" && visibleZones.length > 0 ? (
            <div className="max-h-[28rem] overflow-y-auto pr-1">
              <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {visibleZones.map((zone) => (
                  <article
                    key={zone.zone_id}
                    className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {zone.name || "Unnamed Zone"}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          zone.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {zone.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <dl className="mt-4 space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between gap-3">
                        <dt className="font-medium text-slate-500">Type</dt>
                        <dd className="text-right">{zone.zone_type ?? "N/A"}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="font-medium text-slate-500">Dwell Threshold</dt>
                        <dd className="text-right">{zone.dwell_threshold_sec ?? "N/A"} sec</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="font-medium text-slate-500">Rule Count</dt>
                        <dd className="text-right">{zone.rule_count ?? 0}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500">Zone ID</dt>
                        <dd className="mt-1 break-all">{zone.zone_id}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500">Camera ID</dt>
                        <dd className="mt-1 break-all">{zone.camera_id ?? selectedCameraId}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500">
                          BBox ({zoneData?.frame?.width && zoneData?.frame?.height ? "px" : "norm"})
                        </dt>
                        <dd className="mt-1 break-words">{formatBBox(zone, zoneData?.frame)}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
