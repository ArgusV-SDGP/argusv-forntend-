export const THREAT_STYLES: Record<string, { badge: string; dot: string }> = {
  HIGH: { badge: "border-red-500/30 bg-red-500/15 text-red-400", dot: "bg-red-500" },
  MEDIUM: {
    badge: "border-orange-500/30 bg-orange-500/15 text-orange-400",
    dot: "bg-orange-400",
  },
  LOW: { badge: "border-white/10 bg-white/[0.06] text-white/50", dot: "bg-white/40" },
  PENDING: { badge: "border-blue-500/30 bg-blue-500/15 text-blue-400", dot: "bg-blue-400" },
};

export const THREAT_DEFAULT = {
  badge: "border-white/10 bg-white/[0.06] text-white/40",
  dot: "bg-white/20",
};

export const EVENT_COLORS: Record<string, string> = {
  START: "border-blue-500/30 bg-blue-500/15 text-blue-400",
  LOITERING: "border-red-500/30 bg-red-500/15 text-red-400",
  UPDATE: "border-white/10 bg-white/[0.06] text-white/50",
  END: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  DETECTED: "border-violet-500/30 bg-violet-500/15 text-violet-400",
};

export const EVENT_DEFAULT = "border-white/10 bg-white/[0.06] text-white/40";

export const BAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-amber-500",
];
