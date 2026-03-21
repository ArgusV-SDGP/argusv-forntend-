"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckSquare,
  Play,
  Square,
} from "lucide-react";

import {
  getAssignedCameraZones,
  type CameraZonesResponse,
  type ZoneViewMode,
} from "@/lib/client-services/camera-zones.service";
import type { CameraGridItem } from "@/lib/mappers/cam.mappers";
import { LiveCameraPlayer, type BboxDetection } from "./live-camera-player";

type MainCameraGridClientProps = {
  cameras: CameraGridItem[];
};

const WS_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:8000")
  .replace(/^http/, "ws") + "/ws/alerts";

const BBOX_TTL_MS = 3000;

export function MainCameraGridClient({ cameras }: MainCameraGridClientProps) {
  const onlineCameras = React.useMemo(
    () => cameras.filter((camera) => camera.status.toLowerCase() === "online"),
    [cameras],
  );
  const initialCameraId = onlineCameras[0]?.cameraId ?? cameras[0]?.cameraId ?? "";

  const [selectedCameraId, setSelectedCameraId] = useState<string>(initialCameraId);
  const [viewMode, setViewMode] = useState<ZoneViewMode>("without_zones");
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);
  const [zoneData, setZoneData] = useState<CameraZonesResponse | null>(null);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zonesError, setZonesError] = useState<string | null>(null);

  const [bboxMap, setBboxMap] = useState<Record<string, BboxDetection[]>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = (evt) => {
        if (cancelled) return;
        try {
          const msg = JSON.parse(evt.data as string);
          if (msg.type !== "fast_alert") return;

          const bbox = msg.bbox as { x1: number; y1: number; x2: number; y2: number } | undefined;
          if (!bbox || !msg.camera_id) return;

          const det: BboxDetection = {
            event_id:    msg.event_id ?? String(Math.random()),
            object_class: msg.object_class ?? "object",
            confidence:  msg.confidence ?? 0,
            threat_level: msg.threat_level ?? null,
            x1: bbox.x1,
            y1: bbox.y1,
            x2: bbox.x2,
            y2: bbox.y2,
            frame_w: msg.frame_w ?? 640,
            frame_h: msg.frame_h ?? 480,
            ts: Date.now(),
          };

          setBboxMap((prev) => {
            const now = Date.now();
            const existing = (prev[msg.camera_id] ?? []).filter(
              (d) => now - d.ts < BBOX_TTL_MS && d.event_id !== det.event_id
            );
            return { ...prev, [msg.camera_id]: [...existing, det] };
          });
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        if (!cancelled) reconnectRef.current = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
    }

    connect();

    // Periodic cleanup of expired bboxes
    const cleanup = setInterval(() => {
      const now = Date.now();
      setBboxMap((prev) => {
        const next: Record<string, BboxDetection[]> = {};
        for (const [cam, dets] of Object.entries(prev)) {
          const live = dets.filter((d) => now - d.ts < BBOX_TTL_MS);
          if (live.length > 0) next[cam] = live;
        }
        return next;
      });
    }, 500);

    return () => {
      cancelled = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      clearInterval(cleanup);
    };
  }, []);

  useEffect(() => {
    const preferredCameraId = onlineCameras[0]?.cameraId ?? cameras[0]?.cameraId ?? "";
    const selectedExists = cameras.some((camera) => camera.cameraId === selectedCameraId);

    if (!preferredCameraId) {
      if (selectedCameraId) {
        setSelectedCameraId("");
      }
      return;
    }

    if (!selectedCameraId || !selectedExists) {
      setSelectedCameraId(preferredCameraId);
    }
  }, [cameras, onlineCameras, selectedCameraId]);

  useEffect(() => {
    if (!selectedCameraId) return;

    let cancelled = false;

    async function loadZones() {
      setZonesLoading(true);
      setZonesError(null);
      setZoneData(null);

      try {
        const response = await getAssignedCameraZones(selectedCameraId);
        if (cancelled) return;

        setZoneData(response);

        const ids =
          response.available_zone_ids?.length
            ? response.available_zone_ids
            : response.zones?.map((z) => z.zone_id) ?? [];
        setSelectedZoneIds(ids);
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Failed to load camera zones";
        setZonesError(message);
        setZoneData(null);
        setSelectedZoneIds([]);
      } finally {
        if (!cancelled) setZonesLoading(false);
      }
    }

    loadZones();

    return () => {
      cancelled = true;
    };
  }, [selectedCameraId]);

  const selectedCamera = React.useMemo(
    () => cameras.find((camera) => camera.cameraId === selectedCameraId) ?? null,
    [cameras, selectedCameraId],
  );

  const availableZoneIds = React.useMemo(() => {
    if (!zoneData) return [];
    if (zoneData.available_zone_ids?.length) return zoneData.available_zone_ids;
    return zoneData.zones?.map((z) => z.zone_id) ?? [];
  }, [zoneData]);

  const allZonesSelected = availableZoneIds.length > 0 && selectedZoneIds.length === availableZoneIds.length;
  const visibleZones = React.useMemo(() => {
    if (!zoneData?.zones) return [];
    if (viewMode !== "with_zones") return [];
    if (selectedZoneIds.length === 0) return [];
    const selectedZonesSet = new Set(selectedZoneIds);
    return zoneData.zones.filter((zone) => selectedZonesSet.has(zone.zone_id));
  }, [selectedZoneIds, viewMode, zoneData?.zones]);

  function toggleZone(zoneId: string) {
    setSelectedZoneIds((prev) => (prev.includes(zoneId) ? prev.filter((id) => id !== zoneId) : [...prev, zoneId]));
  }

  function toggleSelectAll() {
    if (allZonesSelected) {
      setSelectedZoneIds([]);
      return;
    }
    setSelectedZoneIds(availableZoneIds);
  }
  function formatBBox(zone: CameraZonesResponse["zones"][number]) {
    const src = zoneData?.frame?.width && zoneData?.frame?.height ? zone.bbox_px : zone.bbox_norm;
    if (!src) return "N/A";

    return Object.entries(src)
      .map(([key, value]) => `${key}: ${value ?? "N/A"}`)
      .join(", ");
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px] lg:h-full lg:min-h-[600px]">
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Camera
              <select
                value={selectedCameraId}
                onChange={(event) => {
                  setSelectedCameraId(event.target.value);
                  setSelectedZoneIds([]);
                  setZoneData(null);
                }}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                {cameras.map((camera) => (
                  <option key={camera.cameraId} value={camera.cameraId}>
                    {camera.name} ({camera.status})
                  </option>
                ))}
              </select>
            </label>

            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Overlay Mode
              <div className="mt-1 inline-flex rounded-md border border-slate-300 bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("without_zones");
                  }}
                  className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                    viewMode === "without_zones"
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Without Zones
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("with_zones")}
                  className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                    viewMode === "with_zones"
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  With Zones
                </button>
              </div>
            </div>
          </div>

          {viewMode === "with_zones" ? (
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              {zoneData?.zone_count && zoneData.zone_count > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-sm font-medium text-slate-700"
                  >
                    {allZonesSelected ? (
                      <CheckSquare className="size-4 text-emerald-600" />
                    ) : (
                      <Square className="size-4 text-slate-500" />
                    )}
                    Select All
                  </button>
                  <div className="mt-2 grid max-h-36 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                    {zoneData.zones.map((zone) => {
                      const checked = selectedZoneIds.includes(zone.zone_id);
                      return (
                        <label
                          key={zone.zone_id}
                          className="flex items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleZone(zone.zone_id)}
                            className="size-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                          />
                          <span className="truncate">{zone.name || zone.zone_id}</span>
                        </label>
                      );
                    })}
                  </div>
                </>
              ) : !zonesLoading && !zonesError ? (
                <p className="text-sm text-slate-500">No zones assigned to this camera.</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="relative min-h-[320px] bg-slate-900">
          {selectedCamera ? (
            selectedCamera.status.toLowerCase() === "online" ? (
              <LiveCameraPlayer
                key={`${selectedCamera.cameraId}:${selectedCamera.streamPath}`}
                cameraId={selectedCamera.cameraId}
                name={selectedCamera.name}
                streamPath={selectedCamera.streamPath}
                detections={bboxMap[selectedCamera.cameraId] ?? []}
                frameSize={zoneData?.frame ?? null}
                zones={visibleZones}
              />
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center text-center text-white">
                <div>
                  <p className="text-sm font-semibold">{selectedCamera.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    Stream unavailable
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-slate-300">
              No camera selected.
            </div>
          )}

          <div className="absolute left-3 top-3 rounded bg-black/70 px-2.5 py-1.5 text-xs text-white backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <Play className="size-3 fill-current text-emerald-400" />
              <span>{selectedCamera?.name ?? "Live camera"}</span>
            </div>
          </div>
        </div>
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">Zone Details</p>
          <p className="mt-1 text-xs text-slate-500">
            {viewMode === "with_zones"
              ? "Showing selected zones from the backend response."
              : "Enable \"With Zones\" to inspect overlays and metadata."}
          </p>
        </div>

        <div className="max-h-[620px] space-y-3 overflow-y-auto p-4">
          {zonesLoading ? (
            <p className="text-sm text-slate-500">Loading zones...</p>
          ) : null}

          {zonesError ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4" />
                <span>{zonesError}</span>
              </div>
            </div>
          ) : null}

          {!zonesLoading && !zonesError && zoneData?.zone_count === 0 ? (
            <p className="text-sm text-slate-500">No zones assigned to this camera.</p>
          ) : null}

          {!zonesLoading && !zonesError && viewMode === "without_zones" ? (
            <p className="text-sm text-slate-500">Zone overlays are currently hidden.</p>
          ) : null}

          {!zonesLoading && !zonesError && viewMode === "with_zones" && visibleZones.map((zone) => (
            <article key={zone.zone_id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-slate-800">{zone.name || "Unnamed Zone"}</p>
                <span
                  className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                    zone.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {zone.active ? "Active" : "Inactive"}
                </span>
              </div>
              <dl className="mt-2 space-y-1 text-xs text-slate-600">
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-slate-500">Type</dt>
                  <dd>{zone.zone_type ?? "N/A"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-slate-500">Dwell Threshold</dt>
                  <dd>{zone.dwell_threshold_sec ?? "N/A"} sec</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-slate-500">Rule Count</dt>
                  <dd>{zone.rule_count ?? 0}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Zone ID</dt>
                  <dd className="break-all">{zone.zone_id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Camera ID</dt>
                  <dd className="break-all">{zone.camera_id ?? selectedCameraId}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">
                    BBox ({zoneData?.frame?.width && zoneData?.frame?.height ? "px" : "norm"})
                  </dt>
                  <dd className="break-words">{formatBBox(zone)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}
