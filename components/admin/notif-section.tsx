"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/components/admin/api";
import { AdminSection } from "@/components/admin/admin-section";
import type { NotifRule } from "@/components/admin/types";

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CHANNELS = ["slack", "webhook", "mqtt", "webpush"];

const SEVERITY_CLASSES: Record<string, string> = {
  LOW: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  MEDIUM: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  HIGH: "border-red-500/30 bg-red-500/10 text-red-400",
  CRITICAL: "border-rose-500/30 bg-rose-500/15 text-rose-400",
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#18ffbe]/30";

const selectClass =
  "w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-[#18ffbe]/30 [&>option]:bg-[#111111] [&>option]:text-white/80";

const labelClass =
  "text-[11px] font-semibold uppercase tracking-wide text-white/40";

export function NotifSection() {
  const [rules, setRules] = useState<NotifRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    zone_id: "global",
    severity: "HIGH",
    channels: ["slack"],
    config: "{}",
  });

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await apiFetch<NotifRule[]>("/api/notification-rules");
      setRules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this notification rule?")) {
      return;
    }

    try {
      await apiFetch(`/api/notification-rules/${id}`, { method: "DELETE" });
      setRules((current) => current.filter((rule) => rule.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function handleAdd() {
    let parsedConfig: Record<string, unknown> = {};

    try {
      parsedConfig = JSON.parse(form.config) as Record<string, unknown>;
    } catch {
      // Ignore invalid JSON and submit an empty config payload.
    }

    try {
      const created = await apiFetch<NotifRule>("/api/notification-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zone_id: form.zone_id,
          severity: form.severity,
          channels: form.channels,
          config: parsedConfig,
        }),
      });

      setRules((current) => [...current, created]);
      setShowAdd(false);
      setForm({
        zone_id: "global",
        severity: "HIGH",
        channels: ["slack"],
        config: "{}",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  function toggleChannel(channel: string) {
    setForm((current) => {
      const hasChannel = current.channels.includes(channel);
      const nextChannels = hasChannel
        ? current.channels.filter((item) => item !== channel)
        : [...current.channels, channel];

      return {
        ...current,
        channels: nextChannels.length ? nextChannels : [channel],
      };
    });
  }

  return (
    <AdminSection
      title="Notification Rules"
      icon={<Bell className="size-4 text-orange-400" />}
      defaultOpen={false}
    >
      {loading ? (
        <p className="text-sm text-white/40">Loading…</p>
      ) : (
        <div className="space-y-3">
          {rules.length === 0 && (
            <p className="text-sm italic text-white/40">No rules configured.</p>
          )}
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                      SEVERITY_CLASSES[rule.severity] ?? SEVERITY_CLASSES.HIGH
                    }`}
                  >
                    {rule.severity}
                  </span>
                  <span className="text-xs font-mono text-white/50">
                    zone: {rule.zone_id}
                  </span>
                  <span className="text-xs text-white/40">
                    → {rule.channels.join(", ")}
                  </span>
                </div>
                {Object.keys(rule.config).length > 0 && (
                  <p className="mt-1 text-[10px] font-mono text-white/30">
                    {JSON.stringify(rule.config)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(rule.id)}
                className="shrink-0 rounded-lg p-1.5 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd ? (
        <div className="mt-4 space-y-4 border-t border-white/[0.06] pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
            New Rule
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className={labelClass}>Zone ID</label>
              <input
                value={form.zone_id}
                onChange={(event) =>
                  setForm((current) => ({ ...current, zone_id: event.target.value }))
                }
                placeholder="global or zone UUID"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Severity</label>
              <select
                value={form.severity}
                onChange={(event) =>
                  setForm((current) => ({ ...current, severity: event.target.value }))
                }
                className={selectClass}
              >
                {SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Channels</label>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((channel) => {
                const active = form.channels.includes(channel);

                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleChannel(channel)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                      active
                        ? "border-[#18ffbe]/30 bg-[#18ffbe]/10 text-[#18ffbe]"
                        : "border-white/10 bg-white/[0.04] text-white/50 hover:border-white/20 hover:text-white/70"
                    }`}
                  >
                    {channel}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Extra Config (JSON)</label>
            <textarea
              value={form.config}
              onChange={(event) =>
                setForm((current) => ({ ...current, config: event.target.value }))
              }
              rows={2}
              placeholder='{"slack_channel": "#alerts"}'
              className={`${inputClass} resize-none font-mono`}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-2 rounded-lg bg-[#18ffbe] px-5 py-2 text-sm font-medium text-black hover:bg-[#18ffbe]/90"
            >
              <Plus className="size-4" /> Create Rule
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/[0.1]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/70"
        >
          <Plus className="size-4" /> Add Rule
        </button>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </AdminSection>
  );
}
