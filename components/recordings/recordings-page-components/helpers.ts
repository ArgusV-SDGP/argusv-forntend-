import type { ThreatLevel } from "./types";

export function getTodayDate() {
  return new Date().toISOString().split("T")[0] ?? "";
}

export function parseDateValue(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

export function formatShortTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

export function getThreatClasses(level: ThreatLevel) {
  if (level === "HIGH") {
    return "bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.35)] h-full z-20";
  }

  if (level === "MEDIUM") {
    return "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.25)] h-3/4 z-10";
  }

  return "bg-sky-400 h-1/2";
}

export function getThreatBadgeClasses(level: ThreatLevel) {
  if (level === "HIGH") {
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  }

  if (level === "MEDIUM") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
}
