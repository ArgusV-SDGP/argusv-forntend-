import { Activity, Clock, ShieldAlert, TrendingUp } from "lucide-react";

import { StatCard } from "@/components/detections/stat-card";
import { pct } from "@/components/detections/utils";

type DetectionStats = {
  total: number;
  threats: number;
  high: number;
  medium: number;
  avgConf: number;
  withVlm: number;
  loitering: number;
  avgDwell: number;
};

type DetectionsStatsProps = {
  stats: DetectionStats;
  limit: number;
};

export function DetectionsStats({ stats, limit }: DetectionsStatsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard
        icon={<Activity className="size-5 text-violet-400" />}
        label="Total Detections"
        value={stats.total}
        sub={`limit ${limit}`}
        accent="bg-violet-500/10"
      />
      <StatCard
        icon={<ShieldAlert className="size-5 text-red-400" />}
        label="Threats"
        value={stats.threats}
        sub={`${stats.high} HIGH · ${stats.medium} MEDIUM`}
        accent="bg-red-500/10"
      />
      <StatCard
        icon={<TrendingUp className="size-5 text-blue-400" />}
        label="Avg Confidence"
        value={pct(stats.avgConf)}
        sub={`${stats.withVlm} with VLM analysis`}
        accent="bg-blue-500/10"
      />
      <StatCard
        icon={<Clock className="size-5 text-amber-400" />}
        label="Loitering Events"
        value={stats.loitering}
        sub={`Avg dwell ${Math.round(stats.avgDwell)}s`}
        accent="bg-amber-500/10"
      />
    </div>
  );
}
