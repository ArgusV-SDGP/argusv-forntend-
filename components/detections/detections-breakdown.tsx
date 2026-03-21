import { Shield, ShieldCheck, Zap } from "lucide-react";

import { BAR_COLORS } from "@/components/detections/constants";
import { ClassBar } from "@/components/detections/class-bar";

type DetectionsBreakdownProps = {
  total: number;
  classSorted: [string, number][];
  byEvent: Record<string, number>;
  high: number;
  medium: number;
  noThreatLevelCount: number;
};

export function DetectionsBreakdown({
  total,
  classSorted,
  byEvent,
  high,
  medium,
  noThreatLevelCount,
}: DetectionsBreakdownProps) {
  const low = total - high - medium - noThreatLevelCount;

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
          <Shield className="size-4 text-slate-400" /> Object Classes
        </h2>
        {classSorted.length === 0 ? (
          <p className="text-xs text-slate-400">No data</p>
        ) : (
          <div className="space-y-3">
            {classSorted.map(([cls, count], index) => (
              <ClassBar
                key={cls}
                label={cls}
                count={count}
                total={total}
                color={BAR_COLORS[index % BAR_COLORS.length]}
              />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
          <Zap className="size-4 text-slate-400" /> Event Types
        </h2>
        {Object.keys(byEvent).length === 0 ? (
          <p className="text-xs text-slate-400">No data</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(byEvent)
              .sort((a, b) => b[1] - a[1])
              .map(([evt, count], index) => (
                <ClassBar
                  key={evt}
                  label={evt}
                  count={count}
                  total={total}
                  color={BAR_COLORS[(index + 2) % BAR_COLORS.length]}
                />
              ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
          <ShieldCheck className="size-4 text-slate-400" /> Threat Levels
        </h2>
        <div className="space-y-3">
          {[
            { level: "HIGH", count: high, color: "bg-red-500" },
            { level: "MEDIUM", count: medium, color: "bg-orange-400" },
            { level: "LOW", count: low, color: "bg-slate-400" },
            { level: "No VLM", count: noThreatLevelCount, color: "bg-slate-200" },
          ].map(({ level, count, color }) => (
            <ClassBar key={level} label={level} count={count} total={total} color={color} />
          ))}
        </div>
      </div>
    </div>
  );
}
