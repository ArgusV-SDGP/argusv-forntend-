"use client";

import { AlertTriangle, Settings } from "lucide-react";

export function AdminPageHeader() {
  return (
    <div className="mb-2 flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-[#18ffbe]/10 border border-[#18ffbe]/20">
        <Settings className="size-5 text-[#18ffbe]" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-white">Admin Configuration</h1>
        <p className="text-xs text-white/40">
          Cameras · Runtime · VLM prompts · Notifications
        </p>
      </div>
      <span className="ml-auto flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
        <AlertTriangle className="size-3" /> Admin Only
      </span>
    </div>
  );
}
