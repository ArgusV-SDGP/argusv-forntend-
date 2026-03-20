import { Film, Play } from "lucide-react";

import { SegmentPlayer } from "@/components/recordings/segment-player";
import type { Segment } from "@/components/recordings/types";
import { formatDate, formatTime } from "@/components/recordings/utils";

type PlayerPanelProps = {
  playlistUrl: string | null;
  selectedSeg: Segment | null;
};

export function PlayerPanel({ playlistUrl, selectedSeg }: PlayerPanelProps) {
  return (
    <div className="flex-1">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-600">
        <Play className="size-4" /> Player
      </h2>
      {playlistUrl && selectedSeg ? (
        <div className="overflow-hidden rounded-xl bg-black shadow-lg">
          <SegmentPlayer key={playlistUrl} playlistUrl={playlistUrl} />
          <div className="flex gap-4 bg-slate-900 px-4 py-2.5 text-xs text-slate-400">
            <span>{formatDate(selectedSeg.start_time)}</span>
            <span>
              {formatTime(selectedSeg.start_time)} - {formatTime(selectedSeg.end_time)}
            </span>
            <span>{selectedSeg.duration_sec}s</span>
            {selectedSeg.has_detections && (
              <span className="font-semibold text-orange-400">
                {selectedSeg.detection_count} detection
                {selectedSeg.detection_count !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white text-slate-400">
          <Film className="mb-3 size-10 opacity-30" />
          <p className="text-sm font-medium">Select a segment to play</p>
        </div>
      )}
    </div>
  );
}
