"use client";

import React, { FormEvent, useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import {
  PenTool, Undo2, Trash2, Plus, Camera, Shield, AlertTriangle,
  ChevronDown, ChevronUp,
} from "lucide-react";
import type { CreateZonePayload, CreateRulePayload } from "@/lib/mappers/zone.mappers";
import { attachLiveStream } from "@/lib/client-services/live-stream.service";

type CameraItem = { camera_id: string; name: string; status: string };

type Point = { x: number; y: number };

type DrawZoneProps = {
  cameras: CameraItem[];
  onCreateZone: (zone: CreateZonePayload, rules: CreateRulePayload[]) => Promise<boolean>;
  isCreating: boolean;
  formError: string;
  formSuccess: string;
  camerasLoading?: boolean;
  camerasError?: string;
};

const TRIGGER_TYPES = [
  { value: "loitering",       label: "Loitering" },
  { value: "intrusion",       label: "Intrusion" },
  { value: "restricted_area", label: "Restricted Area" },
];

const SEVERITY_OPTIONS = [
  { value: "HIGH",   label: "High",   active: "bg-red-500/20 text-red-400 border-red-500/40",   inactive: "text-white/30 bg-white/[0.04] border-white/10" },
  { value: "MEDIUM", label: "Medium", active: "bg-orange-500/20 text-orange-400 border-orange-500/40", inactive: "text-white/30 bg-white/[0.04] border-white/10" },
  { value: "LOW",    label: "Low",    active: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",  inactive: "text-white/30 bg-white/[0.04] border-white/10" },
];

const OBJECT_CLASSES = ["person", "car", "truck"];

type RuleFormState = {
  trigger_type: string;
  severity: string;
  object_classes: string[];
  action: string;
  min_confidence: number;
  is_active: boolean;
};

function defaultRule(): RuleFormState {
  return {
    trigger_type: "loitering",
    severity: "MEDIUM",
    object_classes: ["person"],
    action: "ALERT",
    min_confidence: 0.45,
    is_active: true,
  };
}

const inputClass = "w-full bg-white/[0.06] border border-white/10 hover:border-white/20 focus:border-[#18ffbe]/50 focus:ring-1 focus:ring-[#18ffbe]/30 rounded-lg px-4 py-2.5 text-sm text-white/80 outline-none transition-colors";
const labelClass = "text-xs font-semibold text-white/40 tracking-wide uppercase";

export function DrawZone({
  cameras,
  onCreateZone,
  isCreating,
  formError,
  formSuccess,
  camerasLoading = false,
  camerasError = "",
}: DrawZoneProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedCam, setSelectedCam] = useState<string>("");
  const [showRules, setShowRules] = useState(true);
  const [rules, setRules] = useState<RuleFormState[]>([defaultRule()]);
  const [zoneName, setZoneName] = useState("");
  const [zoneType, setZoneType] = useState("security");
  const [dwellSec, setDwellSec] = useState(30);
  const [zoneActive, setZoneActive] = useState(true);
  const [validationError, setValidationError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (selectedCam) return;
    if (Array.isArray(cameras) && cameras.length > 0) {
      setSelectedCam(cameras[0].camera_id);
    }
  }, [cameras, selectedCam]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setStageSize({ width: el.offsetWidth, height: el.offsetHeight });
    });
    ro.observe(el);
    setStageSize({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedCam) {
      if (video) video.src = "";
      return;
    }
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    attachLiveStream(video, selectedCam, {
      onConnecting: () => {},
      onLive: () => {},
      onError: () => {},
    }).then((dispose) => {
      if (cancelled) { dispose(); return; }
      cleanup = dispose;
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [selectedCam]);

  const handleStageClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (isFinished) return;
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      setPoints((prev) => [...prev, { x: pos.x, y: pos.y }]);
      setValidationError("");
    }
  };

  const flattenPoints = (pts: Point[]) =>
    pts.reduce((acc: number[], p) => [...acc, p.x, p.y], []);

  const getNormalizedPoints = (pts: Point[]) => {
    if (stageSize.width <= 0 || stageSize.height <= 0) return [];
    return pts.map(
      (p) => [
        Number((p.x / stageSize.width).toFixed(6)),
        Number((p.y / stageSize.height).toFixed(6)),
      ] as [number, number]
    );
  };

  function updateRule(idx: number, patch: Partial<RuleFormState>) {
    setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function toggleObjectClass(ruleIdx: number, cls: string) {
    setRules((prev) =>
      prev.map((r, i) => {
        if (i !== ruleIdx) return r;
        const has = r.object_classes.includes(cls);
        const next = has
          ? r.object_classes.filter((c) => c !== cls)
          : [...r.object_classes, cls];
        return { ...r, object_classes: next.length ? next : [cls] };
      })
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");

    if (camerasError) { setValidationError(camerasError); return; }
    if (!zoneName.trim()) { setValidationError("Zone name is required."); return; }
    if (!selectedCam) { setValidationError("Please select a camera to create this zone."); return; }
    if (!cameras.some((c) => c.camera_id === selectedCam)) { setValidationError("Invalid camera selection."); return; }
    if (points.length < 3) { setValidationError("Draw at least 3 points on the canvas."); return; }
    if (!isFinished) { setValidationError("Close the polygon first by clicking the first point."); return; }

    const zonePayload: CreateZonePayload = {
      camera_id: selectedCam,
      name: zoneName.trim(),
      zone_type: zoneType,
      dwell_threshold_sec: Math.max(1, dwellSec),
      active: zoneActive,
      polygon_coords: getNormalizedPoints(points),
    };

    const rulePayloads: CreateRulePayload[] = rules.map((r) => ({ ...r }));
    const created = await onCreateZone(zonePayload, rulePayloads);

    if (created) {
      setPoints([]);
      setIsFinished(false);
      setRules([defaultRule()]);
      setZoneName("");
      setZoneType("security");
      setDwellSec(30);
      setZoneActive(true);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#18ffbe]/60 to-blue-500/60" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header + camera selector */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <PenTool className="size-5 text-[#18ffbe]" />
              Draw Zone Polygon
            </h2>
            <p className="text-xs text-white/40 mt-1">
              Select a camera, draw a polygon on the preview. Min 3 points.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Camera className="size-4 text-white/30 shrink-0" />
            <select
              value={selectedCam}
              onChange={(e) => setSelectedCam(e.target.value)}
              disabled={camerasLoading || !!camerasError}
              className="text-sm bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-white/70 focus:outline-none focus:ring-2 focus:ring-[#18ffbe]/40 min-w-[200px] disabled:opacity-50"
            >
              <option value="">{camerasLoading ? "Loading cameras..." : "Select camera *"}</option>
              {cameras.map((c) => (
                <option key={c.camera_id} value={c.camera_id}>
                  {c.name} ({c.camera_id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drawing canvas */}
        <div
          ref={containerRef}
          className="w-full aspect-video bg-black rounded-xl border border-white/10 shadow-inner overflow-hidden cursor-crosshair relative"
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            muted
            autoPlay
            playsInline
          />

          {stageSize.width > 0 && (
            <Stage
              width={stageSize.width}
              height={stageSize.height}
              onClick={handleStageClick}
              onTap={handleStageClick}
              className="absolute inset-0"
            >
              <Layer>
                <Line
                  points={flattenPoints(points)}
                  stroke="#18ffbe"
                  strokeWidth={2}
                  closed={isFinished}
                  fill={isFinished ? "rgba(24,255,190,0.12)" : "rgba(24,255,190,0.06)"}
                  lineJoin="round"
                />
                {points.map((pt, i) => (
                  <React.Fragment key={i}>
                    <Circle
                      x={pt.x} y={pt.y}
                      radius={i === 0 && points.length > 2 && !isFinished ? 7 : 4}
                      fill="white" stroke="#18ffbe" strokeWidth={2}
                      onMouseEnter={(e) => {
                        if (i === 0 && points.length > 2)
                          e.target.getStage()!.container().style.cursor = "pointer";
                      }}
                      onMouseLeave={(e) => {
                        e.target.getStage()!.container().style.cursor = "crosshair";
                      }}
                      onClick={() => {
                        if (i === 0 && points.length > 2) setIsFinished(true);
                      }}
                    />
                  </React.Fragment>
                ))}
              </Layer>
            </Stage>
          )}

          {points.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white/40 font-medium tracking-widest uppercase text-sm select-none bg-black/50 px-3 py-1.5 rounded-full border border-white/10">
                {selectedCam ? "Click to draw zone" : "Select a camera above"}
              </span>
            </div>
          )}
        </div>

        {/* Canvas controls */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { setPoints(points.slice(0, -1)); setIsFinished(false); }}
            disabled={points.length === 0 || isCreating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium text-white/50 hover:text-white disabled:opacity-40 transition-colors">
            <Undo2 className="size-4" /> Undo
          </button>
          <button type="button" onClick={() => { setPoints([]); setIsFinished(false); }}
            disabled={points.length === 0 || isCreating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-sm font-medium text-white/50 disabled:opacity-40 transition-colors">
            <Trash2 className="size-4" /> Clear
          </button>
          {points.length >= 3 && !isFinished && (
            <button type="button" onClick={() => setIsFinished(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#18ffbe]/10 hover:bg-[#18ffbe]/20 border border-[#18ffbe]/30 text-sm font-medium text-[#18ffbe] transition-colors">
              Close polygon
            </button>
          )}
          <span className="ml-auto text-xs text-white/30">{points.length} point{points.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="w-full h-px bg-white/[0.06]" />

        {/* Zone metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Zone Name *</label>
            <input
              type="text"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="Front Gate"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Zone Type</label>
            <select value={zoneType} onChange={(e) => setZoneType(e.target.value)} className={inputClass}>
              <option value="security">Security</option>
              <option value="loitering">Loitering</option>
              <option value="intrusion">Intrusion</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Dwell Threshold (sec)</label>
            <input
              type="number"
              value={dwellSec}
              onChange={(e) => setDwellSec(Math.max(1, Number(e.target.value)))}
              min="1"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Status</label>
            <select value={String(zoneActive)} onChange={(e) => setZoneActive(e.target.value === "true")} className={inputClass}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Threat Rules section */}
        <div className="border border-white/[0.08] rounded-xl overflow-hidden">
          <button type="button"
            onClick={() => setShowRules((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.04] hover:bg-white/[0.06] text-sm font-semibold text-white/70 transition-colors">
            <span className="flex items-center gap-2">
              <Shield className="size-4 text-[#18ffbe]" />
              Threat Rules
              <span className="text-xs font-normal text-white/30">({rules.length} rule{rules.length !== 1 ? "s" : ""})</span>
            </span>
            {showRules ? <ChevronUp className="size-4 text-white/30" /> : <ChevronDown className="size-4 text-white/30" />}
          </button>

          {showRules && (
            <div className="p-4 space-y-4">
              {rules.map((rule, idx) => (
                <div key={idx} className="border border-white/[0.08] rounded-xl p-4 bg-white/[0.03] space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5 text-orange-400" /> Rule {idx + 1}
                    </span>
                    {rules.length > 1 && (
                      <button type="button"
                        onClick={() => setRules((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-xs text-white/30 hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10 transition-colors">
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={labelClass}>Trigger</label>
                      <select value={rule.trigger_type}
                        onChange={(e) => updateRule(idx, { trigger_type: e.target.value })}
                        className="w-full text-xs bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-white/70 focus:outline-none focus:ring-1 focus:ring-[#18ffbe]/30">
                        {TRIGGER_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={labelClass}>Threat Level</label>
                      <div className="flex gap-1.5">
                        {SEVERITY_OPTIONS.map((s) => (
                          <button key={s.value} type="button"
                            onClick={() => updateRule(idx, { severity: s.value })}
                            className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition-colors ${
                              rule.severity === s.value ? s.active : s.inactive
                            }`}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className={labelClass}>Action</label>
                      <select value={rule.action}
                        onChange={(e) => updateRule(idx, { action: e.target.value })}
                        className="w-full text-xs bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-white/70 focus:outline-none focus:ring-1 focus:ring-[#18ffbe]/30">
                        <option value="ALERT">Alert (notify + log)</option>
                        <option value="MONITOR">Monitor (log only)</option>
                        <option value="IGNORE">Ignore</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={labelClass}>
                        Min Confidence ({Math.round(rule.min_confidence * 100)}%)
                      </label>
                      <input type="range" min="0.1" max="0.99" step="0.05"
                        value={rule.min_confidence}
                        onChange={(e) => updateRule(idx, { min_confidence: parseFloat(e.target.value) })}
                        className="w-full accent-[#18ffbe]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelClass}>Monitor Objects</label>
                    <div className="flex gap-2">
                      {OBJECT_CLASSES.map((cls) => {
                        const active = rule.object_classes.includes(cls);
                        return (
                          <button key={cls} type="button"
                            onClick={() => toggleObjectClass(idx, cls)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-colors ${
                              active
                                ? "bg-[#18ffbe]/15 text-[#18ffbe] border-[#18ffbe]/40"
                                : "bg-white/[0.04] text-white/40 border-white/10 hover:border-white/20 hover:text-white/60"
                            }`}>
                            {cls}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              <button type="button"
                onClick={() => setRules((prev) => [...prev, defaultRule()])}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#18ffbe]/60 border border-dashed border-[#18ffbe]/20 rounded-xl hover:bg-[#18ffbe]/[0.05] hover:text-[#18ffbe] transition-colors">
                <Plus className="size-3.5" /> Add another rule
              </button>
            </div>
          )}
        </div>

        {/* Feedback */}
        <div className="text-sm space-y-1">
          {validationError && <p className="text-amber-400">{validationError}</p>}
          {camerasError && <p className="text-red-400">{camerasError}</p>}
          {formError && <p className="text-red-400">{formError}</p>}
          {!formError && !validationError && formSuccess && <p className="text-[#18ffbe]">{formSuccess}</p>}
          {!formError && !validationError && !formSuccess && (
            <p className="text-white/30">
              {points.length === 0
                ? "Click on the canvas to start drawing the zone polygon."
                : points.length < 3
                ? `${points.length} point${points.length !== 1 ? "s" : ""} — need at least 3.`
                : !isFinished
                ? "Click the first point (circle) to close the polygon."
                : "Polygon ready. Fill in the details and create."}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={
            isCreating ||
            points.length < 3 ||
            !isFinished ||
            !selectedCam ||
            camerasLoading ||
            !!camerasError
          }
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#18ffbe] hover:bg-[#18ffbe]/90 text-black font-semibold rounded-lg shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="size-5" />
          {isCreating ? "Creating..." : "Create Zone + Rules"}
        </button>
      </form>
    </div>
  );
}
