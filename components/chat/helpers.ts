export const THREAT_BADGE: Record<string, string> = {
  HIGH:   "bg-red-500/15 text-red-400 border-red-500/30",
  MEDIUM: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  LOW:    "bg-white/[0.06] text-white/40 border-white/10",
};

export function formatTs(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function relevanceLabel(distance: number) {
  const score = 1 - distance;
  if (score >= 0.85) return { label: "Strong match", color: "text-emerald-400" };
  if (score >= 0.65) return { label: "Good match",   color: "text-blue-400" };
  return                     { label: "Weak match",   color: "text-white/30" };
}

export const SUGGESTED = [
  "Were there any people loitering near the entrance recently?",
  "Show me all HIGH threat detections from the past hour",
  "Any suspicious vehicles spotted in the parking lot?",
  "Summarise all activity on cam-01 today",
];
