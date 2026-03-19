"use client";

import React, { FormEvent, useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { PenTool, Undo2, Trash2, Plus } from "lucide-react";
import type { CreateZonePayload } from "@/lib/mappers/zone.mappers";

type Point = {
  x: number;
  y: number;
};

type DrawZoneProps = {
  onCreateZone: (payload: CreateZonePayload) => Promise<boolean>;
  isCreating: boolean;
  formError: string;
  formSuccess: string;
};

export function DrawZone({
  onCreateZone,
  isCreating,
  formError,
  formSuccess,
}: DrawZoneProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleStageClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (isFinished) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pointerPosition = stage.getPointerPosition();

    if (pointerPosition) {
      setPoints((currentPoints) => [
        ...currentPoints,
        { x: pointerPosition.x, y: pointerPosition.y },
      ]);
    }
  };

  const handleUndo = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
      setIsFinished(false);
    }
  };

  const handleClear = () => {
    setPoints([]);
    setIsFinished(false);
  };

  const flattenPoints = (pts: Point[]) => {
    return pts.reduce((acc: number[], pt) => [...acc, pt.x, pt.y], []);
  };

  const getNormalizedPoints = (pts: Point[]) => {
    if (stageSize.width <= 0 || stageSize.height <= 0) {
      return [];
    }

    return pts.map(
      (point) =>
        [
          Number((point.x / stageSize.width).toFixed(6)),
          Number((point.y / stageSize.height).toFixed(6)),
        ] as [number, number],
    );
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (points.length < 3) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload: CreateZonePayload = {
      name: String(formData.get("name") || "").trim(),
      zone_type: String(formData.get("zone_type") || "security"),
      dwell_threshold_sec: Number(formData.get("dwell_threshold_sec") || 30),
      active: String(formData.get("active")) === "true",
      polygon_coords: getNormalizedPoints(points),
    };

    if (!payload.name || payload.polygon_coords.length < 3) {
      return;
    }

    const created = await onCreateZone(payload);

    if (created) {
      setPoints([]);
      setIsFinished(false);
      formRef.current?.reset();
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-cyan-400"></div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <PenTool className="size-5 text-blue-500" />
              Draw Zone Polygon
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Click to add points. Minimum 3 points required.
            </p>
          </div>
        </div>

        <div
          ref={containerRef}
          className="w-full aspect-video bg-slate-50 rounded-xl border border-slate-200 shadow-inner overflow-hidden cursor-crosshair relative"
        >
          {stageSize.width > 0 && (
            <Stage
              width={stageSize.width}
              height={stageSize.height}
              onClick={handleStageClick}
              onTap={handleStageClick}
            >
              <Layer>
                <Line
                  points={flattenPoints(points)}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  closed={isFinished || (points.length >= 3 && isFinished)}
                  fill={
                    isFinished
                      ? "rgba(59, 130, 246, 0.2)"
                      : "rgba(59, 130, 246, 0.1)"
                  }
                  lineJoin="round"
                />
                {points.map((point, i) => (
                  <React.Fragment key={i}>
                    <Circle
                      x={point.x}
                      y={point.y}
                      radius={
                        i === 0 && points.length > 2 && !isFinished ? 6 : 4
                      }
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      onMouseEnter={(e) => {
                        if (i === 0 && points.length > 2) {
                          e.target.getStage()!.container().style.cursor =
                            "pointer";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.getStage()!.container().style.cursor =
                          "crosshair";
                      }}
                      onClick={() => {
                        if (i === 0 && points.length > 2) {
                          setIsFinished(true);
                        }
                      }}
                    />
                  </React.Fragment>
                ))}
              </Layer>
            </Stage>
          )}
          {points.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-slate-400 font-medium tracking-widest uppercase text-sm select-none">
                Camera Feed Area
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={handleUndo}
            disabled={points.length === 0 || isCreating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-sm font-medium transition-colors text-slate-600 disabled:opacity-50"
          >
            <Undo2 className="size-4" /> Undo
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={points.length === 0 || isCreating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-slate-200 text-sm font-medium transition-colors text-slate-600 disabled:opacity-50"
          >
            <Trash2 className="size-4" /> Clear
          </button>
        </div>

        <div className="w-full h-px bg-slate-100 my-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label
              htmlFor="zone-name"
              className="text-xs font-semibold text-slate-500 tracking-wide uppercase"
            >
              Zone Name
            </label>
            <input
              id="zone-name"
              type="text"
              name="name"
              placeholder="Enter zone name"
              defaultValue="Front Gate"
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-800 transition-all outline-none shadow-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="zone-type"
              className="text-xs font-semibold text-slate-500 tracking-wide uppercase"
            >
              Zone Type
            </label>
            <select
              id="zone-type"
              name="zone_type"
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-800 transition-all outline-none appearance-none shadow-sm"
            >
              <option value="security">Security</option>
              <option value="loitering">Loitering</option>
              <option value="intrusion">Intrusion</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="dwell-threshold"
              className="text-xs font-semibold text-slate-500 tracking-wide uppercase"
            >
              Dwell Threshold (sec)
            </label>
            <input
              id="dwell-threshold"
              type="number"
              name="dwell_threshold_sec"
              placeholder="30"
              defaultValue="30"
              min="0"
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-800 transition-all outline-none shadow-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="status"
              className="text-xs font-semibold text-slate-500 tracking-wide uppercase"
            >
              Status
            </label>
            <select
              id="status"
              name="active"
              defaultValue="true"
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-800 transition-all outline-none appearance-none shadow-sm"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {(formError || formSuccess || points.length < 3) && (
          <div className="mt-4 text-sm">
            {formError ? <p className="text-red-600">{formError}</p> : null}
            {!formError && formSuccess ? (
              <p className="text-green-600">{formSuccess}</p>
            ) : null}
            {!formError && !formSuccess && points.length < 3 ? (
              <p className="text-slate-500">
                Add at least 3 points before creating a zone.
              </p>
            ) : null}
          </div>
        )}

        <button
          type="submit"
          disabled={isCreating || points.length < 3}
          className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-all border border-blue-600 disabled:opacity-50"
        >
          <Plus className="size-5" />
          {isCreating ? "Creating..." : "Create Zone"}
        </button>
      </form>
    </div>
  );
}
