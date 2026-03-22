"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DetectionsBreakdown } from "@/components/detections/detections-breakdown";
import { DetectionsErrorAlert } from "@/components/detections/detections-error-alert";
import { DetectionsFilters } from "@/components/detections/detections-filters";
import { DetectionsHeader } from "@/components/detections/detections-header";
import { DetectionsList } from "@/components/detections/detections-list";
import { DetectionsStats } from "@/components/detections/detections-stats";
import type { CameraItem, Detection } from "@/components/detections/types";
import { authFetch } from "@/lib/client-services/auth.service";

export function DetectionsPageContent() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [camFilter, setCamFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [threatsOnly, setThreatsOnly] = useState(false);
  const [limit, setLimit] = useState(100);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchDetections = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

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
    },
    [camFilter, classFilter, threatsOnly, limit],
  );

  useEffect(() => {
    authFetch("/api/cameras")
      .then((r) => r.json())
      .then((data) => setCameras(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchDetections();
  }, [fetchDetections]);

  useEffect(() => {
    if (autoRefresh) {
      autoRefreshRef.current = setInterval(() => fetchDetections(true), 10_000);
    } else if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
    }

    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [autoRefresh, fetchDetections]);

  const stats = useMemo(() => {
    const total = detections.length;
    const threats = detections.filter((detection) => detection.is_threat).length;
    const high = detections.filter((detection) => detection.threat_level === "HIGH").length;
    const medium = detections.filter((detection) => detection.threat_level === "MEDIUM").length;
    const avgConf =
      total > 0
        ? detections.reduce((sum, detection) => sum + detection.confidence, 0) / total
        : 0;
    const withVlm = detections.filter(
      (detection) =>
        detection.vlm_summary &&
        detection.vlm_summary !== "Motion detected (No VLM analysis)",
    ).length;
    const loitering = detections.filter(
      (detection) => detection.event_type === "LOITERING",
    ).length;
    const avgDwell =
      total > 0
        ? detections.reduce((sum, detection) => sum + (detection.dwell_sec || 0), 0) / total
        : 0;

    const byClass: Record<string, number> = {};
    for (const detection of detections) {
      byClass[detection.object_class] = (byClass[detection.object_class] ?? 0) + 1;
    }
    const classSorted = Object.entries(byClass).sort((a, b) => b[1] - a[1]);

    const byEvent: Record<string, number> = {};
    for (const detection of detections) {
      byEvent[detection.event_type] = (byEvent[detection.event_type] ?? 0) + 1;
    }

    const noThreatLevelCount = detections.filter((detection) => !detection.threat_level).length;

    return {
      total,
      threats,
      high,
      medium,
      avgConf,
      withVlm,
      loitering,
      avgDwell,
      classSorted,
      byEvent,
      noThreatLevelCount,
    };
  }, [detections]);

  const knownClasses = useMemo(() => {
    const classes = new Set(detections.map((detection) => detection.object_class));
    return Array.from(classes).sort();
  }, [detections]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0a] p-4 font-sans text-white md:p-6 lg:p-8">
      <DetectionsHeader
        autoRefresh={autoRefresh}
        refreshing={refreshing}
        onToggleAutoRefresh={() => setAutoRefresh((value) => !value)}
        onRefresh={() => fetchDetections(true)}
      />
      <DetectionsErrorAlert error={error} />
      <DetectionsStats stats={stats} limit={limit} />
      <DetectionsBreakdown
        total={stats.total}
        classSorted={stats.classSorted}
        byEvent={stats.byEvent}
        high={stats.high}
        medium={stats.medium}
        noThreatLevelCount={stats.noThreatLevelCount}
      />
      <DetectionsFilters
        camFilter={camFilter}
        classFilter={classFilter}
        limit={limit}
        threatsOnly={threatsOnly}
        cameras={cameras}
        knownClasses={knownClasses}
        detectionCount={detections.length}
        onCamFilterChange={setCamFilter}
        onClassFilterChange={setClassFilter}
        onLimitChange={setLimit}
        onThreatsOnlyChange={setThreatsOnly}
      />
      <DetectionsList detections={detections} loading={loading} />
    </div>
  );
}
