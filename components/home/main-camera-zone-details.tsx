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
    <section className="min-h-0 overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.03] sm:rounded-[28px]">
      <div className="flex h-full min-h-0 flex-col p-4 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-lg font-semibold text-white">Zone Details</p>
            <p className="mt-1 text-sm text-white/40">
              Assigned zones and metadata now sit directly under the live stream for quicker
              inspection.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="max-w-full truncate rounded-full bg-white/[0.08] px-3 py-1.5 text-white/80">
              {selectedCameraName ?? "No camera selected"}
            </span>
            <span className="rounded-full bg-[#18ffbe]/10 px-3 py-1.5 text-[#18ffbe]">
              {viewMode === "with_zones" ? "Overlay enabled" : "Overlay hidden"}
            </span>
            <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-white/50">
              {visibleZones.length} visible
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.06] px-4 py-3 text-white sm:rounded-[24px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
              Zone Visibility
            </p>
            <p className="mt-1 text-sm font-semibold text-white/80">
              {viewMode === "with_zones"
                ? `${visibleZones.length} of ${zoneCount} assigned zone${zoneCount === 1 ? "" : "s"} on screen`
                : "Zone overlay hidden"}
            </p>
          </div>

          <div className="w-fit max-w-full rounded-full bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/40">
            {zoneCount > 0
              ? `${zoneCount} zone${zoneCount === 1 ? "" : "s"} available`
              : "No assigned zones"}
          </div>
        </div>

        {viewMode === "with_zones" ? (
          <div className="mt-5 rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-4 sm:rounded-[24px]">
            {zoneCount > 0 ? (
              <>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                      Zone Configuration
                    </p>
                    <p className="mt-1 text-sm text-white/50">
                      Select the zones that should appear over the video.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleSelectAll}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/[0.10] hover:text-white sm:w-fit"
                  >
                    {allZonesSelected ? (
                      <CheckSquare className="size-4 text-[#18ffbe]" />
                    ) : (
                      <Square className="size-4 text-white/40" />
                    )}
                    {allZonesSelected ? "Clear visible zones" : "Show all zones"}
                  </button>
                </div>

                <div className="ux-scrollbar mt-4 max-h-48 overflow-y-auto pr-1">
                  <div className="flex flex-wrap gap-2">
                    {zoneData?.zones.map((zone) => {
                      const checked = selectedZoneIds.includes(zone.zone_id);
                      return (
                        <button
                          key={zone.zone_id}
                          type="button"
                          onClick={() => onToggleZone(zone.zone_id)}
                          className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-2 text-left text-sm font-medium transition ${
                            checked
                              ? "border-[#18ffbe]/40 bg-[#18ffbe]/10 text-[#18ffbe]"
                              : "border-white/10 bg-white/[0.04] text-white/50 hover:border-white/20 hover:text-white/80"
                          }`}
                        >
                          {checked ? (
                            <CheckSquare className="size-4 text-[#18ffbe]" />
                          ) : (
                            <Square className="size-4 text-white/30" />
                          )}
                          <span className="truncate">{zone.name || zone.zone_id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : !zonesLoading && !zonesError ? (
              <p className="text-sm text-white/40">No zones assigned to this camera.</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5">
          {zonesLoading ? <p className="text-sm text-white/40">Loading zones...</p> : null}

          {zonesError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4" />
                <span>{zonesError}</span>
              </div>
            </div>
          ) : null}

          {!zonesLoading && !zonesError && zoneCount === 0 && viewMode !== "with_zones" ? (
            <p className="text-sm text-white/40">No zones assigned to this camera.</p>
          ) : null}

          {!zonesLoading && !zonesError && viewMode === "without_zones" ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-white/40">
              Zone overlays are currently hidden. Use the checkbox in the video configuration panel
              to enable them.
            </div>
          ) : null}

          {!zonesLoading &&
          !zonesError &&
          viewMode === "with_zones" &&
          zoneCount > 0 &&
          visibleZones.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-white/40">
              No zones are currently selected. Choose one or more zones from the configuration
              section under the video.
            </div>
          ) : null}

          {!zonesLoading && !zonesError && viewMode === "with_zones" && visibleZones.length > 0 ? (
            <div className="ux-scrollbar max-h-[28rem] overflow-y-auto pr-1">
              <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {visibleZones.map((zone) => (
                  <article
                    key={zone.zone_id}
                    className="rounded-[20px] border border-white/[0.08] bg-white/[0.04] p-4 sm:rounded-[24px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-white/90">
                        {zone.name || "Unnamed Zone"}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          zone.active
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-white/[0.06] text-white/40"
                        }`}
                      >
                        {zone.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <dl className="mt-4 space-y-2 text-sm text-white/50">
                      <div className="flex justify-between gap-3">
                        <dt className="font-medium text-white/30">Type</dt>
                        <dd className="text-right">{zone.zone_type ?? "N/A"}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="font-medium text-white/30">Dwell Threshold</dt>
                        <dd className="text-right">{zone.dwell_threshold_sec ?? "N/A"} sec</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="font-medium text-white/30">Rule Count</dt>
                        <dd className="text-right">{zone.rule_count ?? 0}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-white/30">Zone ID</dt>
                        <dd className="mt-1 break-all">{zone.zone_id}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-white/30">Camera ID</dt>
                        <dd className="mt-1 break-all">{zone.camera_id ?? selectedCameraId}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-white/30">
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
