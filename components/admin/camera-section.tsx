"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Camera,
  ChevronDown,
  Edit2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { apiFetch } from "@/components/admin/api";
import { AdminSection } from "@/components/admin/admin-section";

type CameraItem = {
  camera_id: string;
  name: string;
  rtsp_url: string;
  status: string;
  fps: number;
  resolution: string | null;
  zone_id: string | null;
  created_at: string | null;
  last_seen: string | null;
  detect_config: Record<string, unknown> | null;
};

const EMPTY_FORM = {
  camera_id: "",
  name: "",
  rtsp_url: "",
  fps: 25,
  resolution: "",
};

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "online")
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  if (s === "offline")
    return "border-white/10 bg-white/[0.06] text-white/40";
  return "border-white/10 bg-white/[0.06] text-white/30";
}

function statusDot(status: string) {
  const s = status.toLowerCase();
  if (s === "online") return "bg-green-500";
  return "bg-white/20";
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#18ffbe]/30";

const labelClass =
  "text-[11px] font-semibold uppercase tracking-wide text-white/40";

export function CameraSection() {
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    rtsp_url: string;
    fps: number;
  }>({ name: "", rtsp_url: "", fps: 25 });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<CameraItem[]>("/api/cameras");
      setCameras(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load cameras");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(cam: CameraItem) {
    setExpandedId(cam.camera_id);
    setEditForm({ name: cam.name, rtsp_url: cam.rtsp_url, fps: cam.fps });
    setSaveMsg("");
  }

  async function handleSaveEdit(cameraId: string) {
    setSaving(true);
    setSaveMsg("");
    try {
      const updated = await apiFetch<CameraItem>(`/api/cameras/${cameraId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          rtsp_url: editForm.rtsp_url.trim(),
          fps: editForm.fps,
        }),
      });
      setCameras((prev) =>
        prev.map((c) => (c.camera_id === cameraId ? updated : c))
      );
      setExpandedId(null);
      setSaveMsg("Saved. Takes effect on next detection cycle.");
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cameraId: string, name: string) {
    if (!confirm(`Delete camera "${name}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`/api/cameras/${cameraId}`, { method: "DELETE" });
      setCameras((prev) => prev.filter((c) => c.camera_id !== cameraId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleCreate() {
    if (!form.camera_id.trim() || !form.name.trim() || !form.rtsp_url.trim()) {
      setCreateError("Camera ID, name and RTSP URL are required.");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const created = await apiFetch<CameraItem>("/api/cameras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          camera_id: form.camera_id.trim(),
          name: form.name.trim(),
          rtsp_url: form.rtsp_url.trim(),
          fps: form.fps || 25,
          resolution: form.resolution.trim() || null,
        }),
      });
      setCameras((prev) => [...prev, created]);
      setForm(EMPTY_FORM);
      setShowAdd(false);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  return (
    <AdminSection
      title="Camera Management"
      icon={<Camera className="size-4 text-violet-400" />}
      defaultOpen={true}
    >
      {/* Camera list */}
      {loading ? (
        <p className="text-sm text-white/40">Loading cameras…</p>
      ) : cameras.length === 0 ? (
        <p className="text-sm italic text-white/40">
          No cameras configured yet. Add one below.
        </p>
      ) : (
        <div className="space-y-2">
          {cameras.map((cam) => {
            const isExpanded = expandedId === cam.camera_id;

            return (
              <div
                key={cam.camera_id}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:bg-white/[0.05]"
              >
                {/* Row header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`size-2 shrink-0 rounded-full ${statusDot(cam.status)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white/80">
                      {cam.name}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-white/30">
                      {cam.rtsp_url}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${statusBadge(cam.status)}`}
                  >
                    {cam.status}
                  </span>
                  {cam.fps && (
                    <span className="hidden shrink-0 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-white/40 sm:inline-flex">
                      {cam.fps} fps
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      isExpanded ? setExpandedId(null) : startEdit(cam)
                    }
                    className="shrink-0 rounded-lg p-1.5 text-white/30 transition-colors hover:bg-white/[0.08] hover:text-white/70"
                  >
                    {isExpanded ? (
                      <X className="size-3.5" />
                    ) : (
                      <Edit2 className="size-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cam.camera_id, cam.name)}
                    className="shrink-0 rounded-lg p-1.5 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  <ChevronDown
                    className={`size-3.5 shrink-0 text-white/30 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>

                {/* Inline editor */}
                {isExpanded && (
                  <div className="space-y-3 border-t border-white/[0.06] px-4 pb-4 pt-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className={labelClass}>Display Name</label>
                        <input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, name: e.target.value }))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClass}>FPS</label>
                        <input
                          type="number"
                          min={1}
                          max={60}
                          value={editForm.fps}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              fps: Number(e.target.value),
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>RTSP URL</label>
                      <input
                        value={editForm.rtsp_url}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            rtsp_url: e.target.value,
                          }))
                        }
                        placeholder="rtsp://user:pass@192.168.1.100:554/stream"
                        className={`${inputClass} font-mono`}
                      />
                    </div>
                    {saveMsg && (
                      <p
                        className={`text-xs ${saveMsg.toLowerCase().includes("fail") || saveMsg.toLowerCase().includes("error") ? "text-red-400" : "text-[#18ffbe]"}`}
                      >
                        {saveMsg}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(cam.camera_id)}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-lg bg-[#18ffbe]/10 border border-[#18ffbe]/20 px-4 py-2 text-sm font-medium text-[#18ffbe] hover:bg-[#18ffbe]/20 disabled:opacity-50"
                    >
                      <Save className="size-3.5" />
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {/* Add camera form */}
      {showAdd ? (
        <div className="mt-4 space-y-4 border-t border-white/[0.06] pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
            Add New Camera
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className={labelClass}>
                Camera ID <span className="text-red-400">*</span>
              </label>
              <input
                value={form.camera_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, camera_id: e.target.value }))
                }
                placeholder="cam-03"
                className={`${inputClass} font-mono`}
              />
              <p className="text-[10px] text-white/30">
                Unique slug — no spaces, used in file paths
              </p>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>
                Display Name <span className="text-red-400">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Front Entrance"
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>
              RTSP URL <span className="text-red-400">*</span>
            </label>
            <input
              value={form.rtsp_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, rtsp_url: e.target.value }))
              }
              placeholder="rtsp://admin:password@192.168.1.100:554/stream1"
              className={`${inputClass} font-mono`}
            />
            <p className="text-[10px] text-white/30">
              Common formats — Hikvision:{" "}
              <span className="font-mono text-white/40">
                rtsp://user:pass@ip:554/Streaming/Channels/101
              </span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass}>FPS</label>
              <input
                type="number"
                min={1}
                max={60}
                value={form.fps}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fps: Number(e.target.value) }))
                }
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>
                Resolution{" "}
                <span className="normal-case text-white/30">(optional)</span>
              </label>
              <input
                value={form.resolution}
                onChange={(e) =>
                  setForm((f) => ({ ...f, resolution: e.target.value }))
                }
                placeholder="1920x1080"
                className={inputClass}
              />
            </div>
          </div>
          {createError && (
            <p className="text-xs text-red-400">{createError}</p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 rounded-lg bg-[#18ffbe] px-5 py-2 text-sm font-medium text-black hover:bg-[#18ffbe]/90 disabled:opacity-50"
            >
              <Plus className="size-4" />
              {creating ? "Adding…" : "Add Camera"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                setForm(EMPTY_FORM);
                setCreateError("");
              }}
              className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/[0.1]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/70"
          >
            <Plus className="size-4" /> Add Camera
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/50 hover:bg-white/[0.08] disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      )}
    </AdminSection>
  );
}
