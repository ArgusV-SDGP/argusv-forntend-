import { TIMELINE_INTENSITY, TIMELINE_LABELS } from "./recordings-data";

export function RecordingsTimeline() {
  return (
    <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={`shrink-0 w-20 h-12 rounded-lg border transition-all ${
              i === 1
                ? "border-blue-300 ring-2 ring-blue-100"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-full h-full rounded-[7px] bg-[linear-gradient(125deg,#475569_0%,#7c8f5a_55%,#1e293b_100%)]" />
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-100 p-4">
        <div className="h-16 rounded-lg bg-slate-300/60 flex items-end gap-[2px] px-1">
          {TIMELINE_INTENSITY.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className="flex-1 rounded-sm"
              style={{
                height: `${Math.max(value, 6)}%`,
                background:
                  value > 70
                    ? "rgb(239 68 68 / 0.9)"
                    : value > 45
                      ? "rgb(59 130 246 / 0.75)"
                      : "rgb(14 165 233 / 0.55)",
              }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          {TIMELINE_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <p className="text-center text-xs text-slate-600 mt-4">03:30 PM</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          Person
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-blue-500" />
          Vehicle
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-500" />
          Package
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-slate-400" />
          All Events
        </span>
      </div>
    </div>
  );
}
