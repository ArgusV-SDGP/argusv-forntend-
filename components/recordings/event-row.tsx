"use client";

import { Clock, Play } from "lucide-react";
import { formatTime, threatStyle } from "./helpers";
import { DetectionMarker } from "./types";

export function EventRow({
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
