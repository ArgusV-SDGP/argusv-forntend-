"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Camera as CameraIcon,
  Circle,
  Maximize,
  MonitorPlay,
  Play,
  Tag,
} from "lucide-react";

import type { CameraGridItem } from "@/lib/mappers/cam.mappers";
import { LiveCameraPlayer, type BboxDetection } from "./live-camera-player";

type MainCameraGridClientProps = {
  cameras: CameraGridItem[];
};

const WS_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:8000")
  .replace(/^http/, "ws") + "/ws/alerts";

const BBOX_TTL_MS = 3000;

export function MainCameraGridClient({ cameras }: MainCameraGridClientProps) {
  // camera_id → list of active detections with TTL
  const [bboxMap, setBboxMap] = useState<Record<string, BboxDetection[]>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = (evt) => {
        if (cancelled) return;
        try {
          const msg = JSON.parse(evt.data as string);
          if (msg.type !== "fast_alert") return;

          const bbox = msg.bbox as { x1: number; y1: number; x2: number; y2: number } | undefined;
          if (!bbox || !msg.camera_id) return;

          const det: BboxDetection = {
            event_id:    msg.event_id ?? String(Math.random()),
            object_class: msg.object_class ?? "object",
            confidence:  msg.confidence ?? 0,
            threat_level: msg.threat_level ?? null,
            x1: bbox.x1,
            y1: bbox.y1,
            x2: bbox.x2,
            y2: bbox.y2,
            frame_w: msg.frame_w ?? 640,
            frame_h: msg.frame_h ?? 480,
            ts: Date.now(),
          };

          setBboxMap((prev) => {
            const now = Date.now();
            const existing = (prev[msg.camera_id] ?? []).filter(
              (d) => now - d.ts < BBOX_TTL_MS && d.event_id !== det.event_id
            );
            return { ...prev, [msg.camera_id]: [...existing, det] };
          });
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        if (!cancelled) reconnectRef.current = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
    }

    connect();

    // Periodic cleanup of expired bboxes
    const cleanup = setInterval(() => {
      const now = Date.now();
      setBboxMap((prev) => {
        const next: Record<string, BboxDetection[]> = {};
        for (const [cam, dets] of Object.entries(prev)) {
          const live = dets.filter((d) => now - d.ts < BBOX_TTL_MS);
          if (live.length > 0) next[cam] = live;
        }
        return next;
      });
    }, 500);

    return () => {
      cancelled = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      clearInterval(cleanup);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-max lg:grid-rows-3 gap-2 lg:h-full lg:min-h-[600px]">
      {cameras.map((cam, idx) => {
        const isOnline = cam.status.toLowerCase() === "online";

        return (
          <div
            key={cam.cameraId + idx}
            className={`relative bg-black rounded-lg overflow-hidden border-2 flex flex-col group min-h-[250px] lg:min-h-0 text-left ${
              cam.active ? "border-yellow-400" : "border-slate-800"
            } ${cam.span}`}
          >
            <div
              className={`absolute top-0 left-0 right-0 p-2 flex justify-between text-xs font-bold z-10 bg-gradient-to-b from-black/80 to-transparent ${
                cam.active ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Play
                  className={`size-3 fill-current ${
                    isOnline ? "text-green-500" : "text-gray-400"
                  }`}
                />
                <span>{cam.name}</span>
              </div>
              <span>{cam.fps} FPS</span>
            </div>

            <div className="flex-1 w-full bg-slate-900 flex flex-col items-center justify-center gap-3 px-4 text-center">
              {isOnline ? (
                <LiveCameraPlayer
                  cameraId={cam.cameraId}
                  name={cam.name}
                  streamPath={cam.streamPath}
                  detections={bboxMap[cam.cameraId] ?? []}
                />
              ) : (
                <div className="text-white">
                  <p className="text-sm font-semibold">{cam.cameraId}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    Stream {cam.liveStreamId}
                  </p>
                </div>
              )}
            </div>

            <div className="absolute left-3 bottom-3 rounded-md bg-black/75 px-3 py-2 text-left text-xs text-white backdrop-blur-sm">
              <p className="font-semibold text-white">{cam.name}</p>
              <p
                className={`mt-1 font-medium ${
                  isOnline ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                Status: {cam.status}
              </p>
              <p className={`${cam.active ? "text-yellow-400" : "text-slate-300"}`}>
                Active: {cam.active ? "Yes" : "No"}
              </p>
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-md flex items-center gap-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Tag className="size-4 hover:text-yellow-400 cursor-pointer transition-colors" />
              <CameraIcon className="size-4 hover:text-yellow-400 cursor-pointer transition-colors" />
              <Circle className="size-4 hover:text-red-500 cursor-pointer text-red-500 transition-colors" />
              <div className="w-px h-4 bg-gray-600 mx-1"></div>
              <MonitorPlay className="size-4 hover:text-yellow-400 cursor-pointer transition-colors" />
              <Maximize className="size-4 hover:text-yellow-400 cursor-pointer transition-colors" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
