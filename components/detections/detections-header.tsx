import { Eye, RefreshCw, Zap } from "lucide-react";

type DetectionsHeaderProps = {
  autoRefresh: boolean;
  refreshing: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
};

export function DetectionsHeader({
  autoRefresh,
  refreshing,
  onToggleAutoRefresh,
  onRefresh,
}: DetectionsHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Eye className="size-6 text-violet-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Detections</h1>
          <p className="text-sm text-slate-500">All YOLO detections - raw pipeline output</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleAutoRefresh}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            autoRefresh
              ? "border-violet-600 bg-violet-600 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Zap className="size-3" />
          {autoRefresh ? "Live" : "Auto-refresh"}
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}
