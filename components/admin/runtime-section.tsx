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

  return (
    <AdminSection title="Runtime Config" icon={<Cpu className="size-4 text-indigo-500" />}>
      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Object.entries(config).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {RUNTIME_LABELS[key] ?? key}
              </label>
              {typeof value === "boolean" ? (
                <select
                  value={String(value)}
                  onChange={(event) => setValue(key, event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              ) : (
                <input
                  type={typeof value === "number" ? "number" : "text"}
                  value={String(value ?? "")}
                  onChange={(event) => setValue(key, event.target.value)}
                  step={typeof value === "number" && !Number.isInteger(value) ? "0.01" : "1"}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="size-4" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Reload
        </button>
      </div>
    </AdminSection>
  );
}
