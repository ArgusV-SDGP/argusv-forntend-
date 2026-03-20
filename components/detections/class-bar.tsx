type ClassBarProps = {
  label: string;
  count: number;
  total: number;
  color: string;
};

export function ClassBar({ label, count, total, color }: ClassBarProps) {
  const width = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-600">
        <span className="font-medium capitalize">{label}</span>
        <span className="text-slate-400">
          {count} ({width}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
