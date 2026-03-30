"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Wifi } from "lucide-react";

import {
  getAssignedCameraZones,
  type CameraZonesResponse,
  type ZoneViewMode,
} from "@/lib/client-services/camera-zones.service";
import type { CameraGridItem } from "@/lib/mappers/cam.mappers";
import { LiveCameraPlayer, type BboxDetection } from "./live-camera-player";
import { MainCameraZoneDetails } from "./main-camera-zone-details";

type MainCameraGridClientProps = {
  cameras: CameraGridItem[];
};

const WS_BASE =
  (process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:8000").replace(
    /^http/,
    "ws",
  ) + "/ws/alerts";

function getWsUrl() {
  const token = typeof window !== "undefined"
    ? window.localStorage.getItem("argusv_access_token")
    : null;
  return token ? `${WS_BASE}?token=${encodeURIComponent(token)}` : WS_BASE;
}

const BBOX_TTL_MS = 3000;

export function MainCameraGridClient({ cameras }: MainCameraGridClientProps) {
  const onlineCameras = React.useMemo(
    () => cameras.filter((camera) => camera.status.toLowerCase() === "online"),
    [cameras],
  );
  const initialCameraId =
    onlineCameras[0]?.cameraId ?? cameras[0]?.cameraId ?? "";

  const [selectedCameraId, setSelectedCameraId] =
    useState<string>(initialCameraId);
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
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onmessage = (evt) => {
        if (cancelled) return;
        try {
          const msg = JSON.parse(evt.data as string);
          if (msg.type !== "fast_alert") return;

          const bbox = msg.bbox as
            | { x1: number; y1: number; x2: number; y2: number }
            | undefined;
          if (!bbox || !msg.camera_id) return;

          const det: BboxDetection = {
            event_id: msg.event_id ?? String(Math.random()),
            object_class: msg.object_class ?? "object",
            confidence: msg.confidence ?? 0,
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
              (d) => now - d.ts < BBOX_TTL_MS && d.event_id !== det.event_id,
            );
            return { ...prev, [msg.camera_id]: [...existing, det] };
          });
        } catch {
          // ignore malformed message
        }
      };

      ws.onclose = () => {
        if (!cancelled) reconnectRef.current = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
    }

    connect();

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
    const preferredCameraId =
      onlineCameras[0]?.cameraId ?? cameras[0]?.cameraId ?? "";
    const selectedExists = cameras.some(
      (camera) => camera.cameraId === selectedCameraId,
    );

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

        const ids = response.available_zone_ids?.length
          ? response.available_zone_ids
          : (response.zones?.map((zone) => zone.zone_id) ?? []);
        setSelectedZoneIds(ids);
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load camera zones";
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
    () =>
      cameras.find((camera) => camera.cameraId === selectedCameraId) ?? null,
    [cameras, selectedCameraId],
  );

  const availableZoneIds = React.useMemo(() => {
    if (!zoneData) return [];
    if (zoneData.available_zone_ids?.length) return zoneData.available_zone_ids;
    return zoneData.zones?.map((zone) => zone.zone_id) ?? [];
  }, [zoneData]);

  const allZonesSelected =
    availableZoneIds.length > 0 &&
    selectedZoneIds.length === availableZoneIds.length;
  const zoneCount = zoneData?.zone_count ?? 0;

  const visibleZones = React.useMemo(() => {
    if (!zoneData?.zones) return [];
    if (viewMode !== "with_zones") return [];
    if (selectedZoneIds.length === 0) return [];
    const selectedZonesSet = new Set(selectedZoneIds);
    return zoneData.zones.filter((zone) => selectedZonesSet.has(zone.zone_id));
  }, [selectedZoneIds, viewMode, zoneData?.zones]);

  function handleCameraChange(cameraId: string) {
    setSelectedCameraId(cameraId);
    setSelectedZoneIds([]);
    setZoneData(null);
  }

  function toggleZone(zoneId: string) {
    setSelectedZoneIds((prev) =>
      prev.includes(zoneId)
        ? prev.filter((id) => id !== zoneId)
        : [...prev, zoneId],
    );
  }

  function toggleSelectAll() {
    if (allZonesSelected) {
      setSelectedZoneIds([]);
      return;
    }
    setSelectedZoneIds(availableZoneIds);
  }

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
      <section className="mb-6 shrink-0 overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.03] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)] sm:mb-8 sm:rounded-[28px]">
        <div className="relative isolate aspect-[16/9] min-h-[220px] overflow-hidden bg-slate-950 sm:min-h-[320px] md:min-h-[380px] lg:min-h-[420px] lg:max-h-[calc(100vh-22rem)] xl:min-h-[560px] xl:max-h-none">
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

          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-2.5 sm:p-5">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="pointer-events-auto inline-flex min-w-0 max-w-[calc(100%-12.5rem)] self-start items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/78 px-3 py-1.5 text-[11px] font-semibold leading-none text-white shadow-lg backdrop-blur-md sm:max-w-none sm:px-4 sm:py-2 sm:text-xs">
                <Play className="size-2.5 fill-current text-emerald-400 sm:size-3" />
                <span className="truncate">{selectedCamera?.name ?? "Live camera"}</span>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <Wifi className="size-2.5 sm:size-3" />
                  {selectedCamera?.status ?? "unknown"}
                </span>
              </div>
              <div className="pointer-events-auto ml-auto w-auto max-w-[12rem] rounded-2xl border border-white/10 bg-slate-950/70 px-2.5 py-2 text-white shadow-xl backdrop-blur-md sm:max-w-[28rem] sm:px-3">
                <div className="flex flex-wrap items-center justify-end gap-2 sm:flex-row sm:items-center">
                  {/* Camera Selector */}
                  <select
                    value={selectedCameraId}
                    onChange={(event) => handleCameraChange(event.target.value)}
                    className="min-w-0 w-[8.25rem] rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white outline-none transition focus:border-sky-300 focus:bg-white/15 sm:w-auto sm:min-w-[12rem]"
                  >
                    {cameras.map((camera) => (
                      <option
                        key={camera.cameraId}
                        value={camera.cameraId}
                        className="text-slate-900"
                      >
                        {camera.name} ({camera.status})
                      </option>
                    ))}
                  </select>

                  {/* Divider */}
                  <div className="hidden h-5 w-px bg-white/15 sm:block" />

                  {/* Show Zones Toggle */}
                  <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 sm:justify-start sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                    <p className="text-xs font-semibold text-white whitespace-nowrap">
                      Show Zones
                    </p>
                    <input
                      type="checkbox"
                      checked={viewMode === "with_zones"}
                      onChange={(event) =>
                        setViewMode(
                          event.target.checked ? "with_zones" : "without_zones",
                        )
                      }
                      className="size-4 rounded border-white/30 bg-white/10 text-sky-400 focus:ring-2 focus:ring-sky-300"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <MainCameraZoneDetails
        selectedCameraName={selectedCamera?.name ?? null}
        selectedCameraId={selectedCameraId}
        viewMode={viewMode}
        visibleZones={visibleZones}
        zoneCount={zoneCount}
        zoneData={zoneData}
        zonesLoading={zonesLoading}
        zonesError={zonesError}
        allZonesSelected={allZonesSelected}
        selectedZoneIds={selectedZoneIds}
        onToggleZone={toggleZone}
        onToggleSelectAll={toggleSelectAll}
      />
    </div>
  );
}
