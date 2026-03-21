import { DAY_MS } from "./constants";
import { Segment, ThreatStyle } from "./types";

export function dayStart(d: Date): Date {
  const r = new Date(d); r.setHours(0, 0, 0, 0); return r;
}
export function dayEnd(d: Date): Date {
  const r = new Date(d); r.setHours(23, 59, 59, 999); return r;
}
export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
export function formatDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
export function formatDateLabel(d: Date) {
  const today = dayStart(new Date());
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
export function posPercent(ts: Date, start: Date): number {
  return Math.min(100, Math.max(0, ((ts.getTime() - start.getTime()) / DAY_MS) * 100));
}
export function threatStyle(level: string, isThreat: boolean): ThreatStyle {
  if (isThreat || level === "HIGH")
    return { bg: "bg-red-500", text: "text-red-700", badge: "bg-red-50 text-red-700 border-red-200", dot: "#ef4444", glow: "rgba(239,68,68,0.45)" };
  if (level === "MEDIUM")
    return { bg: "bg-amber-400", text: "text-amber-700", badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "#f59e0b", glow: "rgba(245,158,11,0.45)" };
  return { bg: "bg-slate-400", text: "text-slate-600", badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "#94a3b8", glow: "rgba(148,163,184,0.45)" };
}
export function computeSeekOffset(target: Date, segments: Segment[]): number {
  const sorted = [...segments].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  const t = target.getTime();
  let offset = 0;
  for (const seg of sorted) {
    const s = new Date(seg.start_time).getTime();
    const e = new Date(seg.end_time).getTime();
    if (t >= e) { offset += seg.duration_sec; }
    else if (t >= s) { offset += (t - s) / 1000; break; }
    else { break; }
  }
  return offset;
}
