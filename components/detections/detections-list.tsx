import { Eye } from "lucide-react";

import { DetectionRow } from "@/components/detections/detection-row";
import type { Detection } from "@/components/detections/types";

type DetectionsListProps = {
  detections: Detection[];
  loading: boolean;
};

export function DetectionsList({ detections, loading }: DetectionsListProps) {
  return (
    <div className="space-y-1.5">
      <div className="hidden items-center gap-3 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/25 md:flex">
        <span className="w-2 shrink-0" />
        <span className="w-36 shrink-0">Time</span>
        <span className="w-24 shrink-0">Camera</span>
        <span className="w-28 shrink-0">Zone</span>
        <span className="w-20 shrink-0">Class</span>
        <span className="w-14 shrink-0 text-right">Conf</span>
        <span className="hidden sm:block">Type / Threat</span>
      </div>

      {loading ? (
        Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-12 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]"
          />
        ))
      ) : detections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/25">
          <Eye className="mb-3 size-10 opacity-30" />
          <p className="font-medium">No detections found</p>
          <p className="mt-1 text-sm">Adjust filters or wait for camera activity</p>
        </div>
      ) : (
        detections.map((detection, index) => (
          <DetectionRow key={detection.detection_id} detection={detection} index={index} />
        ))
      )}
    </div>
  );
}
