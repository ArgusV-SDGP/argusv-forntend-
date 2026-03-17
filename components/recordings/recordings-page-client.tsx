"use client";

import React from "react";
import {
  Calendar,
  Camera,
  Clock3,
  Download,
  Filter,
  Pause,
  Play,
  ShieldAlert,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

type ThreatLevel = "LOW" | "MEDIUM" | "HIGH";

type CameraItem = {
  camera_id: string;
  name: string;
  zone: string;
};

type Marker = {
  id: string;
  timestamp: string;
  object_class: string;
  threat_level: ThreatLevel;
  is_threat: boolean;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
};

type TimelineWindow = {
  start: Date;
  end: Date;
};

type TimelineResponse = {
  markers: Marker[];
  window: TimelineWindow;
};

const DEMO_CAMERAS: CameraItem[] = [
  { camera_id: "cam-yard-01", name: "Perimeter North", zone: "Yard A" },
  { camera_id: "cam-gate-02", name: "Main Gate", zone: "Entry Control" },
  { camera_id: "cam-warehouse-03", name: "Warehouse East", zone: "Storage" },
];

const DEMO_MARKERS: Record<string, Marker[]> = {
  "cam-yard-01": [
    createMarker("yard-1", "01:22:00", "Person", "LOW", false, 0.18, 0.3, 0.3, 0.72),
    createMarker("yard-2", "05:47:00", "Vehicle", "MEDIUM", true, 0.56, 0.42, 0.82, 0.77),
    createMarker("yard-3", "08:15:00", "Forklift", "LOW", false, 0.2, 0.44, 0.42, 0.79),
    createMarker("yard-4", "11:05:00", "Person", "HIGH", true, 0.63, 0.21, 0.76, 0.61),
    createMarker("yard-5", "14:32:00", "Truck", "MEDIUM", true, 0.15, 0.38, 0.46, 0.82),
    createMarker("yard-6", "18:18:00", "Person", "HIGH", true, 0.71, 0.28, 0.84, 0.62),
    createMarker("yard-7", "21:06:00", "Vehicle", "MEDIUM", true, 0.35, 0.45, 0.68, 0.84),
  ],
  "cam-gate-02": [
    createMarker("gate-1", "00:40:00", "Truck", "LOW", false, 0.16, 0.34, 0.45, 0.82),
    createMarker("gate-2", "04:12:00", "Person", "MEDIUM", true, 0.58, 0.22, 0.69, 0.62),
    createMarker("gate-3", "07:26:00", "Vehicle", "LOW", false, 0.28, 0.46, 0.58, 0.8),
    createMarker("gate-4", "12:08:00", "Person", "HIGH", true, 0.7, 0.16, 0.81, 0.57),
    createMarker("gate-5", "16:41:00", "Truck", "MEDIUM", true, 0.12, 0.39, 0.48, 0.85),
    createMarker("gate-6", "20:14:00", "Person", "HIGH", true, 0.49, 0.18, 0.62, 0.61),
  ],
  "cam-warehouse-03": [
    createMarker("wh-1", "02:20:00", "Person", "LOW", false, 0.23, 0.2, 0.33, 0.6),
    createMarker("wh-2", "06:55:00", "Forklift", "MEDIUM", true, 0.44, 0.38, 0.7, 0.84),
    createMarker("wh-3", "09:11:00", "Pallet", "LOW", false, 0.12, 0.48, 0.37, 0.86),
    createMarker("wh-4", "13:19:00", "Person", "HIGH", true, 0.66, 0.2, 0.78, 0.6),
    createMarker("wh-5", "17:03:00", "Forklift", "MEDIUM", true, 0.24, 0.31, 0.55, 0.81),
    createMarker("wh-6", "22:07:00", "Person", "HIGH", true, 0.58, 0.23, 0.69, 0.63),
  ],
};

const DEMO_INCIDENTS: Record<
  string,
  { camera_id: string; focusTime: string; durationMinutes: number }
> = {
  "INC-2048": {
    camera_id: "cam-gate-02",
    focusTime: "12:08:00",
    durationMinutes: 24,
  },
  "INC-9182": {
    camera_id: "cam-yard-01",
    focusTime: "18:18:00",
    durationMinutes: 18,
  },
};

const PLAYBACK_WINDOW_SECONDS = 360;

function createMarker(
  id: string,
  time: string,
  objectClass: string,
  threatLevel: ThreatLevel,
  isThreat: boolean,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): Marker {
  return {
    id,
    timestamp: time,
    object_class: objectClass,
    threat_level: threatLevel,
    is_threat: isThreat,
    bbox: { x1, y1, x2, y2 },
  };
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0] ?? "";
}

function addDateToMarker(date: string, marker: Marker): Marker {
  return {
    ...marker,
    timestamp: `${date}T${marker.timestamp}Z`,
  };
}

async function getCameras() {
  return DEMO_CAMERAS;
}

async function getDailyTimeline(
  cameraId: string,
  date: string,
  threatsOnly: boolean,
): Promise<TimelineResponse> {
  const start = new Date(`${date}T00:00:00Z`);
  const end = new Date(`${date}T23:59:59Z`);
  const markers = (DEMO_MARKERS[cameraId] ?? [])
    .map((marker) => addDateToMarker(date, marker))
    .filter((marker) => (threatsOnly ? marker.is_threat : true));

  return { markers, window: { start, end } };
}

async function getIncidentReplay(
  incidentId: string,
  date: string,
): Promise<TimelineResponse & { camera_id: string; incidentId: string }> {
  const incident = DEMO_INCIDENTS[incidentId] ?? DEMO_INCIDENTS["INC-2048"];
  const focus = new Date(`${date}T${incident.focusTime}Z`);
  const start = new Date(focus.getTime() - incident.durationMinutes * 60_000);
  const end = new Date(focus.getTime() + incident.durationMinutes * 60_000);
  const markers = (DEMO_MARKERS[incident.camera_id] ?? [])
    .map((marker) => addDateToMarker(date, marker))
    .filter((marker) => {
      const time = new Date(marker.timestamp).getTime();
      return time >= start.getTime() && time <= end.getTime();
    });

  return { camera_id: incident.camera_id, incidentId, markers, window: { start, end } };
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

function formatShortTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

function getThreatClasses(level: ThreatLevel) {
  if (level === "HIGH") {
    return "bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.35)] h-full z-20";
  }

  if (level === "MEDIUM") {
    return "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.25)] h-3/4 z-10";
  }

  return "bg-sky-400 h-1/2";
}

function getThreatBadgeClasses(level: ThreatLevel) {
  if (level === "HIGH") {
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  }

  if (level === "MEDIUM") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
}

export function RecordingsPageClient() {
  const searchParams = useSearchParams();
  const incidentId = searchParams.get("incident_id");

  const [cameras, setCameras] = React.useState<CameraItem[]>([]);
  const [selectedCamera, setSelectedCamera] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState(getTodayDate);
  const [eventsOnly, setEventsOnly] = React.useState(false);
  const [markers, setMarkers] = React.useState<Marker[]>([]);
  const [windowRange, setWindowRange] = React.useState<TimelineWindow | null>(null);
  const [status, setStatus] = React.useState("Loading demo recordings...");
  const [isIncidentReplay, setIsIncidentReplay] = React.useState(false);
  const [playbackSeconds, setPlaybackSeconds] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [isReady, setIsReady] = React.useState(false);

  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const lastFrameRef = React.useRef<number | null>(null);

  const currentCamera = cameras.find((camera) => camera.camera_id === selectedCamera) ?? null;

  const progress = playbackSeconds / PLAYBACK_WINDOW_SECONDS;

  const currentActualTime = React.useMemo(() => {
    if (!windowRange) {
      return null;
    }

    const span = windowRange.end.getTime() - windowRange.start.getTime();
    return new Date(windowRange.start.getTime() + span * progress);
  }, [progress, windowRange]);

  const activeMarkers = React.useMemo(() => {
    if (!currentActualTime) {
      return [];
    }

    const current = currentActualTime.getTime();

    return markers.filter((marker) => {
      const markerTime = new Date(marker.timestamp).getTime();
      return Math.abs(markerTime - current) <= 90_000;
    });
  }, [currentActualTime, markers]);

  const loadTimeline = React.useCallback(async () => {
    if (!selectedCamera) {
      return;
    }

    setStatus("Loading timeline...");
    const timeline = await getDailyTimeline(selectedCamera, selectedDate, eventsOnly);
    setMarkers(timeline.markers);
    setWindowRange(timeline.window);
    setPlaybackSeconds(0);
    setIsIncidentReplay(false);
    setIsReady(true);
    setStatus(`Playback ready for ${currentCamera?.name ?? "camera"}`);
  }, [currentCamera?.name, eventsOnly, selectedCamera, selectedDate]);

  React.useEffect(() => {
    let cancelled = false;

    async function init() {
      const cameraItems = await getCameras();
      if (cancelled) {
        return;
      }

      setCameras(cameraItems);
      const fallbackCamera = cameraItems[0]?.camera_id ?? "";

      if (incidentId) {
        const incidentReplay = await getIncidentReplay(incidentId, selectedDate);
        if (cancelled) {
          return;
        }

        setSelectedCamera(incidentReplay.camera_id);
        setMarkers(incidentReplay.markers);
        setWindowRange(incidentReplay.window);
        setPlaybackSeconds(0);
        setIsIncidentReplay(true);
        setIsReady(true);
        setStatus(`Incident replay ${incidentReplay.incidentId}`);
        return;
      }

      setSelectedCamera(fallbackCamera);
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [incidentId, selectedDate]);

  React.useEffect(() => {
    if (!selectedCamera || incidentId) {
      return;
    }

    void loadTimeline();
  }, [incidentId, loadTimeline, selectedCamera]);

  React.useEffect(() => {
    if (!isPlaying || !isReady) {
      lastFrameRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const step = (timestamp: number) => {
      const last = lastFrameRef.current ?? timestamp;
      const elapsed = (timestamp - last) / 1000;
      lastFrameRef.current = timestamp;

      setPlaybackSeconds((current) => {
        const next = current + elapsed * 12;
        return next >= PLAYBACK_WINDOW_SECONDS ? 0 : next;
      });

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, isReady]);

  function handleTimelineSeek(event: React.MouseEvent<HTMLDivElement>) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const pct = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    setPlaybackSeconds(pct * PLAYBACK_WINDOW_SECONDS);
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-600">
                  NVR Playback
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Recordings Console
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Demo implementation using hard-coded camera, timeline, and incident replay data.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                <label className="flex min-w-[220px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm">
                  <Camera className="size-4 text-sky-600" />
                  <select
                    value={selectedCamera}
                    onChange={(event) => setSelectedCamera(event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  >
                    {cameras.map((camera) => (
                      <option
                        key={camera.camera_id}
                        value={camera.camera_id}
                        className="bg-white text-slate-900"
                      >
                        {camera.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm">
                  <Calendar className="size-4 text-sky-600" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="bg-transparent text-slate-900 outline-none"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setEventsOnly((current) => !current)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    eventsOnly
                      ? "border-sky-600 bg-sky-600 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-700 shadow-sm hover:bg-slate-100"
                  }`}
                >
                  <Filter className="size-4" />
                  Events Only
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <Download className="size-4" />
                  Download Segment
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-5 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col gap-6">
              <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-950 shadow-[0_14px_36px_rgba(15,23,42,0.16)]">
                <div className="aspect-video">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.2),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(244,63,94,0.22),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.4),rgba(2,6,23,0.95))]" />
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.15),transparent)] animate-[pulse_8s_ease-in-out_infinite]" />

                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                    <span
                      className={`size-2 rounded-full ${
                        isIncidentReplay
                          ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.55)]"
                          : "bg-emerald-500"
                      }`}
                    />
                    <span>{status}</span>
                  </div>

                  <div className="absolute right-4 top-4 rounded-full border border-sky-200 bg-sky-50/95 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 shadow-sm">
                    {currentCamera?.zone ?? "Demo Zone"}
                  </div>

                  <div className="absolute inset-0">
                    {activeMarkers.map((marker) => {
                      const width = (marker.bbox.x2 - marker.bbox.x1) * 100;
                      const height = (marker.bbox.y2 - marker.bbox.y1) * 100;
                      const threatStyle = marker.is_threat
                        ? "border-rose-400 bg-rose-500/10"
                        : "border-sky-300 bg-sky-500/10";

                      return (
                        <div
                          key={marker.id}
                          className={`absolute rounded-md border-2 ${threatStyle} shadow-[0_0_0_1px_rgba(255,255,255,0.08)]`}
                          style={{
                            left: `${marker.bbox.x1 * 100}%`,
                            top: `${marker.bbox.y1 * 100}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                          }}
                        >
                          <div
                            className={`absolute -top-7 left-0 rounded-md px-2 py-1 text-[11px] font-semibold text-white ${
                              marker.is_threat ? "bg-rose-500" : "bg-sky-600"
                            }`}
                          >
                            {marker.object_class} | {marker.threat_level}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 border-t border-slate-200/80 bg-white/92 px-4 py-3 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPlaying((current) => !current)}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-white transition hover:bg-slate-800"
                      >
                        {isPlaying ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
                      </button>

                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {currentCamera?.name ?? "Select a camera"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {currentActualTime ? formatTime(currentActualTime) : "00:00:00"} UTC
                        </p>
                      </div>
                    </div>

                    <div className="hidden items-center gap-3 text-right sm:flex">
                      <ShieldAlert className="size-4 text-amber-500" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Active detections
                        </p>
                        <p className="text-sm font-semibold text-slate-900">{activeMarkers.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4 text-xs font-medium text-slate-500">
                  <span>{windowRange ? formatShortTime(windowRange.start) : "00:00"}</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {currentActualTime ? formatTime(currentActualTime) : "Playhead Time"}
                  </span>
                  <span>{windowRange ? formatShortTime(windowRange.end) : "23:59"}</span>
                </div>

                <div
                  ref={trackRef}
                  onClick={handleTimelineSeek}
                  className="relative mt-4 h-16 cursor-crosshair overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:4.166%_100%]" />

                  {markers.map((marker) => {
                    if (!windowRange) {
                      return null;
                    }

                    const span = windowRange.end.getTime() - windowRange.start.getTime();
                    const position =
                      ((new Date(marker.timestamp).getTime() - windowRange.start.getTime()) / span) * 100;

                    return (
                      <div
                        key={marker.id}
                        title={`${formatTime(new Date(marker.timestamp))} - ${marker.object_class}`}
                        className={`absolute bottom-0 w-0.5 -translate-x-1/2 rounded-t-full ${getThreatClasses(
                          marker.threat_level,
                        )}`}
                        style={{ left: `${position}%` }}
                      />
                    );
                  })}

                  <div
                    className="absolute inset-y-0 z-30 w-0.5 -translate-x-1/2 bg-slate-900 shadow-[0_0_10px_rgba(15,23,42,0.22)]"
                    style={{ left: `${progress * 100}%` }}
                  >
                    <div className="absolute -top-1 left-1/2 size-0 -translate-x-1/2 border-x-[7px] border-t-[10px] border-x-transparent border-t-slate-900" />
                  </div>
                </div>
              </div>
            </div>

            <aside className="flex flex-col gap-4">
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Session
                </p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">Playback Mode</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {isIncidentReplay ? "Incident replay focus window" : "Full-day recording scan"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Markers</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{markers.length}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Threats</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {markers.filter((marker) => marker.is_threat).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock3 className="size-4 text-sky-600" />
                  <p className="text-sm font-semibold text-slate-900">Recent Events</p>
                </div>

                <div className="mt-4 space-y-3">
                  {markers.slice(0, 5).map((marker) => (
                    <div
                      key={marker.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{marker.object_class}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatTime(new Date(marker.timestamp))}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getThreatBadgeClasses(
                            marker.threat_level,
                          )}`}
                        >
                          {marker.threat_level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
