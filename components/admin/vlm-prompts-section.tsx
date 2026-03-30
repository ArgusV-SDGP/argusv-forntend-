"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Save, RotateCcw } from "lucide-react";
import { apiFetch } from "@/components/admin/api";
import { AdminSection } from "@/components/admin/admin-section";

const VLM_PROMPT_KEYS = [
  {
    key: "vlm.analysis_prompt",
    label: "Full Analysis Prompt",
    hint: "Sent to the VLM for every detection frame. Available variables: {object_class}, {zone_name}, {dwell_sec}, {event_type}",
    accent: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  {
    key: "vlm.triage_prompt",
    label: "Triage Prompt",
    hint: "Cheap first-pass — model replies YES or NO. Full analysis only runs on YES. Same variables available.",
    accent: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  },
] as const;

export function VlmPromptsSection() {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ key: string; value: unknown }[]>(
        "/api/rag-config?group=prompts"
      );
      const map: Record<string, string> = {};
      for (const row of data) {
        map[row.key] =
          typeof row.value === "string"
            ? row.value
            : JSON.stringify(row.value);
      }
      setDrafts(map);
    } catch (e) {
      setErrors({ _load: e instanceof Error ? e.message : "Failed to load" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(key: string) {
    setSaving(key);
    setMsgs((m) => ({ ...m, [key]: "" }));
    setErrors((e) => ({ ...e, [key]: "" }));
    try {
      await apiFetch(`/api/rag-config/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: drafts[key] ?? "", group: "prompts" }),
      });
      setMsgs((m) => ({
        ...m,
        [key]: "Saved. Active within 60s (Redis TTL).",
      }));
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        [key]: e instanceof Error ? e.message : "Save failed",
      }));
    } finally {
      setSaving(null);
    }
  }

  async function handleReset(key: string) {
    if (
      !confirm(
        `Reset "${key}" to built-in default? This removes the DB override.`
      )
    )
      return;
    try {
      await apiFetch(`/api/rag-config/${key}?group=prompts`, {
        method: "DELETE",
      });
      setDrafts((d) => {
        const next = { ...d };
        delete next[key];
        return next;
      });
      setMsgs((m) => ({ ...m, [key]: "Reset to built-in default." }));
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        [key]: e instanceof Error ? e.message : "Reset failed",
      }));
    }
  }

  return (
    <AdminSection
      title="VLM Prompt Templates"
      icon={<MessageSquare className="size-4 text-indigo-400" />}
      defaultOpen={false}
    >
      {errors._load && (
        <p className="mb-3 text-sm text-red-400">{errors._load}</p>
      )}
      {loading ? (
        <p className="text-sm text-white/40">Loading…</p>
      ) : (
        <div className="space-y-6">
          {VLM_PROMPT_KEYS.map(({ key, label, hint, accent }) => (
            <div key={key} className="space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${accent}`}
                  >
                    {key.split(".")[1]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white/80">
                      {label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/40">{hint}</p>
                  </div>
                </div>
                {drafts[key] !== undefined && (
                  <button
                    type="button"
                    onClick={() => handleReset(key)}
                    className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <RotateCcw className="size-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Textarea */}
              <textarea
                rows={6}
                value={drafts[key] ?? ""}
                onChange={(e) =>
                  setDrafts((d) => ({ ...d, [key]: e.target.value }))
                }
                placeholder="Leave empty to use built-in default"
                className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 font-mono text-sm text-white/70 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#18ffbe]/30"
              />

              {errors[key] && (
                <p className="text-xs text-red-400">{errors[key]}</p>
              )}
              {msgs[key] && (
                <p className="text-xs text-[#18ffbe]">{msgs[key]}</p>
              )}

              <button
                type="button"
                onClick={() => handleSave(key)}
                disabled={saving === key}
                className="flex items-center gap-2 rounded-lg bg-[#18ffbe] px-4 py-2 text-sm font-medium text-black hover:bg-[#18ffbe]/90 disabled:opacity-50"
              >
                <Save className="size-3.5" />
                {saving === key ? "Saving…" : "Save Prompt"}
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminSection>
  );
}
