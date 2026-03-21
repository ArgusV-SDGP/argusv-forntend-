export const THREAT_BADGE: Record<string, string> = {
  HIGH:   "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-orange-100 text-orange-700 border-orange-200",
  LOW:    "bg-slate-100 text-slate-600 border-slate-200",
};

export function formatTs(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function relevanceLabel(distance: number) {
  const score = 1 - distance;
  if (score >= 0.85) return { label: "Strong match", color: "text-emerald-600" };
  if (score >= 0.65) return { label: "Good match",   color: "text-blue-600" };
  return                     { label: "Weak match",   color: "text-slate-400" };
}

export const SUGGESTED = [
  "Were there any people loitering near the entrance recently?",
  "Show me all HIGH threat detections from the past hour",
  "Any suspicious vehicles spotted in the parking lot?",
  "Summarise all activity on cam-01 today",
];
