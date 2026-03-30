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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-100 via-slate-50 to-white text-slate-800 p-4 md:p-6 lg:p-8 font-sans">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <Film className="size-7 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Recordings</h1>
          <p className="text-sm md:text-base text-slate-500">Browse and play recorded video segments</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm md:text-base text-red-700 flex items-center gap-2.5 shadow-sm">
          <AlertTriangle className="size-4 md:size-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Camera selector */}
      <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Camera className="size-5 md:size-6 text-slate-400 shrink-0" />
          <label className="text-sm md:text-base font-semibold text-slate-700 shrink-0">Camera</label>
        </div>
        {loadingCams ? (
          <div className="h-11 md:h-12 w-full sm:w-72 bg-slate-100 animate-pulse rounded-xl" />
        ) : (
          <select
            value={selectedCamId}
            onChange={(e) => setSelectedCamId(e.target.value)}
            className="w-full sm:w-[24rem] bg-white border border-slate-300 rounded-xl px-4 py-3 md:py-3.5 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
          >
            {cameras.map((c) => (
              <option key={c.camera_id} value={c.camera_id}>
                {c.name} ({c.camera_id})
              </option>
            ))}
          </select>
        )}
        <span className="sm:ml-auto text-sm font-medium text-slate-500">
          {segments.length} segment{segments.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* Segment timeline */}
        <div className="lg:w-[22rem] shrink-0">
          <h2 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Clock className="size-4.5" /> Timeline
          </h2>
          <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
            {loadingSegs ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
              ))
            ) : segments.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white border border-slate-200 rounded-xl text-slate-400">
                <Film className="size-9 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">No recordings found</p>
                <p className="text-xs mt-1">Enable RECORDINGS_ENABLED=true in .env</p>
              </div>
            ) : (
              segments.map((seg) => {
                const isSelected = selectedSeg?.segment_id === seg.segment_id;
                return (
                  <button
                    key={seg.segment_id}
                    onClick={() => setSelectedSeg(seg)}
                    className={`w-full text-left p-4 min-h-24 rounded-xl border transition-all duration-150 ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 ring-2 ring-blue-400 shadow-sm"
                        : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {formatDate(seg.start_time)}
                        </p>
                        <p className="text-sm text-slate-600 mt-0.5">
                          {formatTime(seg.start_time)} → {formatTime(seg.end_time)}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-100 rounded-full px-2 py-1">
                            <HardDrive className="size-3" />
                            {formatBytes(seg.size_bytes)}
                          </span>
                          <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-2 py-1">
                            {seg.duration_sec}s
                          </span>
                          {seg.has_detections && (
                            <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-1 rounded-full">
                              {seg.detection_count} detection{seg.detection_count !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <Play className={`size-5 shrink-0 mt-1 ${isSelected ? "text-blue-600" : "text-slate-300"}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Video player */}
        <div className="flex-1">
          <h2 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Play className="size-4.5" /> Player
          </h2>
          {playlistUrl ? (
            <div className="bg-black rounded-2xl overflow-hidden shadow-xl border border-slate-800/30">
              <SegmentPlayer key={playlistUrl} playlistUrl={playlistUrl} />
              <div className="bg-slate-900 px-4 py-3 text-sm text-slate-300 flex flex-wrap gap-x-5 gap-y-2">
                <span>{formatDate(selectedSeg!.start_time)}</span>
                <span>{formatTime(selectedSeg!.start_time)} – {formatTime(selectedSeg!.end_time)}</span>
                <span>{selectedSeg!.duration_sec}s</span>
                {selectedSeg!.has_detections && (
                  <span className="text-orange-400 font-semibold">{selectedSeg!.detection_count} detection{selectedSeg!.detection_count !== 1 ? "s" : ""}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-72 bg-white border-2 border-dashed border-slate-300 rounded-2xl text-slate-400">
              <Film className="size-11 mb-3 opacity-30" />
              <p className="text-base font-semibold">Select a segment to play</p>
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
