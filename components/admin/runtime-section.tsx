"use client";

import { useCallback, useEffect, useState } from "react";
import { Cpu, RefreshCw, Save } from "lucide-react";
import { apiFetch } from "@/components/admin/api";
import { AdminSection } from "@/components/admin/admin-section";
import type { RuntimeConfig } from "@/components/admin/types";

const RUNTIME_LABELS: Record<string, string> = {
  detect_fps: "Detect FPS",
  conf_threshold: "Confidence Threshold",
  use_motion_gate: "Use Motion Gate",
  motion_threshold: "Motion Threshold",
  use_tracker: "Use Tracker",
  loiter_threshold_sec: "Loiter Threshold (sec)",
  embed_frame: "Embed Frame",
  frame_jpeg_q: "Frame JPEG Quality",
  recordings_enabled: "Recordings Enabled",
  segment_duration_sec: "Segment Duration (sec)",
  recordings_retain_days: "Retain Days",
  use_tiered_vlm: "Tiered VLM",
  vlm_model: "VLM Model",
  vlm_triage_model: "Triage Model",
  vlm_max_workers: "VLM Max Workers",
  rate_limit_ttl_sec: "Rate Limit TTL (sec)",
};

export function RuntimeSection() {
  const [config, setConfig] = useState<RuntimeConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await apiFetch<RuntimeConfig>("/api/config/runtime");
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await apiFetch("/api/config/runtime", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setMessage("Saved. Changes take effect on next detection cycle.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function setValue(key: string, raw: string) {
    const previousValue = config[key];
    let parsed: string | number | boolean;

    if (typeof previousValue === "boolean") {
      parsed = raw === "true";
    } else if (typeof previousValue === "number") {
      parsed = Number(raw);
    } else {
      parsed = raw;
    }

    setConfig((current) => ({ ...current, [key]: parsed }));
  }

  