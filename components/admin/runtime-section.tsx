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

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-[#18ffbe]/30";

const selectClass =
  "w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-[#18ffbe]/30 [&>option]:bg-[#111111] [&>option]:text-white/80";

const labelClass =
  "text-[11px] font-semibold uppercase tracking-wide text-white/40";

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
    <AdminSection title="Runtime Config" icon={<Cpu className="size-4 text-indigo-400" />}>
      {loading ? (
        <p className="text-sm text-white/40">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Object.entries(config).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className={labelClass}>
                {RUNTIME_LABELS[key] ?? key}
              </label>
              {typeof value === "boolean" ? (
                <select
                  value={String(value)}
                  onChange={(event) => setValue(key, event.target.value)}
                  className={selectClass}
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
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {message && <p className="mt-4 text-sm text-[#18ffbe]">{message}</p>}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 rounded-lg bg-[#18ffbe] px-5 py-2 text-sm font-medium text-black hover:bg-[#18ffbe]/90 disabled:opacity-50"
        >
          <Save className="size-4" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/[0.1] disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Reload
        </button>
      </div>
    </AdminSection>
  );
}
