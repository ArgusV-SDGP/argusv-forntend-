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
        <div className="rounded-xl bg-[#18ffbe]/10 p-2">
          <Eye className="size-5 text-[#18ffbe]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Detections</h1>
          <p className="text-sm text-white/40">All YOLO detections — raw pipeline output</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleAutoRefresh}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            autoRefresh
              ? "border-[#18ffbe]/30 bg-[#18ffbe]/10 text-[#18ffbe]"
              : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
          }`}
        >
          <Zap className="size-3" />
          {autoRefresh ? "Live" : "Auto-refresh"}
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
        >
          <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}
