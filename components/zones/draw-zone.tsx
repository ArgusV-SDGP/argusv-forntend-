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
  { value: "HIGH",   label: "High",   cls: "text-red-600 bg-red-50 border-red-200" },
  { value: "MEDIUM", label: "Medium", cls: "text-orange-600 bg-orange-50 border-orange-200" },
  { value: "LOW",    label: "Low",    cls: "text-yellow-600 bg-yellow-50 border-yellow-200" },
];

const OBJECT_CLASSES = ["person", "car", "truck", "bus", "motorcycle"];

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
  // null = allow all globally configured classes; non-empty array = restrict to these
  const [allowedClasses, setAllowedClasses] = useState<string[]>([]);
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

  // Resize observer for the canvas container
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

  // Attach live HLS stream when camera changes
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

  // Rule helpers
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

    if (camerasError) {
      setValidationError(camerasError);
      return;
    }

    if (!zoneName.trim()) {
      setValidationError("Zone name is required.");
      return;
    }
    if (!selectedCam) {
      setValidationError("Please select a camera to create this zone.");
      return;
    }
    if (!cameras.some((c) => c.camera_id === selectedCam)) {
      setValidationError("Invalid camera selection.");
      return;
    }
    if (points.length < 3) {
      setValidationError("Draw at least 3 points on the canvas.");
      return;
    }
    if (!isFinished) {
      setValidationError("Close the polygon first by clicking the first point.");
      return;
    }

    const zonePayload: CreateZonePayload = {
      camera_id: selectedCam,
      name: zoneName.trim(),
      zone_type: zoneType,
      dwell_threshold_sec: Math.max(1, dwellSec),
      active: zoneActive,
      polygon_coords: getNormalizedPoints(points),
      // empty [] means "allow all" — send null; non-empty sends the filter list
      allowed_classes: allowedClasses.length > 0 ? allowedClasses : null,
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
      setAllowedClasses([]);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header + camera selector */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <PenTool className="size-5 text-blue-500" />
              Draw Zone Polygon
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a camera, draw a polygon on the preview. Min 3 points.
            </p>
          </div>

          {/* Camera preview selector */}
          <div className="flex items-center gap-2">
            <Camera className="size-4 text-slate-400 shrink-0" />
            <select
              value={selectedCam}
              onChange={(e) => setSelectedCam(e.target.value)}
              disabled={camerasLoading || !!camerasError}
              className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] disabled:opacity-50"
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
          className="w-full aspect-video bg-slate-900 rounded-xl border border-slate-200 shadow-inner overflow-hidden cursor-crosshair relative"
        >
          {/* Live camera feed background */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            muted
            autoPlay
            playsInline
          />

          {/* Konva drawing layer on top */}
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
                  stroke="#22d3ee"
                  strokeWidth={2}
                  closed={isFinished}
                  fill={isFinished ? "rgba(34,211,238,0.15)" : "rgba(34,211,238,0.08)"}
                  lineJoin="round"
                />
                {points.map((pt, i) => (
                  <React.Fragment key={i}>
                    <Circle
                      x={pt.x} y={pt.y}
                      radius={i === 0 && points.length > 2 && !isFinished ? 7 : 4}
                      fill="white" stroke="#22d3ee" strokeWidth={2}
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
              <span className="text-slate-400 font-medium tracking-widest uppercase text-sm select-none bg-black/40 px-3 py-1 rounded-full">
                {selectedCam ? "Click to draw zone" : "Select a camera above"}
              </span>
            </div>
          )}
        </div>

        {/* Canvas controls */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { setPoints(points.slice(0, -1)); setIsFinished(false); }}
            disabled={points.length === 0 || isCreating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-50">
            <Undo2 className="size-4" /> Undo
          </button>
          <button type="button" onClick={() => { setPoints([]); setIsFinished(false); }}
            disabled={points.length === 0 || isCreating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-50">
            <Trash2 className="size-4" /> Clear
          </button>
          {points.length >= 3 && !isFinished && (
            <button type="button" onClick={() => setIsFinished(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-sm font-medium text-cyan-700">
              Close polygon
            </button>
          )}
          <span className="ml-auto text-xs text-slate-400">{points.length} point{points.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="w-full h-px bg-slate-100" />

        {/* Zone metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Zone Name *</label>
            <input
              type="text"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="Front Gate"
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-800 outline-none shadow-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Zone Type</label>
            <select
              value={zoneType}
              onChange={(e) => setZoneType(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-800 outline-none appearance-none shadow-sm"
            >
              <option value="security">Security</option>
              <option value="loitering">Loitering</option>
              <option value="intrusion">Intrusion</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Dwell Threshold (sec)</label>
            <input
              type="number"
              value={dwellSec}
              onChange={(e) => setDwellSec(Math.max(1, Number(e.target.value)))}
              min="1"
              className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-800 outline-none shadow-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Status</label>
            <select
              value={String(zoneActive)}
              onChange={(e) => setZoneActive(e.target.value === "true")}
              className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-800 outline-none appearance-none shadow-sm"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Zone-level object class filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase flex items-center gap-1.5">
            Allowed Object Classes
            <span className="text-[10px] font-normal text-slate-400 normal-case tracking-normal">
              (leave empty = all classes; select to restrict this zone)
            </span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {OBJECT_CLASSES.map((cls) => {
              const active = allowedClasses.includes(cls);
              return (
                <button key={cls} type="button"
                  onClick={() => setAllowedClasses((prev) =>
                    active ? prev.filter((c) => c !== cls) : [...prev, cls]
                  )}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-colors ${
                    active
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                  }`}>
                  {cls}
                </button>
              );
            })}
          </div>
          {allowedClasses.length > 0 && (
            <p className="text-[10px] text-teal-700 bg-teal-50 border border-teal-100 rounded px-2 py-1">
              Only <strong>{allowedClasses.join(", ")}</strong> will trigger alerts in this zone.
            </p>
          )}
        </div>

        {/* Threat Rules section */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button type="button"
            onClick={() => setShowRules((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-sm font-semibold text-slate-700 transition-colors">
            <span className="flex items-center gap-2">
              <Shield className="size-4 text-indigo-500" />
              Threat Rules
              <span className="text-xs font-normal text-slate-400">({rules.length} rule{rules.length !== 1 ? "s" : ""})</span>
            </span>
            {showRules ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
          </button>

          {showRules && (
            <div className="p-4 space-y-4">
              {rules.map((rule, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-white space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5 text-orange-400" /> Rule {idx + 1}
                    </span>
                    {rules.length > 1 && (
                      <button type="button"
                        onClick={() => setRules((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50">
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Trigger */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Trigger</label>
                      <select value={rule.trigger_type}
                        onChange={(e) => updateRule(idx, { trigger_type: e.target.value })}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        {TRIGGER_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Severity */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Threat Level</label>
                      <div className="flex gap-1.5">
                        {SEVERITY_OPTIONS.map((s) => (
                          <button key={s.value} type="button"
                            onClick={() => updateRule(idx, { severity: s.value })}
                            className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition-colors ${
                              rule.severity === s.value ? s.cls : "text-slate-400 bg-white border-slate-200 hover:border-slate-300"
                            }`}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Action</label>
                      <select value={rule.action}
                        onChange={(e) => updateRule(idx, { action: e.target.value })}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="ALERT">Alert (notify + log)</option>
                        <option value="MONITOR">Monitor (log only)</option>
                        <option value="IGNORE">Ignore</option>
                      </select>
                    </div>

                    {/* Min confidence */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                        Min Confidence ({Math.round(rule.min_confidence * 100)}%)
                      </label>
                      <input type="range" min="0.1" max="0.99" step="0.05"
                        value={rule.min_confidence}
                        onChange={(e) => updateRule(idx, { min_confidence: parseFloat(e.target.value) })}
                        className="w-full accent-blue-500" />
                    </div>
                  </div>

                  {/* Object classes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Monitor Objects</label>
                    <div className="flex gap-2">
                      {OBJECT_CLASSES.map((cls) => {
                        const active = rule.object_classes.includes(cls);
                        return (
                          <button key={cls} type="button"
                            onClick={() => toggleObjectClass(idx, cls)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-colors ${
                              active
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
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
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-indigo-600 border border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors">
                <Plus className="size-3.5" /> Add another rule
              </button>
            </div>
          )}
        </div>

        {/* Feedback */}
        <div className="text-sm space-y-1">
          {validationError && <p className="text-amber-600">{validationError}</p>}
          {camerasError && <p className="text-red-600">{camerasError}</p>}
          {formError && <p className="text-red-600">{formError}</p>}
          {!formError && !validationError && formSuccess && <p className="text-green-600">{formSuccess}</p>}
          {!formError && !validationError && !formSuccess && (
            <p className="text-slate-400">
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
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="size-5" />
          {isCreating ? "Creating..." : "Create Zone + Rules"}
        </button>
      </form>
    </div>
  );
}
