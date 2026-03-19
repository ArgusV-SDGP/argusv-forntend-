"use client";

import { Pause, Play, ShieldAlert } from "lucide-react";

import { formatTime } from "./helpers";
import type { CameraItem, Marker } from "./types";

type RecordingsPlayerProps = {
  isIncidentReplay: boolean;
  status: string;
  currentCamera: CameraItem | null;
  activeMarkers: Marker[];
  isPlaying: boolean;
  onTogglePlaying: () => void;
  currentActualTime: Date | null;
};

export function RecordingsPlayer({
  isIncidentReplay,
  status,
  currentCamera,
  activeMarkers,
  isPlaying,
  onTogglePlaying,
  currentActualTime,
}: RecordingsPlayerProps) {
  return (
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
              onClick={onTogglePlaying}
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
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active detections</p>
              <p className="text-sm font-semibold text-slate-900">{activeMarkers.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
