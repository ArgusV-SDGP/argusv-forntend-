"use client";

import { Bot, Camera, ChevronRight } from "lucide-react";
import { CameraItem } from "./types";
import { SUGGESTED } from "./helpers";

type Props = {
  selectedCam: string;
  cameras: CameraItem[];
  onSend: (text: string) => void;
};

export default function ChatEmptyState({ selectedCam, cameras, onSend }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20">
      <div className="size-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-4 shadow-lg">
        <Bot className="size-8 text-white" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-1">ArgusV Security AI</h2>
      <p className="text-sm text-slate-400 mb-8 max-w-sm">
        Ask anything about your camera footage. Answers are grounded in real VLM-analysed detections.
      </p>

      <div className="mb-6 px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
        <Camera className="size-3" />
        {selectedCam === "all"
          ? "Searching across all cameras"
          : `Filtered to: ${cameras.find((c) => c.camera_id === selectedCam)?.name ?? selectedCam}`}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {SUGGESTED.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSend(s)}
            className="text-left text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-colors flex items-start gap-2 shadow-sm"
          >
            <ChevronRight className="size-3.5 shrink-0 mt-0.5 text-slate-400" />
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
