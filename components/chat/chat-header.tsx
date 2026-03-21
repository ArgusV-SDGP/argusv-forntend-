"use client";

import { Bot, Camera, Sparkles, X } from "lucide-react";
import { CameraItem } from "./types";

type Props = {
  cameras: CameraItem[];
  selectedCam: string;
  onCamChange: (cam: string) => void;
  sourceLimit: number;
  onSourceLimitChange: (limit: number) => void;
  hasMessages: boolean;
  onClear: () => void;
};

export default function ChatHeader({
  cameras,
  selectedCam,
  onCamChange,
  sourceLimit,
  onSourceLimitChange,
  hasMessages,
  onClear,
}: Props) {
  return (
    <div className="shrink-0 bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-xl bg-slate-900 flex items-center justify-center">
          <Bot className="size-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">ArgusV Chat</p>
          <p className="text-[11px] text-slate-400">Ask questions about your footage</p>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto flex-wrap">
        {/* Camera filter */}
        <div className="flex items-center gap-1.5">
          <Camera className="size-3.5 text-slate-400" />
          <select
            value={selectedCam}
            onChange={(e) => onCamChange(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">All cameras</option>
            {cameras.map((c) => (
              <option key={c.camera_id} value={c.camera_id}>
                {c.name} ({c.camera_id})
              </option>
            ))}
          </select>
        </div>

        {/* Source count */}
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-slate-400" />
          <select
            value={sourceLimit}
            onChange={(e) => onSourceLimitChange(Number(e.target.value))}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value={4}>4 sources</option>
            <option value={6}>6 sources</option>
            <option value={10}>10 sources</option>
          </select>
        </div>

        {/* Clear */}
        {hasMessages && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
          >
            <X className="size-3.5" />Clear
          </button>
        )}
      </div>
    </div>
  );
}
