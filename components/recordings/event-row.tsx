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
      className={`w-full text-left px-4 py-2.5 transition-colors group border-b border-white/[0.05] last:border-0 ${
        isActive ? "bg-[#18ffbe]/[0.06]" : "hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`size-2 rounded-full shrink-0 ${bg}`}
          style={isActive ? { boxShadow: `0 0 5px ${dot}` } : {}}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-white/70 capitalize">{marker.object_class}</span>
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${badge}`}>
              {marker.threat_level}
            </span>
            {marker.zone_name && (
              <span className="text-[10px] text-white/35 truncate">{marker.zone_name}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] text-white/25 flex items-center gap-1">
              <Clock className="size-2.5" />{formatTime(marker.timestamp)}
            </span>
            {marker.bbox && (
              <span className="text-[9px] text-[#18ffbe]/60 font-medium">bbox</span>
            )}
          </div>
        </div>
        <Play className={`size-3.5 shrink-0 transition-colors ${
          isActive ? "text-[#18ffbe]" : "text-white/20 group-hover:text-[#18ffbe]/60"
        }`} />
      </div>
    </button>
  );
}
