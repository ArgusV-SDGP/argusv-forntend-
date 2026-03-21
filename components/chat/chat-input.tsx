"use client";

import React, { useRef } from "react";
import { Camera, Send, X } from "lucide-react";
import { CameraItem } from "./types";

type Props = {
  input: string;
  onChange: (val: string) => void;
  onSend: () => void;
  loading: boolean;
  selectedCam: string;
  cameras: CameraItem[];
  onClearCam: () => void;
};

export default function ChatInput({
  input,
  onChange,
  onSend,
  loading,
  selectedCam,
  cameras,
  onClearCam,
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="shrink-0 bg-white border-t border-slate-200 px-4 md:px-6 py-4">
      <div className="max-w-2xl mx-auto">
        {selectedCam !== "all" && (
          <div className="flex items-center gap-1.5 mb-2 text-[11px] text-slate-500 font-medium">
            <Camera className="size-3" />
            Filtering to {cameras.find((c) => c.camera_id === selectedCam)?.name ?? selectedCam} only
            <button
              type="button"
              onClick={onClearCam}
              className="ml-1 text-slate-400 hover:text-slate-600"
            >
              <X className="size-3" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your footage… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-[#18ffbe] transition-colors max-h-32 overflow-y-auto"
            style={{ height: "auto" }}
            onInput={(e) => {
              const el = e.target as HTMLTextAreaElement;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
            }}
            disabled={loading}
          />
          <button
            type="button"
            onClick={onSend}
            disabled={loading || !input.trim()}
            className="size-11 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
            style={{ backgroundColor: "#18ffbe" }}
          >
            <Send className="size-4 text-[#1a1a1a]" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          Answers grounded in VLM-analysed detections · Requires <span className="font-mono">OPENAI_API_KEY</span>
        </p>
      </div>
    </div>
  );
}
