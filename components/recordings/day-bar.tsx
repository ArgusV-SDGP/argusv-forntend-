"use client";

import { useMemo, useRef, useState } from "react";
import { DAY_MS, DENSITY_SLOTS } from "./constants";
import { dayStart, posPercent, threatStyle } from "./helpers";
import { DetectionMarker, Segment } from "./types";

export function DayBar({
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
      {/* Recording + marker bar */}
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
