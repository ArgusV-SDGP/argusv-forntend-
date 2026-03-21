"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/components/admin/api";
import { AdminSection } from "@/components/admin/admin-section";
import type { NotifRule } from "@/components/admin/types";

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CHANNELS = ["slack", "webhook", "mqtt", "webpush"];

const SEVERITY_CLASSES: Record<string, string> = {
  LOW: "border-yellow-200 bg-yellow-50 text-yellow-700",
  MEDIUM: "border-orange-200 bg-orange-50 text-orange-700",
  HIGH: "border-red-200 bg-red-50 text-red-700",
  CRITICAL: "border-rose-300 bg-rose-100 text-rose-800",
};

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
      icon={<Bell className="size-4 text-orange-500" />}
      defaultOpen={false}
    >
      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="space-y-3">
          {rules.length === 0 && (
            <p className="text-sm italic text-slate-400">No rules configured.</p>
          )}
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
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
                  <span className="text-xs font-mono text-slate-600">
                    zone: {rule.zone_id}
                  </span>
                  <span className="text-xs text-slate-500">
                    → {rule.channels.join(", ")}
                  </span>
                </div>
                {Object.keys(rule.config).length > 0 && (
                  <p className="mt-1 text-[10px] font-mono text-slate-400">
                    {JSON.stringify(rule.config)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(rule.id)}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd ? (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            New Rule
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Zone ID
              </label>
              <input
                value={form.zone_id}
                onChange={(event) =>
                  setForm((current) => ({ ...current, zone_id: event.target.value }))
                }
                placeholder="global or zone UUID"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Severity
              </label>
              <select
                value={form.severity}
                onChange={(event) =>
                  setForm((current) => ({ ...current, severity: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
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
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Channels
            </label>
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
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-orange-300"
                    }`}
                  >
                    {channel}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Extra Config (JSON)
            </label>
            <textarea
              value={form.config}
              onChange={(event) =>
                setForm((current) => ({ ...current, config: event.target.value }))
              }
              rows={2}
              placeholder='{"slack_channel": "#alerts"}'
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              <Plus className="size-4" /> Create Rule
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-orange-200 px-4 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50"
        >
          <Plus className="size-4" /> Add Rule
        </button>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </AdminSection>
  );
}
