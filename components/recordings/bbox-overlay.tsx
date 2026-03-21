"use client";

import { useEffect, useState } from "react";
import { BBOX_VISIBLE_MS } from "./constants";
import { threatStyle } from "./helpers";
import { ScanLine } from "./scan-line";
import { DetectionMarker } from "./types";

export function BboxOverlay({ marker, onExpire }: { marker: DetectionMarker; onExpire: () => void }) {
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
