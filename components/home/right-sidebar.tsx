"use client";

import React, { useEffect, useRef, useState } from "react";
import { Activity, AlertTriangle, Radio, Wifi } from "lucide-react";

const WS_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:8000")
  .replace(/^http/, "ws") + "/ws/alerts";

type Alert = {
  id: string;
  type: "fast_alert" | "vlm_update";
  event_id?: string;
  camera_id?: string;
  zone_name?: string;
  object_class?: string;
  threat_level?: string | null;
  summary?: string;
  status?: string;
  timestamp: number;
};

function threatColor(level?: string | null) {
  if (level === "HIGH") return "bg-red-500 text-white";
  if (level === "MEDIUM") return "bg-orange-400 text-white";
  if (level === "LOW") return "bg-yellow-400 text-black";
  return "bg-blue-500 text-white";
}

function threatLabel(level?: string | null) {
  return level ?? "PENDING";
}

const MAX_ALERTS = 60;

export function RightSidebar() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!cancelled) setConnected(true);
      };

      ws.onmessage = (evt) => {
        if (cancelled) return;
        try {
          const msg = JSON.parse(evt.data as string) as Omit<Alert, "id" | "timestamp">;
          const type = msg.type as "fast_alert" | "vlm_update";

          if (type === "vlm_update") {
            setAlerts((prev) =>
              prev.map((alert) =>
                alert.event_id === msg.event_id
                  ? {
                      ...alert,
                      threat_level: msg.threat_level,
                      summary: msg.summary,
                      status: "complete",
                    }
                  : alert,
              ),
            );
            return;
          }

          if (type === "fast_alert") {
            const alert: Alert = {
              id: `${msg.event_id ?? ""}-${Date.now()}`,
              type,
              event_id: msg.event_id,
              camera_id: msg.camera_id,
              zone_name: msg.zone_name,
              object_class: msg.object_class,
              threat_level: msg.threat_level,
              summary: msg.summary,
              status: msg.status,
              timestamp: Date.now(),
            };
            setAlerts((prev) => [alert, ...prev].slice(0, MAX_ALERTS));
          }
        } catch {
          // ignore malformed message
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        setConnected(false);
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);

  return (
    <div className="flex min-h-0 w-full flex-col border-t border-gray-200 bg-white lg:h-full lg:w-80 lg:overflow-hidden lg:border-l lg:border-t-0">
      <div className="shrink-0 border-b border-gray-100 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-1 text-xs font-bold tracking-wider text-gray-500">
              <Radio className="size-3" /> LIVE ALERTS
            </h2>
            <p className="mt-2 text-xs text-gray-400">
              Realtime detections from connected cameras appear here.
            </p>
          </div>
          <span
            className={`flex items-center gap-1 text-[10px] font-bold ${
              connected ? "text-emerald-500" : "text-rose-400"
            }`}
          >
            <Wifi className="size-3" />
            {connected ? "LIVE" : "RECONNECTING"}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <h2 className="mb-2 flex items-center gap-1 text-xs font-bold tracking-wider text-gray-500">
          <Radio className="size-3" /> RECENT EVENTS
          {alerts.length > 0 ? (
            <span className="ml-auto rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
              {alerts.length}
            </span>
          ) : null}
        </h2>

        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Activity className="mb-2 size-6 opacity-40" />
            <p className="text-xs">Waiting for detections...</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-md border border-gray-100 bg-slate-50 p-2 text-left transition-colors hover:bg-slate-100"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <AlertTriangle className="size-3 shrink-0 text-gray-400" />
                    <span className="truncate text-xs font-bold uppercase text-gray-800">
                      {alert.object_class ?? "Object"}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${threatColor(alert.threat_level)}`}
                  >
                    {threatLabel(alert.threat_level)}
                  </span>
                </div>

                {alert.zone_name ? (
                  <p className="mt-0.5 truncate text-[10px] font-semibold text-yellow-600">
                    {alert.zone_name}
                  </p>
                ) : null}

                {alert.camera_id ? (
                  <p className="truncate text-[10px] text-gray-500">{alert.camera_id}</p>
                ) : null}

                {alert.summary ? (
                  <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-gray-600">
                    {alert.summary}
                  </p>
                ) : null}

                <p className="mt-1 text-[9px] text-gray-400">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
