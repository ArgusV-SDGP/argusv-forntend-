"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/components/admin/api";
import { AdminSection } from "@/components/admin/admin-section";
import type { RagEntry } from "@/components/admin/types";

type RagEntryRowProps = {
  entry: RagEntry;
  onSave: (raw: string) => void;
  onDelete: () => void;
  saving: boolean;
};

function RagEntryRow({ entry, onSave, onDelete, saving }: RagEntryRowProps) {
  const [draft, setDraft] = useState(
    typeof entry.value === "string" ? entry.value : JSON.stringify(entry.value)
  );

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
      <span className="min-w-[140px] shrink-0 text-xs font-bold font-mono text-slate-700">
        {entry.key}
      </span>
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
      <button
        type="button"
        onClick={() => onSave(draft)}
        disabled={saving}
        className="shrink-0 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
      >
        Save
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export function RagSection() {
  const [entries, setEntries] = useState<RagEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await apiFetch<RagEntry[]>("/api/rag-config?group=rag");
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function upsert(key: string, value: unknown, group = "rag") {
    await apiFetch(`/api/rag-config/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, group }),
    });
  }

  async function handleUpdate(entry: RagEntry, rawValue: string) {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      let parsed: unknown = rawValue;

      try {
        parsed = JSON.parse(rawValue);
      } catch {
        // Keep plain strings as-is when JSON parsing fails.
      }

      await upsert(entry.key, parsed, entry.group);
      setEntries((current) =>
        current.map((item) =>
          item.key === entry.key ? { ...item, value: parsed } : item
        )
      );
      setMessage(`Updated "${entry.key}"`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(key: string) {
    if (!confirm(`Delete RAG config key "${key}"?`)) {
      return;
    }

    try {
      await apiFetch(`/api/rag-config/${key}?group=rag`, { method: "DELETE" });
      setEntries((current) => current.filter((item) => item.key !== key));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  