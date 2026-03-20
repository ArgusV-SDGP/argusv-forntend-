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
  zones?: {
    zone_id: string;
    name: string;
    polygon_coords: [number, number][];
    camera_id?: string | null;
    bbox_norm?: Record<string, number | null> | null;
    bbox_px?: Record<string, number | null> | null;
  }[];
  frameSize?: { width: number; height: number } | null;
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

function getBBoxRect(
  bbox: Record<string, number | null> | null | undefined,
): { x: number; y: number; w: number; h: number } | null {
  if (!bbox) return null;

  const x = bbox.x ?? bbox.left ?? bbox.x1;
  const y = bbox.y ?? bbox.top ?? bbox.y1;
  const w = bbox.w ?? bbox.width;
  const h = bbox.h ?? bbox.height;

  if (
    typeof x === "number" &&
    typeof y === "number" &&
    typeof w === "number" &&
    typeof h === "number"
  ) {
    return { x, y, w, h };
  }

  const x1 = bbox.x1;
  const y1 = bbox.y1;
  const x2 = bbox.x2;
  const y2 = bbox.y2;
  if (
    typeof x1 === "number" &&
    typeof y1 === "number" &&
    typeof x2 === "number" &&
    typeof y2 === "number"
  ) {
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }

  return null;
}

export function LiveCameraPlayer({
  cameraId,
  name,
  streamPath,
  detections = [],
  zones = [],
  frameSize = null,
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
      const baseFrameW = frameSize?.width ?? 640;
      const baseFrameH = frameSize?.height ?? 480;
      const baseScale = Math.max(cW / baseFrameW, cH / baseFrameH);
      const baseOx = (cW - baseFrameW * baseScale) / 2;
      const baseOy = (cH - baseFrameH * baseScale) / 2;

      if (zones.length > 0) {
        ctx.save();
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        zones.forEach((zone, index) => {
          const points = zone.polygon_coords ?? [];

          const hue = (index * 67) % 360;
          const stroke = `hsla(${hue}, 95%, 62%, 1)`;
          const fill = `hsla(${hue}, 95%, 55%, 0.2)`;
          let labelX = 8;
          let labelY = 20 + index * 18;

          if (points.length >= 3) {
            ctx.beginPath();
            points.forEach(([x, y], pointIndex) => {
              const px = x * baseScale + baseOx;
              const py = y * baseScale + baseOy;
              if (pointIndex === 0) {
                ctx.moveTo(px, py);
              } else {
                ctx.lineTo(px, py);
              }
            });
            ctx.closePath();

            ctx.fillStyle = fill;
            ctx.fill();
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 2;
            ctx.stroke();

            const [firstX, firstY] = points[0];
            labelX = firstX * baseScale + baseOx + 6;
            labelY = firstY * baseScale + baseOy + 16;
          }

          const pxRect = getBBoxRect(zone.bbox_px);
          if (pxRect) {
            const rx = pxRect.x * baseScale + baseOx;
            const ry = pxRect.y * baseScale + baseOy;
            const rw = pxRect.w * baseScale;
            const rh = pxRect.h * baseScale;
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(rx, ry, rw, rh);
            ctx.setLineDash([]);
            labelX = rx + 6;
            labelY = ry + 16;
          } else {
            const normRect = getBBoxRect(zone.bbox_norm);
            if (normRect) {
              // bbox_norm coordinates are normalized to the base frame size.
              // Convert to base-frame pixels, then apply object-cover scaling + letterboxing.
              const rx = normRect.x * baseFrameW * baseScale + baseOx;
              const ry = normRect.y * baseFrameH * baseScale + baseOy;
              const rw = normRect.w * baseFrameW * baseScale;
              const rh = normRect.h * baseFrameH * baseScale;
              ctx.strokeStyle = stroke;
              ctx.lineWidth = 2;
              ctx.setLineDash([6, 4]);
              ctx.strokeRect(rx, ry, rw, rh);
              ctx.setLineDash([]);
              labelX = rx + 6;
              labelY = ry + 16;
            }
          }

          const label = zone.name || zone.zone_id;
          ctx.font = "600 11px sans-serif";
          const textW = ctx.measureText(label).width;
          ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
          ctx.fillRect(labelX - 4, labelY - 12, textW + 8, 16);
          ctx.fillStyle = stroke;
          ctx.fillText(label, labelX, labelY);
        });

        ctx.restore();
      }

      const live = detections.filter((d) => now - d.ts < BBOX_TTL_MS);
      if (live.length === 0) return;

      for (const det of live) {
        const age   = (now - det.ts) / BBOX_TTL_MS;   // 0 → 1
        const alpha = Math.max(0, 1 - age);

        // Scale bbox from YOLO frame space → video display space (object-cover)
        const fW = det.frame_w || baseFrameW;
        const fH = det.frame_h || baseFrameH;
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
  }, [detections, frameSize, zones]);

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
