"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, ChevronDown, MapPin } from "lucide-react";

import {
  EVENT_COLORS,
  EVENT_DEFAULT,
  THREAT_DEFAULT,
  THREAT_STYLES,
} from "@/components/detections/constants";
import type { Detection } from "@/components/detections/types";
import { formatTs, pct } from "@/components/detections/utils";
import { API_BASE_URL } from "@/lib/client-services/auth.service";

type DetectionRowProps = {
  detection: Detection;
  index: number;
};

export function DetectionRow({ detection, index }: DetectionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const threatStyle = THREAT_STYLES[detection.threat_level ?? ""] ?? THREAT_DEFAULT;
  const eventStyle = EVENT_COLORS[detection.event_type] ?? EVENT_DEFAULT;

  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 transition-shadow hover:shadow-sm ${
        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className={`size-2 shrink-0 rounded-full ${threatStyle.dot}`} />
        <span className="w-36 shrink-0 font-mono text-xs text-slate-400">
          {formatTs(detection.detected_at)}
        </span>
        <span className="flex w-24 shrink-0 items-center gap-1 truncate text-xs text-slate-500">
          <Camera className="size-3 shrink-0" />
          {detection.camera_id}
        </span>
        <span className="flex w-28 shrink-0 items-center gap-1 truncate text-xs text-slate-500">
          <MapPin className="size-3 shrink-0" />
          {detection.zone_name || "—"}
        </span>
        <span className="w-20 shrink-0 text-xs font-semibold capitalize text-slate-700">
          {detection.object_class}
        </span>
        <span className="w-14 shrink-0 text-right text-xs text-slate-500">
          {pct(detection.confidence)}
        </span>
        <span
          className={`hidden rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase sm:inline-flex ${eventStyle}`}
        >
          {detection.event_type}
        </span>
        {detection.threat_level && (
          <span
            className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${threatStyle.badge}`}
          >
            {detection.threat_level}
          </span>
        )}
        {detection.vlm_summary && !expanded && (
          <span className="hidden flex-1 truncate text-xs text-slate-400 lg:block">
            {detection.vlm_summary}
          </span>
        )}
        <ChevronDown
          className={`ml-auto size-3.5 shrink-0 text-slate-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-slate-100 px-4 pb-4 pt-1">
          <div className="flex flex-col gap-4 sm:flex-row">
            {detection.thumbnail_url ? (
              <div className="shrink-0">
                <p className="mb-1.5 text-[10px] font-semibold uppercase text-slate-400">Snapshot</p>
                <Image
                  src={`${API_BASE_URL}${detection.thumbnail_url}`}
                  alt={`${detection.object_class} detection`}
                  width={160}
                  height={112}
                  unoptimized
                  className="h-28 w-40 rounded-lg border border-slate-200 bg-slate-100 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="flex h-28 w-40 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-300">
                <Camera className="mb-1 size-6" />
                <p className="text-[10px]">No snapshot</p>
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                <div>
                  <p className="font-medium text-slate-400">Dwell time</p>
                  <p className="font-semibold text-slate-700">{detection.dwell_sec}s</p>
                </div>
                <div>
                  <p className="font-medium text-slate-400">Event ID</p>
                  <p className="truncate font-mono text-slate-700">
                    {detection.event_id?.slice(0, 14) ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-400">Is threat</p>
                  <p
                    className={
                      detection.is_threat
                        ? "font-semibold text-red-600"
                        : "font-semibold text-emerald-600"
                    }
                  >
                    {detection.is_threat ? "Yes" : "No"}
                  </p>
                </div>
                {detection.bbox && (
                  <div className="col-span-2 sm:col-span-3">
                    <p className="font-medium text-slate-400">Bounding box</p>
                    <p className="font-mono text-[10px] text-slate-600">
                      [{Math.round(detection.bbox.x1)},{Math.round(detection.bbox.y1)}] {"->"} [
                      {Math.round(detection.bbox.x2)},{Math.round(detection.bbox.y2)}]
                    </p>
                  </div>
                )}
              </div>
              {detection.vlm_summary && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400">
                    VLM Analysis
                  </p>
                  <p className="text-xs leading-relaxed text-slate-700">{detection.vlm_summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
