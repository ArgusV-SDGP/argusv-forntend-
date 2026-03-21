"use client";

import { AlertTriangle, Settings } from "lucide-react";

export function AdminPageHeader() {
  return (
    <div className="mb-2 flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
        <Settings className="size-5 text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-900">Admin Configuration</h1>
        <p className="text-xs text-slate-500">
          Runtime tuning · RAG settings · Notification rules
        </p>
      </div>
      <span className="ml-auto flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        <AlertTriangle className="size-3" /> Admin Only
      </span>
    </div>
  );
}
