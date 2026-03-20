"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Camera,
  ChevronDown,
  Clock,
  Eye,
  Filter,
  MapPin,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import { authFetch, API_BASE_URL } from "@/lib/client-services/auth.service";

// ── Types ─────────────────────────────────────────────────────────────────────

type Detection = {
  detection_id: string;
  event_id: string;
  camera_id: string;
  zone_name: string;
  object_class: string;
  confidence: number;
  threat_level: string | null;
  is_threat: boolean;
  vlm_summary: string | null;
  dwell_sec: number;
  event_type: string;
  detected_at: string;
  thumbnail_url: string | null;
  bbox: { x1: number; y1: number; x2: number; y2: number } | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTs(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

const THREAT_STYLES: Record<string, { badge: string; dot: string }> = {
  HIGH:    { badge: "bg-red-100 text-red-700 border-red-200",    dot: "bg-red-500" },
  MEDIUM:  { badge: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-400" },
  LOW:     { badge: "bg-slate-100 text-slate-600 border-slate-200",    dot: "bg-slate-400" },
  PENDING: { badge: "bg-blue-50 text-blue-500 border-blue-200",        dot: "bg-blue-400" },
};
const THREAT_DEFAULT = { badge: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-300" };

const EVENT_COLORS: Record<string, string> = {
  START:     "bg-blue-50 text-blue-700 border-blue-100",
  LOITERING: "bg-red-50 text-red-700 border-red-100",
  UPDATE:    "bg-slate-50 text-slate-600 border-slate-200",
  END:       "bg-emerald-50 text-emerald-700 border-emerald-100",
  DETECTED:  "bg-violet-50 text-violet-700 border-violet-100",
};
const EVENT_DEFAULT = "bg-slate-50 text-slate-500 border-slate-200";

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${accent} shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Class Breakdown Bar ───────────────────────────────────────────────────────

function ClassBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const w = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span className="font-medium capitalize">{label}</span>
        <span className="text-slate-400">{count} ({w}%)</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

const BAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-orange-500", "bg-rose-500", "bg-amber-500",
];

// ── Detection Row ─────────────────────────────────────────────────────────────

function DetectionRow({ d, idx }: { d: Detection; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const tStyle = THREAT_STYLES[d.threat_level ?? ""] ?? THREAT_DEFAULT;
  const eStyle = EVENT_COLORS[d.event_type] ?? EVENT_DEFAULT;

  return (
    <div className={`border border-slate-200 rounded-xl overflow-hidden transition-shadow hover:shadow-sm ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-center gap-3"
      >
        {/* Threat dot */}
        <span className={`size-2 rounded-full shrink-0 ${tStyle.dot}`} />

        {/* Timestamp */}
        <span className="text-xs text-slate-400 w-36 shrink-0 font-mono">{formatTs(d.detected_at)}</span>

        {/* Camera */}
        <span className="text-xs text-slate-500 flex items-center gap-1 w-24 shrink-0 truncate">
          <Camera className="size-3 shrink-0" />{d.camera_id}
        </span>

        {/* Zone */}
        <span className="text-xs text-slate-500 flex items-center gap-1 w-28 shrink-0 truncate">
          <MapPin className="size-3 shrink-0" />{d.zone_name || "—"}
        </span>

        {/* Object class */}
        <span className="text-xs font-semibold text-slate-700 capitalize w-20 shrink-0">{d.object_class}</span>

        {/* Confidence */}
        <span className="text-xs text-slate-500 w-14 shrink-0 text-right">{pct(d.confidence)}</span>

        {/* Event type */}
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase hidden sm:inline-flex ${eStyle}`}>
          {d.event_type}
        </span>

        {/* Threat level */}
        {d.threat_level && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${tStyle.badge}`}>
            {d.threat_level}
          </span>
        )}

        {/* VLM summary preview */}
        {d.vlm_summary && !expanded && (
          <span className="text-xs text-slate-400 truncate flex-1 hidden lg:block">
            {d.vlm_summary}
          </span>
        )}

        <ChevronDown className={`size-3.5 text-slate-400 ml-auto shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
          <div className="flex gap-4 flex-col sm:flex-row">

            {/* Thumbnail */}
            {d.thumbnail_url ? (
              <div className="shrink-0">
                <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1.5">Snapshot</p>
                <img
                  src={`${API_BASE_URL}${d.thumbnail_url}`}
                  alt={`${d.object_class} detection`}
                  className="w-40 h-28 object-cover rounded-lg border border-slate-200 bg-slate-100"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            ) : (
              <div className="shrink-0 w-40 h-28 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-300">
                <Camera className="size-6 mb-1" />
                <p className="text-[10px]">No snapshot</p>
              </div>
            )}

            {/* Meta + VLM */}
            <div className="flex-1 space-y-3 min-w-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Dwell time</p>
                  <p className="text-slate-700 font-semibold">{d.dwell_sec}s</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Event ID</p>
                  <p className="text-slate-700 font-mono truncate">{d.event_id?.slice(0, 14) ?? "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Is threat</p>
                  <p className={d.is_threat ? "text-red-600 font-semibold" : "text-emerald-600 font-semibold"}>
                    {d.is_threat ? "Yes" : "No"}
                  </p>
                </div>
                {d.bbox && (
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-slate-400 font-medium">Bounding box</p>
                    <p className="text-slate-600 font-mono text-[10px]">
                      [{Math.round(d.bbox.x1)},{Math.round(d.bbox.y1)}] → [{Math.round(d.bbox.x2)},{Math.round(d.bbox.y2)}]
                    </p>
                  </div>
                )}
              </div>
              {d.vlm_summary && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">VLM Analysis</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{d.vlm_summary}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DetectionsPage() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [cameras, setCameras] = useState<{ camera_id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [camFilter, setCamFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [threatsOnly, setThreatsOnly] = useState(false);
  const [limit, setLimit] = useState(100);

  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchDetections = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (camFilter !== "all") params.set("camera_id", camFilter);
      if (classFilter !== "all") params.set("object_class", classFilter);
      if (threatsOnly) params.set("threats_only", "true");

      const res = await authFetch(`/api/detections?${params}`);
      if (!res.ok) throw new Error(await res.text());
      const data: Detection[] = await res.json();
      setDetections(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load detections");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [camFilter, classFilter, threatsOnly, limit]);

  // Load cameras once
  useEffect(() => {
    authFetch("/api/cameras")
      .then((r) => r.json())
      .then((d) => setCameras(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Load detections on filter change
  useEffect(() => { fetchDetections(); }, [fetchDetections]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      autoRefreshRef.current = setInterval(() => fetchDetections(true), 10_000);
    } else {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    }
    return () => { if (autoRefreshRef.current) clearInterval(autoRefreshRef.current); };
  }, [autoRefresh, fetchDetections]);

  // ── Stats derived from loaded detections ──────────────────────────────────
  const stats = useMemo(() => {
    const total = detections.length;
    const threats = detections.filter((d) => d.is_threat).length;
    const high = detections.filter((d) => d.threat_level === "HIGH").length;
    const medium = detections.filter((d) => d.threat_level === "MEDIUM").length;
    const avgConf = total > 0
      ? detections.reduce((s, d) => s + d.confidence, 0) / total
      : 0;
    const withVlm = detections.filter((d) => d.vlm_summary && d.vlm_summary !== "Motion detected (No VLM analysis)").length;
    const loitering = detections.filter((d) => d.event_type === "LOITERING").length;
    const avgDwell = total > 0
      ? detections.reduce((s, d) => s + (d.dwell_sec || 0), 0) / total
      : 0;

    // Class breakdown
    const byClass: Record<string, number> = {};
    for (const d of detections) {
      byClass[d.object_class] = (byClass[d.object_class] ?? 0) + 1;
    }
    const classSorted = Object.entries(byClass).sort((a, b) => b[1] - a[1]);

    // Event type breakdown
    const byEvent: Record<string, number> = {};
    for (const d of detections) {
      byEvent[d.event_type] = (byEvent[d.event_type] ?? 0) + 1;
    }

    return { total, threats, high, medium, avgConf, withVlm, loitering, avgDwell, classSorted, byEvent };
  }, [detections]);

  // Unique classes for filter
  const knownClasses = useMemo(() => {
    const s = new Set(detections.map((d) => d.object_class));
    return Array.from(s).sort();
  }, [detections]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Eye className="size-6 text-violet-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Detections</h1>
            <p className="text-sm text-slate-500">All YOLO detections — raw pipeline output</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRefresh((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              autoRefresh
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Zap className="size-3" />
            {autoRefresh ? "Live" : "Auto-refresh"}
          </button>
          <button
            type="button"
            onClick={() => fetchDetections(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />{error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Activity className="size-5 text-violet-600" />}
          label="Total Detections"
          value={stats.total}
          sub={`limit ${limit}`}
          accent="bg-violet-50"
        />
        <StatCard
          icon={<ShieldAlert className="size-5 text-red-600" />}
          label="Threats"
          value={stats.threats}
          sub={`${stats.high} HIGH · ${stats.medium} MEDIUM`}
          accent="bg-red-50"
        />
        <StatCard
          icon={<TrendingUp className="size-5 text-blue-600" />}
          label="Avg Confidence"
          value={pct(stats.avgConf)}
          sub={`${stats.withVlm} with VLM analysis`}
          accent="bg-blue-50"
        />
        <StatCard
          icon={<Clock className="size-5 text-amber-600" />}
          label="Loitering Events"
          value={stats.loitering}
          sub={`Avg dwell ${Math.round(stats.avgDwell)}s`}
          accent="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Class breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Shield className="size-4 text-slate-400" /> Object Classes
          </h2>
          {stats.classSorted.length === 0 ? (
            <p className="text-xs text-slate-400">No data</p>
          ) : (
            <div className="space-y-3">
              {stats.classSorted.map(([cls, count], i) => (
                <ClassBar key={cls} label={cls} count={count} total={stats.total} color={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </div>
          )}
        </div>

        {/* Event type breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Zap className="size-4 text-slate-400" /> Event Types
          </h2>
          {Object.keys(stats.byEvent).length === 0 ? (
            <p className="text-xs text-slate-400">No data</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.byEvent)
                .sort((a, b) => b[1] - a[1])
                .map(([evt, count], i) => (
                  <ClassBar key={evt} label={evt} count={count} total={stats.total} color={BAR_COLORS[(i + 2) % BAR_COLORS.length]} />
                ))}
            </div>
          )}
        </div>

        {/* Threat level breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <ShieldCheck className="size-4 text-slate-400" /> Threat Levels
          </h2>
          <div className="space-y-3">
            {[
              { level: "HIGH",   count: stats.high,                                           color: "bg-red-500" },
              { level: "MEDIUM", count: stats.medium,                                         color: "bg-orange-400" },
              { level: "LOW",    count: stats.total - stats.high - stats.medium - (detections.filter(d => !d.threat_level).length), color: "bg-slate-400" },
              { level: "No VLM", count: detections.filter(d => !d.threat_level).length,       color: "bg-slate-200" },
            ].map(({ level, count, color }) => (
              <ClassBar key={level} label={level} count={count} total={stats.total} color={color} />
            ))}
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-4 flex flex-wrap items-center gap-3">
        <Filter className="size-4 text-slate-400 shrink-0" />

        <select
          value={camFilter}
          onChange={(e) => setCamFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">All Cameras</option>
          {cameras.map((c) => (
            <option key={c.camera_id} value={c.camera_id}>{c.name} ({c.camera_id})</option>
          ))}
        </select>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">All Classes</option>
          {knownClasses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value={50}>Last 50</option>
          <option value={100}>Last 100</option>
          <option value={200}>Last 200</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={threatsOnly}
            onChange={(e) => setThreatsOnly(e.target.checked)}
            className="accent-violet-600 size-4"
          />
          Threats only
        </label>

        <span className="ml-auto text-xs text-slate-400">
          {detections.length} detection{detections.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Detection list */}
      <div className="space-y-1.5">
        {/* Column headers */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          <span className="w-2 shrink-0" />
          <span className="w-36 shrink-0">Time</span>
          <span className="w-24 shrink-0">Camera</span>
          <span className="w-28 shrink-0">Zone</span>
          <span className="w-20 shrink-0">Class</span>
          <span className="w-14 shrink-0 text-right">Conf</span>
          <span className="hidden sm:block">Type / Threat</span>
        </div>

        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))
        ) : detections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Eye className="size-10 mb-3 opacity-30" />
            <p className="font-medium">No detections found</p>
            <p className="text-sm mt-1">Adjust filters or wait for camera activity</p>
          </div>
        ) : (
          detections.map((d, i) => <DetectionRow key={d.detection_id} d={d} idx={i} />)
        )}
      </div>

    </div>
  );
}
