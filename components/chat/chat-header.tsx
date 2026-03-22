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
  const selectClass = "text-xs bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1.5 text-white/70 focus:outline-none focus:ring-2 focus:ring-[#18ffbe]/30";

  return (
    <div className="shrink-0 bg-[#0f0f0f] border-b border-white/[0.06] px-4 md:px-6 py-3 flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-xl bg-[#18ffbe]/10 border border-[#18ffbe]/20 flex items-center justify-center">
          <Bot className="size-4 text-[#18ffbe]" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">ArgusV Chat</p>
          <p className="text-[11px] text-white/30">Ask questions about your footage</p>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto flex-wrap">
        <div className="flex items-center gap-1.5">
          <Camera className="size-3.5 text-white/30" />
          <select
            value={selectedCam}
            onChange={(e) => onCamChange(e.target.value)}
            className={selectClass}
          >
            <option value="all">All cameras</option>
            {cameras.map((c) => (
              <option key={c.camera_id} value={c.camera_id}>
                {c.name} ({c.camera_id})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-white/30" />
          <select
            value={sourceLimit}
            onChange={(e) => onSourceLimitChange(Number(e.target.value))}
            className={selectClass}
          >
            <option value={4}>4 sources</option>
            <option value={6}>6 sources</option>
            <option value={10}>10 sources</option>
          </select>
        </div>

        {hasMessages && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 px-2 py-1.5 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-colors"
          >
            <X className="size-3.5" />Clear
          </button>
        )}
      </div>
    </div>
  );
}
