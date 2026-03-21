export const THREAT_STYLES: Record<string, { badge: string; dot: string }> = {
  HIGH: { badge: "border-red-200 bg-red-100 text-red-700", dot: "bg-red-500" },
  MEDIUM: {
    badge: "border-orange-200 bg-orange-100 text-orange-700",
    dot: "bg-orange-400",
  },
  LOW: { badge: "border-slate-200 bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  PENDING: { badge: "border-blue-200 bg-blue-50 text-blue-500", dot: "bg-blue-400" },
};

export const THREAT_DEFAULT = {
  badge: "border-slate-200 bg-slate-100 text-slate-500",
  dot: "bg-slate-300",
};

export const EVENT_COLORS: Record<string, string> = {
  START: "border-blue-100 bg-blue-50 text-blue-700",
  LOITERING: "border-red-100 bg-red-50 text-red-700",
  UPDATE: "border-slate-200 bg-slate-50 text-slate-600",
  END: "border-emerald-100 bg-emerald-50 text-emerald-700",
  DETECTED: "border-violet-100 bg-violet-50 text-violet-700",
};

export const EVENT_DEFAULT = "border-slate-200 bg-slate-50 text-slate-500";

export const BAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-amber-500",
];
