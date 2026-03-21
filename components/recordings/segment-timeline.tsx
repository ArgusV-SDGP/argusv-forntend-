import { Clock, Film, HardDrive, Play } from "lucide-react";

import type { Segment } from "@/components/recordings/types";
import { formatBytes, formatDate, formatTime } from "@/components/recordings/utils";

type SegmentTimelineProps = {
  segments: Segment[];
  selectedSeg: Segment | null;
  loadingSegs: boolean;
  onSelect: (segment: Segment) => void;
};

export function SegmentTimeline({
  segments,
  selectedSeg,
  loadingSegs,
  onSelect,
}: SegmentTimelineProps) {
  return (
    <div className="shrink-0 lg:w-80">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-600">
        <Clock className="size-4" /> Timeline
      </h2>
      <div className="max-h-[60vh] space-y-1.5 overflow-y-auto pr-1">
        {loadingSegs ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg border border-slate-200 bg-white" />
          ))
        ) : segments.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Film className="mx-auto mb-2 size-8 opacity-30" />
            <p className="text-sm">No recordings found</p>
            <p className="mt-1 text-xs">Enable RECORDINGS_ENABLED=true in .env</p>
          </div>
        ) : (
          segments.map((segment) => {
            const isSelected = selectedSeg?.segment_id === segment.segment_id;

            return (
              <button
                key={segment.segment_id}
                onClick={() => onSelect(segment)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  isSelected
                    ? "border-blue-300 bg-blue-50 ring-1 ring-blue-400"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-700">
                      {formatDate(segment.start_time)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatTime(segment.start_time)} {"\u2192"} {formatTime(segment.end_time)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <HardDrive className="size-2.5" />
                        {formatBytes(segment.size_bytes)}
                      </span>
                      {segment.has_detections && (
                        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700">
                          {segment.detection_count} detection
                          {segment.detection_count !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <Play
                    className={`mt-1 size-4 shrink-0 ${
                      isSelected ? "text-blue-500" : "text-slate-300"
                    }`}
                  />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
