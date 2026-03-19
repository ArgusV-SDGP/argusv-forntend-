"use client";

import React from "react";

import { formatShortTime, formatTime, getThreatClasses } from "./helpers";
import type { Marker, TimelineWindow } from "./types";

type RecordingsTimelineProps = {
  windowRange: TimelineWindow | null;
  currentActualTime: Date | null;
  markers: Marker[];
  progress: number;
  trackRef: React.RefObject<HTMLDivElement | null>;
  onTimelineSeek: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export function RecordingsTimeline({
  windowRange,
  currentActualTime,
  markers,
  progress,
  trackRef,
  onTimelineSeek,
}: RecordingsTimelineProps) {
  return (
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
        onClick={onTimelineSeek}
        className="relative mt-3 h-14 cursor-crosshair overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
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
  );
}
