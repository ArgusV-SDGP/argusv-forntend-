"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Hls from "hls.js";
import {
  AlertTriangle, Camera, ChevronLeft, ChevronRight, Film,
  Play, Calendar, Zap, Clock, Shield, RefreshCw,
} from "lucide-react";
import { authFetch, API_BASE_URL } from "@/lib/client-services/auth.service";

// ── Types ─────────────────────────────────────────────────────────────────────

type CameraItem = { camera_id: string; name: string; status: string };

type Segment = {
  segment_id: string;
  camera_id: string;
  start_time: string;
  end_time: string;
  duration_sec: number;
  url: string;
  size_bytes: number;
  has_motion: boolean;
  has_detections: boolean;
  detection_count: number;
};

type BBox = { x1: number; y1: number; x2: number; y2: number };

type DetectionMarker = {
  detection_id: string;
  incident_id: string | null;
  timestamp: string;
  object_class: string;
  threat_level: string;
  is_threat: boolean;
  zone_name: string;
  bbox: BBox | null;
  thumbnail_url: string | null;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;
const DENSITY_SLOTS = 96;
const BBOX_VISIBLE_MS = 5000;

// ── Helpers ───────────────────────────────────────────────────────────────────

function dayStart(d: Date): Date {
  const r = new Date(d); r.setHours(0, 0, 0, 0); return r;
}
function dayEnd(d: Date): Date {
  const r = new Date(d); r.setHours(23, 59, 59, 999); return r;
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function formatDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function formatDateLabel(d: Date) {
  const today = dayStart(new Date());
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
function posPercent(ts: Date, start: Date): number {
  return Math.min(100, Math.max(0, ((ts.getTime() - start.getTime()) / DAY_MS) * 100));
}

type ThreatStyle = { bg: string; text: string; badge: string; dot: string; glow: string };
function threatStyle(level: string, isThreat: boolean): ThreatStyle {
  if (isThreat || level === "HIGH")
    return { bg: "bg-red-500", text: "text-red-700", badge: "bg-red-50 text-red-700 border-red-200", dot: "#ef4444", glow: "rgba(239,68,68,0.45)" };
  if (level === "MEDIUM")
    return { bg: "bg-amber-400", text: "text-amber-700", badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "#f59e0b", glow: "rgba(245,158,11,0.45)" };
  return { bg: "bg-slate-400", text: "text-slate-600", badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "#94a3b8", glow: "rgba(148,163,184,0.45)" };
}

function computeSeekOffset(target: Date, segments: Segment[]): number {
  const sorted = [...segments].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  const t = target.getTime();
  let offset = 0;
  for (const seg of sorted) {
    const s = new Date(seg.start_time).getTime();
    const e = new Date(seg.end_time).getTime();
    if (t >= e) { offset += seg.duration_sec; }
    else if (t >= s) { offset += (t - s) / 1000; break; }
    else { break; }
  }
  return offset;
}

// ── Bbox Overlay ──────────────────────────────────────────────────────────────

function ScanLine({ color }: { color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.top = "0%";
    el.style.opacity = "0.8";
    const id = requestAnimationFrame(() => {
      el.style.transition = "top 1.1s linear, opacity 0.3s ease";
      el.style.top = "100%";
      el.style.opacity = "0";
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      ref={ref}
      className="absolute left-0 w-full h-px pointer-events-none"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
    />
  );
}

function BboxOverlay({ marker, onExpire }: { marker: DetectionMarker; onExpire: () => void }) {
  const [fading, setFading] = useState(false);
  const { dot, glow } = threatStyle(marker.threat_level, marker.is_threat);

  useEffect(() => {
    setFading(false);
    const fadeTimer = setTimeout(() => setFading(true), BBOX_VISIBLE_MS - 800);
    const expireTimer = setTimeout(onExpire, BBOX_VISIBLE_MS);
    return () => { clearTimeout(fadeTimer); clearTimeout(expireTimer); };
  }, [marker.detection_id, onExpire]);

  if (!marker.bbox) return null;
  const { x1, y1, x2, y2 } = marker.bbox;
  const CORNER = "13px";

  return (
    <div
      className="absolute inset-0 pointer-events-none transition-opacity duration-700"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <div
        className="absolute"
        style={{ left: `${x1 * 100}%`, top: `${y1 * 100}%`, width: `${(x2 - x1) * 100}%`, height: `${(y2 - y1) * 100}%` }}
      >
        {/* Corner brackets */}
        <div className="absolute top-0 left-0" style={{ width: CORNER, height: CORNER, borderTop: `2.5px solid ${dot}`, borderLeft: `2.5px solid ${dot}`, boxShadow: `-1px -1px 5px ${glow}` }} />
        <div className="absolute top-0 right-0" style={{ width: CORNER, height: CORNER, borderTop: `2.5px solid ${dot}`, borderRight: `2.5px solid ${dot}`, boxShadow: `1px -1px 5px ${glow}` }} />
        <div className="absolute bottom-0 left-0" style={{ width: CORNER, height: CORNER, borderBottom: `2.5px solid ${dot}`, borderLeft: `2.5px solid ${dot}`, boxShadow: `-1px 1px 5px ${glow}` }} />
        <div className="absolute bottom-0 right-0" style={{ width: CORNER, height: CORNER, borderBottom: `2.5px solid ${dot}`, borderRight: `2.5px solid ${dot}`, boxShadow: `1px 1px 5px ${glow}` }} />
        {/* Fill */}
        <div className="absolute inset-0" style={{ background: `${dot}12` }} />
        {/* Label */}
        <div
          className="absolute left-0 font-mono text-[10px] font-bold text-white px-2 py-0.5 rounded-sm whitespace-nowrap tracking-wide"
          style={{
            top: y1 < 0.08 ? "calc(100% + 2px)" : "-22px",
            background: dot,
            boxShadow: `0 0 8px ${glow}`,
            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          }}
        >
          {marker.object_class.toUpperCase()}
          {marker.zone_name ? ` · ${marker.zone_name}` : ""}
          {" · "}{marker.threat_level}
        </div>
        <ScanLine color={dot} />
      </div>
    </div>
  );
}

// ── HLS Player ────────────────────────────────────────────────────────────────

function DayPlayer({
  playlistUrl, seekTo, bboxMarker, onBboxExpire,
}: {
  playlistUrl: string;
  seekTo: number | null;
  bboxMarker: DetectionMarker | null;
  onBboxExpire: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const pendingSeek = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playlistUrl) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playlistUrl; return;
    }
    if (!Hls.isSupported()) return;

    const hls = new Hls({ enableWorker: true });
    hlsRef.current = hls;
    hls.loadSource(playlistUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (pendingSeek.current !== null) {
        video.currentTime = pendingSeek.current;
        pendingSeek.current = null;
      }
      video.play().catch(() => {});
    });
    return () => { hls.destroy(); };
  }, [playlistUrl]);

  useEffect(() => {
    if (seekTo === null) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState >= 1) { video.currentTime = seekTo; video.play().catch(() => {}); }
    else { pendingSeek.current = seekTo; }
  }, [seekTo]);

  return (
    <div className="relative w-full aspect-video bg-black overflow-hidden">
      <video ref={videoRef} className="absolute inset-0 w-full h-full" controls playsInline />
      {bboxMarker && (
        <BboxOverlay key={bboxMarker.detection_id} marker={bboxMarker} onExpire={onBboxExpire} />
      )}
    </div>
  );
}

// ── 24h Timeline Bar ──────────────────────────────────────────────────────────

function DayBar({
  dayDate, segments, markers, onSeek,
}: {
  dayDate: Date;
  segments: Segment[];
  markers: DetectionMarker[];
  onSeek: (ts: Date) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const start = dayStart(dayDate);

  const density = useMemo(() => {
    const slots = new Array(DENSITY_SLOTS).fill(0);
    for (const m of markers) {
      const idx = Math.floor(((new Date(m.timestamp).getTime() - start.getTime()) / DAY_MS) * DENSITY_SLOTS);
      if (idx >= 0 && idx < DENSITY_SLOTS) slots[idx]++;
    }
    const max = Math.max(1, ...slots);
    return slots.map((v) => v / max);
  }, [markers, start]);

  function getBarPct(e: React.MouseEvent<HTMLDivElement>): number {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  }

  const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

  return (
    <div className="space-y-1.5 select-none">
      {/* Recording + marker bar — kept dark intentionally (data viz) */}
      <div
        ref={barRef}
        onClick={(e) => onSeek(new Date(start.getTime() + getBarPct(e) * DAY_MS))}
        onMouseMove={(e) => setHoverPct(getBarPct(e))}
        onMouseLeave={() => setHoverPct(null)}
        className="relative h-9 bg-slate-800 rounded-lg overflow-visible cursor-crosshair border border-slate-300"
      >
        {HOUR_TICKS.map((h) => (
          <div key={h} className="absolute top-0 w-px h-full bg-slate-600/50"
            style={{ left: `${(h / 24) * 100}%` }} />
        ))}
        {segments.map((seg) => {
          const left = posPercent(new Date(seg.start_time), start);
          const width = posPercent(new Date(seg.end_time), start) - left;
          return (
            <div key={seg.segment_id}
              className="absolute top-1 bottom-1 rounded-sm bg-blue-500/60 border border-blue-400/40"
              style={{ left: `${left}%`, width: `${Math.max(0.3, width)}%` }} />
          );
        })}
        {markers.map((m) => {
          const left = posPercent(new Date(m.timestamp), start);
          const { dot } = threatStyle(m.threat_level, m.is_threat);
          return (
            <div key={m.detection_id}
              className="absolute bottom-1 w-px rounded-full"
              style={{ left: `${left}%`, height: m.is_threat ? "85%" : "55%", background: dot, opacity: 0.9 }} />
          );
        })}
        {hoverPct !== null && (
          <>
            <div className="absolute top-0 w-px h-full bg-white/50 pointer-events-none"
              style={{ left: `${hoverPct * 100}%` }} />
            <div
              className="absolute -top-7 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10"
              style={{ left: `${hoverPct * 100}%` }}
            >
              {new Date(start.getTime() + hoverPct * DAY_MS)
                .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </>
        )}
      </div>

      {/* Density strip */}
      <div className="flex h-2 gap-px">
        {density.map((v, i) => (
          <div key={i} className="flex-1 rounded-sm" style={{
            background: v === 0 ? "#e2e8f0" : `rgba(245,158,11,${0.2 + v * 0.8})`,
          }} />
        ))}
      </div>

      {/* Hour labels */}
      <div className="relative h-4">
        {HOUR_TICKS.filter((h) => h < 24).map((h) => (
          <span key={h} className="absolute -translate-x-1/2 text-[9px] text-slate-400"
            style={{ left: `${(h / 24) * 100}%` }}>
            {String(h).padStart(2, "0")}:00
          </span>
        ))}
        <span className="absolute right-0 text-[9px] text-slate-400">23:59</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-0.5">
        <span className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-blue-500/60 border border-blue-400/40" /> Recorded
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-px h-3 rounded-full bg-red-500" /> HIGH threat
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-px h-3 rounded-full bg-amber-400" /> MEDIUM
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm" style={{ background: "rgba(245,158,11,0.6)" }} /> Event density
        </span>
      </div>
    </div>
  );
}

// ── Event Row ─────────────────────────────────────────────────────────────────

function EventRow({
  marker, isActive, onJump,
}: {
  marker: DetectionMarker;
  isActive: boolean;
  onJump: () => void;
}) {
  const { bg, badge, dot } = threatStyle(marker.threat_level, marker.is_threat);
  return (
    <button
      type="button"
      onClick={onJump}
      className={`w-full text-left px-4 py-2.5 transition-colors group border-b border-slate-100 last:border-0 ${
        isActive ? "bg-blue-50" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`size-2 rounded-full shrink-0 ${bg}`}
          style={isActive ? { boxShadow: `0 0 5px ${dot}` } : {}}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-700 capitalize">{marker.object_class}</span>
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${badge}`}>
              {marker.threat_level}
            </span>
            {marker.zone_name && (
              <span className="text-[10px] text-slate-500 truncate">{marker.zone_name}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="size-2.5" />{formatTime(marker.timestamp)}
            </span>
            {marker.bbox && (
              <span className="text-[9px] text-blue-500 font-medium">bbox</span>
            )}
          </div>
        </div>
        <Play className={`size-3.5 shrink-0 transition-colors ${
          isActive ? "text-blue-500" : "text-slate-300 group-hover:text-blue-400"
        }`} />
      </div>
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type FilterLevel = "all" | "HIGH" | "MEDIUM" | "LOW";

export default function RecordingsPage() {
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [selectedCamId, setSelectedCamId] = useState("");
  const [selectedDay, setSelectedDay] = useState<Date>(dayStart(new Date()));
  const [segments, setSegments] = useState<Segment[]>([]);
  const [markers, setMarkers] = useState<DetectionMarker[]>([]);
  const [loadingCams, setLoadingCams] = useState(true);
  const [loadingDay, setLoadingDay] = useState(false);
  const [error, setError] = useState("");
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [threatsOnly, setThreatsOnly] = useState(false);
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("all");
  const [bboxMarker, setBboxMarker] = useState<DetectionMarker | null>(null);

  useEffect(() => {
    authFetch("/api/cameras")
      .then((r) => r.json())
      .then((data: CameraItem[]) => {
        setCameras(data);
        if (data.length > 0) setSelectedCamId(data[0].camera_id);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingCams(false));
  }, []);

  const loadDay = useCallback(async () => {
    if (!selectedCamId) return;
    setLoadingDay(true);
    setError("");
    setBboxMarker(null);
    const s = encodeURIComponent(dayStart(selectedDay).toISOString());
    const e = encodeURIComponent(dayEnd(selectedDay).toISOString());
    try {
      const [segsRes, tlRes] = await Promise.all([
        authFetch(`/api/recordings/${selectedCamId}?start=${s}&end=${e}`),
        authFetch(`/api/recordings/${selectedCamId}/timeline?start=${s}&end=${e}`),
      ]);
      const segsData: Segment[] = await segsRes.json();
      const tlData: { markers?: DetectionMarker[] } = await tlRes.json();
      setSegments(Array.isArray(segsData) ? segsData : []);
      setMarkers(Array.isArray(tlData.markers) ? tlData.markers : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoadingDay(false);
    }
  }, [selectedCamId, selectedDay]);

  useEffect(() => { void loadDay(); }, [loadDay]);

  const playlistUrl = useMemo(() => {
    if (segments.length === 0) return null;
    const sorted = [...segments].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    const s = encodeURIComponent(sorted[0].start_time);
    const e = encodeURIComponent(sorted[sorted.length - 1].end_time);
    return `${API_BASE_URL}/api/recordings/${selectedCamId}/playlist?start=${s}&end=${e}`;
  }, [segments, selectedCamId]);

  function navigateDay(delta: number) {
    setSelectedDay((d) => { const n = new Date(d); n.setDate(n.getDate() + delta); return dayStart(n); });
    setSeekTo(null);
    setBboxMarker(null);
  }

  const totalDuration = segments.reduce((s, seg) => s + seg.duration_sec, 0);
  const threatCount = markers.filter((m) => m.is_threat).length;

  const filteredMarkers = useMemo(() => {
    let list = markers;
    if (threatsOnly) list = list.filter((m) => m.is_threat);
    if (filterLevel !== "all") list = list.filter((m) => m.threat_level === filterLevel);
    return list;
  }, [markers, threatsOnly, filterLevel]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 overflow-y-auto font-sans">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
          <Film className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Recordings</h1>
          <p className="text-xs text-slate-500">DVR · continuous playback · event timeline · bbox replay</p>
        </div>

        {/* Camera selector */}
        <div className="ml-auto flex items-center gap-2">
          <Camera className="size-4 text-slate-400 shrink-0" />
          {loadingCams ? (
            <div className="h-9 w-40 bg-slate-200 animate-pulse rounded-lg" />
          ) : (
            <select
              value={selectedCamId}
              onChange={(e) => setSelectedCamId(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cameras.map((c) => (
                <option key={c.camera_id} value={c.camera_id}>{c.name} ({c.camera_id})</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />{error}
        </div>
      )}

      {/* ── Day nav + 24h bar ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5">

        {/* Date row */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigateDay(-1)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200">
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-blue-500" />
            <span className="text-sm font-bold text-slate-800">{formatDateLabel(selectedDay)}</span>
            <span className="text-xs text-slate-400">
              {selectedDay.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <button onClick={() => navigateDay(1)}
            disabled={selectedDay.getTime() >= dayStart(new Date()).getTime()}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 disabled:opacity-30">
            <ChevronRight className="size-4" />
          </button>

          <button onClick={loadDay} disabled={loadingDay}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 disabled:opacity-50">
            <RefreshCw className={`size-4 ${loadingDay ? "animate-spin" : ""}`} />
          </button>

          {/* Stats */}
          <div className="ml-auto flex items-center gap-5 text-xs">
            {loadingDay ? (
              <span className="text-slate-400 animate-pulse">Loading…</span>
            ) : (
              <>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <div className="size-2 rounded-full bg-blue-500" />
                  {formatDuration(totalDuration)} recorded
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <div className="size-2 rounded-full bg-amber-400" />
                  {markers.length} event{markers.length !== 1 ? "s" : ""}
                </span>
                {threatCount > 0 && (
                  <span className="flex items-center gap-1.5 text-red-600 font-semibold">
                    <Zap className="size-3.5" />
                    {threatCount} threat{threatCount !== 1 ? "s" : ""}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {loadingDay ? (
          <div className="space-y-1.5">
            <div className="h-9 bg-slate-100 animate-pulse rounded-lg" />
            <div className="h-2 bg-slate-100 animate-pulse rounded" />
            <div className="h-4" />
          </div>
        ) : (
          <DayBar dayDate={selectedDay} segments={segments} markers={markers}
            onSeek={(ts) => { setSeekTo(computeSeekOffset(ts, segments)); setBboxMarker(null); }} />
        )}
      </div>

      {/* ── Player + Events ── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* Player */}
        <div className="flex-1 min-w-0">
          {playlistUrl ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <DayPlayer
                key={playlistUrl}
                playlistUrl={playlistUrl}
                seekTo={seekTo}
                bboxMarker={bboxMarker}
                onBboxExpire={() => setBboxMarker(null)}
              />
              {/* Player footer */}
              <div className="px-4 py-2.5 flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 bg-slate-50">
                <span className="font-semibold text-slate-700">{formatDateLabel(selectedDay)}</span>
                <span>{segments.length} segment{segments.length !== 1 ? "s" : ""} stitched</span>
                <span className="flex items-center gap-1">
                  <div className="size-1.5 rounded-full bg-blue-500" />{formatDuration(totalDuration)}
                </span>
                {bboxMarker ? (
                  <span
                    className="ml-auto flex items-center gap-1.5 font-semibold text-xs animate-pulse"
                    style={{ color: threatStyle(bboxMarker.threat_level, bboxMarker.is_threat).dot }}
                  >
                    <div className="size-1.5 rounded-full" style={{ background: threatStyle(bboxMarker.threat_level, bboxMarker.is_threat).dot }} />
                    {bboxMarker.object_class} · {bboxMarker.threat_level}
                  </span>
                ) : (
                  <span className="ml-auto text-slate-400 text-[10px]">
                    Click timeline or event to jump + show bbox
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-72 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
              <Film className="size-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No recordings for this day</p>
              <p className="text-xs mt-1 text-slate-400">Set RECORDINGS_ENABLED=true in .env</p>
            </div>
          )}
        </div>

        {/* Events panel */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-3">

          {/* Filter bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Filter Events</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(["all", "HIGH", "MEDIUM", "LOW"] as FilterLevel[]).map((f) => (
                <button key={f} type="button" onClick={() => setFilterLevel(f)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                    filterLevel === f
                      ? f === "HIGH" ? "bg-red-500 text-white border-red-500"
                        : f === "MEDIUM" ? "bg-amber-400 text-white border-amber-400"
                        : f === "LOW" ? "bg-slate-400 text-white border-slate-400"
                        : "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}>
                  {f === "all" ? "All" : f}
                </button>
              ))}
              <button type="button" onClick={() => setThreatsOnly((v) => !v)}
                className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  threatsOnly
                    ? "bg-red-50 text-red-600 border-red-300"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}>
                <Shield className="size-3" /> Threats only
              </button>
            </div>
          </div>

          {/* Event list */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
              <Zap className="size-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">Events</span>
              <span className="ml-auto text-[10px] text-slate-400">
                {filteredMarkers.length} / {markers.length}
              </span>
            </div>
            <div className="overflow-y-auto max-h-[55vh]">
              {loadingDay ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : filteredMarkers.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Zap className="size-7 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No events match filter</p>
                </div>
              ) : (
                filteredMarkers.map((m) => (
                  <EventRow
                    key={m.detection_id}
                    marker={m}
                    isActive={bboxMarker?.detection_id === m.detection_id}
                    onJump={() => {
                      setSeekTo(computeSeekOffset(new Date(m.timestamp), segments));
                      setBboxMarker(m.bbox ? m : null);
                    }}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
