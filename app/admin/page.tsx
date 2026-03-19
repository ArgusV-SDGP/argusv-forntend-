"use client";

import React, { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/client-services/auth.service";
import {
  Settings, Shield, Bell, RefreshCw, Save, Trash2, Plus, ChevronDown, ChevronUp,
  AlertTriangle, Cpu, Database,
} from "lucide-react";

// ── types ─────────────────────────────────────────────────────────────────────
type RuntimeConfig = Record<string, string | number | boolean | null>;
type RagEntry = { key: string; group: string; value: unknown };
type NotifRule = {
  id: string;
  zone_id: string;
  severity: string;
  channels: string[];
  config: Record<string, unknown>;
};

// ── helpers ────────────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await authFetch(path, init);
  if (!r.ok) {
    const body = await r.json().catch(() => null) as { detail?: string } | null;
    throw new Error(body?.detail ?? `HTTP ${r.status}`);
  }
  if (r.status === 204) return undefined as unknown as T;
  return r.json() as Promise<T>;
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({
  title, icon, children, defaultOpen = true,
}: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
          {icon}
          {title}
        </span>
        {open ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

// ── Runtime Config ─────────────────────────────────────────────────────────────
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

function RuntimeSection() {
  const [config, setConfig] = useState<RuntimeConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<RuntimeConfig>("/api/config/runtime");
      setConfig(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleSave() {
    setSaving(true);
    setMsg("");
    setError("");
    try {
      await apiFetch("/api/config/runtime", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setMsg("Saved. Changes take effect on next detection cycle.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function setValue(key: string, raw: string) {
    const prev = config[key];
    let parsed: string | number | boolean;
    if (typeof prev === "boolean") {
      parsed = raw === "true";
    } else if (typeof prev === "number") {
      parsed = Number(raw);
    } else {
      parsed = raw;
    }
    setConfig((c) => ({ ...c, [key]: parsed }));
  }

  return (
    <Section title="Runtime Config" icon={<Cpu className="size-4 text-indigo-500" />}>
      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(config).map(([key, val]) => (
            <div key={key} className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                {RUNTIME_LABELS[key] ?? key}
              </label>
              {typeof val === "boolean" ? (
                <select
                  value={String(val)}
                  onChange={(e) => setValue(key, e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              ) : (
                <input
                  type={typeof val === "number" ? "number" : "text"}
                  value={String(val ?? "")}
                  onChange={(e) => setValue(key, e.target.value)}
                  step={typeof val === "number" && !Number.isInteger(val) ? "0.01" : "1"}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              )}
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {msg && <p className="mt-4 text-sm text-green-600">{msg}</p>}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
        >
          <Save className="size-4" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-600 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Reload
        </button>
      </div>
    </Section>
  );
}

// ── RAG Config ─────────────────────────────────────────────────────────────────
function RagSection() {
  const [entries, setEntries] = useState<RagEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<RagEntry[]>("/api/rag-config?group=rag");
      setEntries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function upsert(key: string, value: unknown, group = "rag") {
    await apiFetch(`/api/rag-config/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, group }),
    });
  }

  async function handleUpdate(entry: RagEntry, rawVal: string) {
    setSaving(true);
    setMsg("");
    setError("");
    try {
      let parsed: unknown = rawVal;
      try { parsed = JSON.parse(rawVal); } catch { /* keep as string */ }
      await upsert(entry.key, parsed, entry.group);
      setEntries((prev) => prev.map((e) => e.key === entry.key ? { ...e, value: parsed } : e));
      setMsg(`Updated "${entry.key}"`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(key: string) {
    if (!confirm(`Delete RAG config key "${key}"?`)) return;
    try {
      await apiFetch(`/api/rag-config/${key}?group=rag`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.key !== key));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleAdd() {
    if (!newKey.trim()) return;
    setSaving(true);
    setError("");
    try {
      let parsed: unknown = newVal;
      try { parsed = JSON.parse(newVal); } catch { /* keep as string */ }
      await upsert(newKey.trim(), parsed);
      setEntries((prev) => [...prev, { key: newKey.trim(), group: "rag", value: parsed }]);
      setNewKey("");
      setNewVal("");
      setMsg(`Added "${newKey.trim()}"`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Add failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="RAG / Embedding Config" icon={<Database className="size-4 text-cyan-500" />}>
      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="space-y-3">
          {entries.length === 0 && (
            <p className="text-sm text-slate-400 italic">No RAG config entries yet. Add one below.</p>
          )}
          {entries.map((entry) => (
            <RagEntryRow
              key={entry.key}
              entry={entry}
              onSave={(raw) => handleUpdate(entry, raw)}
              onDelete={() => handleDelete(entry.key)}
              saving={saving}
            />
          ))}
        </div>
      )}

      {/* Add new entry */}
      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Add Entry</p>
        <div className="flex gap-3 flex-wrap">
          <input
            placeholder="key (e.g. retrieval_limit)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 flex-1 min-w-[160px]"
          />
          <input
            placeholder="value (JSON or string)"
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 flex-1 min-w-[160px]"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={saving || !newKey.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium disabled:opacity-50"
          >
            <Plus className="size-4" /> Add
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {msg && <p className="mt-3 text-sm text-green-600">{msg}</p>}
    </Section>
  );
}

function RagEntryRow({
  entry, onSave, onDelete, saving,
}: { entry: RagEntry; onSave: (raw: string) => void; onDelete: () => void; saving: boolean }) {
  const [draft, setDraft] = useState(
    typeof entry.value === "string" ? entry.value : JSON.stringify(entry.value)
  );
  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
      <span className="text-xs font-mono font-bold text-slate-700 shrink-0 min-w-[140px]">{entry.key}</span>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
      <button
        type="button"
        onClick={() => onSave(draft)}
        disabled={saving}
        className="shrink-0 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium disabled:opacity-50"
      >
        Save
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

// ── Notification Rules ─────────────────────────────────────────────────────────
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CHANNELS = ["slack", "webhook", "mqtt", "webpush"];

const SEVERITY_CLS: Record<string, string> = {
  LOW: "bg-yellow-50 text-yellow-700 border-yellow-200",
  MEDIUM: "bg-orange-50 text-orange-700 border-orange-200",
  HIGH: "bg-red-50 text-red-700 border-red-200",
  CRITICAL: "bg-rose-100 text-rose-800 border-rose-300",
};

function NotifSection() {
  const [rules, setRules] = useState<NotifRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ zone_id: "global", severity: "HIGH", channels: ["slack"], config: "{}" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<NotifRule[]>("/api/notification-rules");
      setRules(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this notification rule?")) return;
    try {
      await apiFetch(`/api/notification-rules/${id}`, { method: "DELETE" });
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleAdd() {
    let cfg: Record<string, unknown> = {};
    try { cfg = JSON.parse(form.config); } catch { /* ignore */ }
    try {
      const created = await apiFetch<NotifRule>("/api/notification-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zone_id: form.zone_id, severity: form.severity, channels: form.channels, config: cfg }),
      });
      setRules((prev) => [...prev, created]);
      setShowAdd(false);
      setForm({ zone_id: "global", severity: "HIGH", channels: ["slack"], config: "{}" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    }
  }

  function toggleChannel(ch: string) {
    setForm((f) => {
      const has = f.channels.includes(ch);
      const next = has ? f.channels.filter((c) => c !== ch) : [...f.channels, ch];
      return { ...f, channels: next.length ? next : [ch] };
    });
  }

  return (
    <Section title="Notification Rules" icon={<Bell className="size-4 text-orange-500" />} defaultOpen={false}>
      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="space-y-3">
          {rules.length === 0 && (
            <p className="text-sm text-slate-400 italic">No rules configured.</p>
          )}
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${SEVERITY_CLS[rule.severity] ?? SEVERITY_CLS.HIGH}`}>
                    {rule.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-600">zone: {rule.zone_id}</span>
                  <span className="text-xs text-slate-500">→ {rule.channels.join(", ")}</span>
                </div>
                {Object.keys(rule.config).length > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">{JSON.stringify(rule.config)}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(rule.id)}
                className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd ? (
        <div className="mt-4 border-t border-slate-100 pt-4 space-y-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">New Rule</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Zone ID</label>
              <input
                value={form.zone_id}
                onChange={(e) => setForm((f) => ({ ...f, zone_id: e.target.value }))}
                placeholder="global or zone UUID"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Severity</label>
              <select
                value={form.severity}
                onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Channels</label>
            <div className="flex gap-2 flex-wrap">
              {CHANNELS.map((ch) => {
                const active = form.channels.includes(ch);
                return (
                  <button key={ch} type="button" onClick={() => toggleChannel(ch)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-colors ${
                      active ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-500 border-slate-200 hover:border-orange-300"
                    }`}>
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Extra Config (JSON)</label>
            <textarea
              value={form.config}
              onChange={(e) => setForm((f) => ({ ...f, config: e.target.value }))}
              rows={2}
              placeholder='{"slack_channel": "#alerts"}'
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 font-mono resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium">
              <Plus className="size-4" /> Create Rule
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-600">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setShowAdd(true)}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-orange-200 text-orange-600 hover:bg-orange-50 text-sm font-medium transition-colors">
          <Plus className="size-4" /> Add Rule
        </button>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </Section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 overflow-y-auto font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
            <Settings className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Admin Configuration</h1>
            <p className="text-xs text-slate-500">Runtime tuning · RAG settings · Notification rules</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            <AlertTriangle className="size-3" /> Admin Only
          </span>
        </div>

        <RuntimeSection />
        <RagSection />
        <NotifSection />
      </div>
    </div>
  );
}
