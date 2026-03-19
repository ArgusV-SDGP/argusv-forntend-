"use client";

import { Clock3 } from "lucide-react";

import { formatTime, getThreatBadgeClasses } from "./helpers";
import type { Marker } from "./types";

type RecordingsSidebarProps = {
  isIncidentReplay: boolean;
  markers: Marker[];
};

export function RecordingsSidebar({
  isIncidentReplay,
  markers,
}: RecordingsSidebarProps) {
  const threatCount = markers.filter((marker) => marker.is_threat).length;

  return (
    <aside className="flex min-h-0 flex-col gap-4 xl:overflow-hidden">
      <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Session
        </p>
        <div className="mt-3 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Playback Mode</p>
            <p className="mt-1 text-sm text-slate-500">
              {isIncidentReplay ? "Incident replay focus window" : "Full-day recording scan"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Markers</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{markers.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Threats</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{threatCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm xl:flex xl:flex-1 xl:flex-col">
        <div className="flex items-center gap-2">
          <Clock3 className="size-4 text-sky-600" />
          <p className="text-sm font-semibold text-slate-900">Recent Events</p>
        </div>

        <div className="mt-3 space-y-3 xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
          {markers.slice(0, 5).map((marker) => (
            <div key={marker.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
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
  );
}
