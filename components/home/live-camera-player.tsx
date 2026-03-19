"use client";

import React, { useEffect, useRef } from "react";

import { attachLiveStream } from "@/lib/client-services/live-stream.service";

export type BboxDetection = {
  event_id: string;
  object_class: string;
  confidence: number;
  threat_level: string | null;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  frame_w: number;
  frame_h: number;
  ts: number; // Date.now() when received
};

type LiveCameraPlayerProps = {
  cameraId: string;
  name: string;
  streamPath: string;
  detections?: BboxDetection[];
};

const THREAT_COLOR: Record<string, string> = {
  HIGH:    "#ef4444",
  MEDIUM:  "#f97316",
  LOW:     "#eab308",
  PENDING: "#3b82f6",
};

const BBOX_TTL_MS = 3000; // fade out after 3 s

function getBboxColor(level: string | null) {
  return THREAT_COLOR[level ?? ""] ?? THREAT_COLOR.PENDING;
}

export function LiveCameraPlayer({
  cameraId,
  name,
  streamPath,
  detections = [],
}: LiveCameraPlayerProps) {
  const videoRef  = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef    = useRef<number>(0);
  const [state, setState] = React.useState<"connecting" | "live" | "error">("connecting");

  // Attach HLS stream
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    attachLiveStream(video, streamPath, {
      onConnecting: () => { if (!disposed) setState("connecting"); },
      onLive:       () => { if (!disposed) setState("live"); },
      onError:      () => { if (!disposed) setState("error"); },
    }).then((dispose) => {
      if (disposed) { dispose(); return; }
      cleanup = dispose;
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [streamPath]);

  // Canvas bbox drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video) return;

    function draw() {
      rafRef.current = requestAnimationFrame(draw);

      const ctx = canvas!.getContext("2d");
      if (!ctx) return;

      // Keep canvas size in sync with video element
      const cW = video!.offsetWidth;
      const cH = video!.offsetHeight;
      if (canvas!.width !== cW || canvas!.height !== cH) {
        canvas!.width  = cW;
        canvas!.height = cH;
      }

      ctx.clearRect(0, 0, cW, cH);

      const now     = Date.now();
      const live    = detections.filter((d) => now - d.ts < BBOX_TTL_MS);
      if (live.length === 0) return;

      for (const det of live) {
        const age   = (now - det.ts) / BBOX_TTL_MS;   // 0 → 1
        const alpha = Math.max(0, 1 - age);

        // Scale bbox from YOLO frame space → video display space (object-cover)
        const fW = det.frame_w || 640;
        const fH = det.frame_h || 480;
        const scale = Math.max(cW / fW, cH / fH);
        const ox = (cW - fW * scale) / 2;
        const oy = (cH - fH * scale) / 2;

        const rx = det.x1 * scale + ox;
        const ry = det.y1 * scale + oy;
        const rw = (det.x2 - det.x1) * scale;
        const rh = (det.y2 - det.y1) * scale;

        const color = getBboxColor(det.threat_level);
        ctx.globalAlpha = alpha;

        // Box
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.strokeRect(rx, ry, rw, rh);

        // Label background + text
        const label = `${det.object_class} ${Math.round(det.confidence * 100)}%`;
        ctx.font = "bold 11px sans-serif";
        const textW = ctx.measureText(label).width;
        const labelH = 16;
        const lx = Math.max(0, rx);
        const ly = Math.max(labelH, ry);

        ctx.fillStyle = color;
        ctx.fillRect(lx, ly - labelH, textW + 8, labelH);
        ctx.fillStyle = "#fff";
        ctx.fillText(label, lx + 4, ly - 4);

        ctx.globalAlpha = 1;
      }
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [detections]);

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        className="h-full w-full bg-black object-cover"
        muted
        autoPlay
        playsInline
      />

      {/* Bbox overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />

      {state !== "live" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 text-white">
          <div>
            <p className="text-sm font-semibold">{name || cameraId}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              {state === "error" ? "Stream unavailable" : "Connecting to live stream"}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
