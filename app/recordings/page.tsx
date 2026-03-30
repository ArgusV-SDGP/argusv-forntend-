"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, Camera, ChevronLeft, ChevronRight, Film,
  RefreshCw, Shield, Zap, Calendar, Clock,
} from "lucide-react";
import { authFetch, API_BASE_URL } from "@/lib/client-services/auth.service";
import { DayBar } from "@/components/recordings/day-bar";
import { DayPlayer } from "@/components/recordings/day-player";
import { EventRow } from "@/components/recordings/event-row";
import {
  computeSeekOffset, dayEnd, dayStart,
  formatDateLabel, formatDuration,
} from "@/components/recordings/helpers";
import { CameraItem, DetectionMarker, FilterLevel, Segment } from "@/components/recordings/types";

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
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0a] text-white p-4 md:p-6 lg:p-8 overflow-y-auto font-sans">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-xl bg-[#18ffbe]/10 border border-[#18ffbe]/20 flex items-center justify-center">
          <Film className="size-5 text-[#18ffbe]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Recordings</h1>
          <p className="text-xs text-white/30">DVR · continuous playback · event timeline · bbox replay</p>
        </div>

        {/* Camera selector */}
        <div className="ml-auto flex items-center gap-2">
          <Camera className="size-4 text-white/30 shrink-0" />
          {loadingCams ? (
            <div className="h-9 w-40 bg-white/[0.08] animate-pulse rounded-lg" />
          ) : (
            <select
              value={selectedCamId}
              onChange={(e) => setSelectedCamId(e.target.value)}
              className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:ring-2 focus:ring-[#18ffbe]/30"
            >
              {cameras.map((c) => (
                <option key={c.camera_id} value={c.camera_id}>{c.name} ({c.camera_id})</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />{error}
        </div>
      )}

  

      {/* ── Player + Events ── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* Player */}
        <div className="flex-1 min-w-0">
          {playlistUrl ? (
            <div className="border border-white/[0.08] bg-white/[0.03] rounded-2xl overflow-hidden">
              <DayPlayer
                key={playlistUrl}
                playlistUrl={playlistUrl}
                seekTo={seekTo}
                bboxMarker={bboxMarker}
                onBboxExpire={() => setBboxMarker(null)}
              />
              {/* Player footer */}
              <div className="px-4 py-2.5 flex items-center gap-4 text-xs text-white/40 border-t border-white/[0.06] bg-white/[0.02]">
                <span className="font-semibold text-white/70">{formatDateLabel(selectedDay)}</span>
                <span>{segments.length} segment{segments.length !== 1 ? "s" : ""} stitched</span>
                <span className="flex items-center gap-1">
                  <div className="size-1.5 rounded-full bg-[#18ffbe]" />{formatDuration(totalDuration)}
                </span>
                {bboxMarker ? (
                  <span
                    className="ml-auto flex items-center gap-1.5 font-semibold text-xs animate-pulse"
                    style={{ color: bboxMarker.is_threat ? "#f87171" : bboxMarker.threat_level === "MEDIUM" ? "#fb923c" : "#94a3b8" }}
                  >
                    <div className="size-1.5 rounded-full" style={{ background: bboxMarker.is_threat ? "#f87171" : bboxMarker.threat_level === "MEDIUM" ? "#fb923c" : "#94a3b8" }} />
                    {bboxMarker.object_class} · {bboxMarker.threat_level}
                  </span>
                ) : (
                  <span className="ml-auto text-white/25 text-[10px]">
                    Click timeline or event to jump + show bbox
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-white/[0.08] bg-white/[0.03] rounded-2xl overflow-hidden">
              {/* Skeleton video area */}
              <div className="relative w-full aspect-video bg-black flex flex-col items-center justify-center gap-3">
                {loadingDay ? (
                  <>
                    <div className="relative size-14 rounded-full bg-white/[0.06] animate-pulse flex items-center justify-center">
                      <div className="size-8 rounded-full bg-white/[0.08] animate-pulse" />
                    </div>
                    <div className="relative space-y-2 text-center">
                      <div className="h-3 w-36 bg-white/[0.08] animate-pulse rounded mx-auto" />
                      <div className="h-2.5 w-24 bg-white/[0.06] animate-pulse rounded mx-auto" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative size-14 rounded-full bg-white/[0.04] flex items-center justify-center">
                      <Film className="size-7 text-white/20 opacity-60" />
                    </div>
                    <div className="relative text-center">
                      <p className="text-sm font-medium text-white/40">No recordings for this day</p>
                      <p className="text-xs mt-1 text-white/25">Set RECORDINGS_ENABLED=true in .env</p>
                    </div>
                  </>
                )}
              </div>
              {/* Skeleton footer */}
              <div className="px-4 py-2.5 flex items-center gap-4 border-t border-white/[0.06] bg-white/[0.02]">
                <div className="h-3 w-16 bg-white/[0.08] animate-pulse rounded" />
                <div className="h-3 w-24 bg-white/[0.06] animate-pulse rounded" />
                <div className="h-3 w-14 bg-white/[0.06] animate-pulse rounded" />
                <div className="ml-auto h-3 w-40 bg-white/[0.06] animate-pulse rounded" />
              </div>
            </div>
          )}

                      {/* ── Day nav + 24h bar ── */}
      <div className="border border-white/[0.08] bg-white/[0.03] rounded-2xl p-5 mt-5">

        {/* Date row */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigateDay(-1)}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors border border-white/10">
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-[#18ffbe]" />
            <span className="text-sm font-bold text-white/90">{formatDateLabel(selectedDay)}</span>
            <span className="text-xs text-white/30">
              {selectedDay.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <button onClick={() => navigateDay(1)}
            disabled={selectedDay.getTime() >= dayStart(new Date()).getTime()}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors border border-white/10 disabled:opacity-30">
            <ChevronRight className="size-4" />
          </button>

          <button onClick={loadDay} disabled={loadingDay}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors border border-white/10 disabled:opacity-50">
            <RefreshCw className={`size-4 ${loadingDay ? "animate-spin" : ""}`} />
          </button>

          {/* Stats */}
          <div className="ml-auto flex items-center gap-5 text-xs">
            {loadingDay ? (
              <span className="text-white/30 animate-pulse">Loading…</span>
            ) : (
              <>
                <span className="flex items-center gap-1.5 text-white/40">
                  <div className="size-2 rounded-full bg-[#18ffbe]" />
                  {formatDuration(totalDuration)} recorded
                </span>
                <span className="flex items-center gap-1.5 text-white/40">
                  <div className="size-2 rounded-full bg-amber-400" />
                  {markers.length} event{markers.length !== 1 ? "s" : ""}
                </span>
                {threatCount > 0 && (
                  <span className="flex items-center gap-1.5 text-red-400 font-semibold">
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
            <div className="h-9 bg-white/[0.06] animate-pulse rounded-lg" />
            <div className="h-2 bg-white/[0.04] animate-pulse rounded" />
            <div className="h-4" />
          </div>
        ) : (
          <DayBar dayDate={selectedDay} segments={segments} markers={markers}
            onSeek={(ts) => { setSeekTo(computeSeekOffset(ts, segments)); setBboxMarker(null); }} />
        )}
      </div>
        </div>



        {/* Events panel */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-3">

          {/* Filter bar */}
          <div className="border border-white/[0.08] bg-white/[0.03] rounded-xl p-3">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wide mb-2">Filter Events</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(["all", "HIGH", "MEDIUM", "LOW"] as FilterLevel[]).map((f) => (
                <button key={f} type="button" onClick={() => setFilterLevel(f)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                    filterLevel === f
                      ? f === "HIGH" ? "bg-red-500/20 text-red-400 border-red-500/40"
                        : f === "MEDIUM" ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        : f === "LOW" ? "bg-white/10 text-white/60 border-white/20"
                        : "bg-[#18ffbe]/10 text-[#18ffbe] border-[#18ffbe]/30"
                      : "bg-white/[0.04] text-white/40 border-white/10 hover:border-white/20"
                  }`}>
                  {f === "all" ? "All" : f}
                </button>
              ))}
              <button type="button" onClick={() => setThreatsOnly((v) => !v)}
                className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  threatsOnly
                    ? "bg-red-500/15 text-red-400 border-red-500/30"
                    : "bg-white/[0.04] text-white/40 border-white/10 hover:border-white/20"
                }`}>
                <Shield className="size-3" /> Threats only
              </button>
            </div>
          </div>

          {/* Event list */}
          <div className="border border-white/[0.08] bg-white/[0.03] rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2 bg-white/[0.02]">
              <Zap className="size-4 text-amber-400" />
              <span className="text-sm font-semibold text-white/70">Events</span>
              <span className="ml-auto text-[10px] text-white/30">
                {filteredMarkers.length} / {markers.length}
              </span>
            </div>
            <div className="overflow-y-auto max-h-[55vh]">
              {loadingDay ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-white/[0.06] animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : filteredMarkers.length === 0 ? (
                <div className="py-12 text-center text-white/25">
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
