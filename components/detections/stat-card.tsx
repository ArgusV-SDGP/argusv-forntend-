import type { ReactNode } from "react";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
};

export function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
      <div className={`shrink-0 rounded-xl p-3 ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-white/40">{label}</p>
        <p className="text-2xl font-bold leading-tight text-white">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-white/30">{sub}</p>}
      </div>
    </div>
  );
}
