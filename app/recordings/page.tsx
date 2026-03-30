"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertTriangle, Camera, Clock, Film, HardDrive, Play } from "lucide-react";
import { authFetch, API_BASE_URL } from "@/lib/client-services/auth.service";

// ── Types ─────────────────────────────────────────────────────────────────────

type CameraItem = {
  camera_id: string;
  name: string;
  status: string;
};

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

// ── Video Player ──────────────────────────────────────────────────────────────

function SegmentPlayer({ playlistUrl }: { playlistUrl: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playlistUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playlistUrl;
      video.play().catch(() => {});
      return;
    }

    if (!Hls.isSupported()) return;

    const hls = new Hls({ enableWorker: true });
    hlsRef.current = hls;
    hls.loadSource(playlistUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {});
    });

    return () => {
      hls.destroy();
    };
  }, [playlistUrl]);

  return (
    <video
      ref={videoRef}
      className="w-full rounded-lg bg-black aspect-video"
      controls
      playsInline
    />
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RecordingsPage() {
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [selectedCamId, setSelectedCamId] = useState<string>("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSeg, setSelectedSeg] = useState<Segment | null>(null);
  const [loadingCams, setLoadingCams] = useState(true);
  const [loadingSegs, setLoadingSegs] = useState(false);
  const [error, setError] = useState("");

  // Load cameras
  useEffect(() => {
    authFetch("/api/cameras")
      .then((r) => r.json())
      .then((data: CameraItem[]) => {
        setCameras(data);
        if (data.length > 0) setSelectedCamId(data[0].camera_id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingCams(false));
  }, []);

  // Load segments when camera changes
  useEffect(() => {
    if (!selectedCamId) return;
    setLoadingSegs(true);
    setSelectedSeg(null);
    authFetch(`/api/recordings/${selectedCamId}`)
      .then((r) => r.json())
      .then((data: Segment[]) => setSegments(Array.isArray(data) ? data.reverse() : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSegs(false));
  }, [selectedCamId]);

  // Build playlist URL for selected segment (±0s padding = just this segment)
  const playlistUrl = selectedSeg
    ? `${API_BASE_URL}/api/recordings/${selectedSeg.camera_id}/playlist?start=${encodeURIComponent(selectedSeg.start_time)}&end=${encodeURIComponent(selectedSeg.end_time)}`
    : null;

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
          <h2 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
            <Play className="size-4" /> Player
          </h2>
          {playlistUrl ? (
            <div className="bg-black rounded-xl overflow-hidden shadow-lg">
              <SegmentPlayer key={playlistUrl} playlistUrl={playlistUrl} />
              <div className="bg-slate-900 px-4 py-2.5 text-xs text-slate-400 flex gap-4">
                <span>{formatDate(selectedSeg!.start_time)}</span>
                <span>{formatTime(selectedSeg!.start_time)} – {formatTime(selectedSeg!.end_time)}</span>
                <span>{selectedSeg!.duration_sec}s</span>
                {selectedSeg!.has_detections && (
                  <span className="text-orange-400 font-semibold">{selectedSeg!.detection_count} detection{selectedSeg!.detection_count !== 1 ? "s" : ""}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-white border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
              <Film className="size-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Select a segment to play</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
