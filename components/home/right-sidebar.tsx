"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Activity, ChevronDown, Radio, Send, Share2, Wifi } from "lucide-react";

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
  if (level === "HIGH")   return "bg-red-500 text-white";
  if (level === "MEDIUM") return "bg-orange-400 text-white";
  if (level === "LOW")    return "bg-yellow-400 text-black";
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
            // Update existing alert with VLM result
            setAlerts((prev) =>
              prev.map((a) =>
                a.event_id === msg.event_id
                  ? { ...a, threat_level: msg.threat_level, summary: msg.summary, status: "complete" }
                  : a
              )
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
    <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col lg:h-full lg:overflow-hidden min-h-0">

      {/* Connection status + actions */}
      <div className="p-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-500 tracking-wider flex items-center gap-1">
            <ChevronDown className="size-3" /> ACTIONS
          </h2>
          <span className={`flex items-center gap-1 text-[10px] font-bold ${connected ? "text-emerald-500" : "text-rose-400"}`}>
            <Wifi className="size-3" />
            {connected ? "LIVE" : "RECONNECTING"}
          </span>
        </div>
        <div className="space-y-3 px-1">
          <button className="flex items-center gap-3 text-sm font-bold text-gray-600 hover:text-black transition-colors w-full">
            <Send className="size-4 text-gray-400" />
            SEND MESSAGE
          </button>
          <button className="flex items-center gap-3 text-sm font-bold text-gray-600 hover:text-black transition-colors w-full">
            <Share2 className="size-4 text-gray-400" />
            SHARE VIEW
          </button>
        </div>
      </div>

      {/* Live alerts feed */}
      <div className="p-4 flex-1 overflow-y-auto min-h-0">
        <h2 className="text-xs font-bold text-gray-500 mb-2 tracking-wider flex items-center gap-1 shrink-0">
          <Radio className="size-3" /> LIVE ALERTS
          {alerts.length > 0 && (
            <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              {alerts.length}
            </span>
          )}
        </h2>

        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Activity className="size-6 mb-2 opacity-40" />
            <p className="text-xs">Waiting for detections...</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-md border border-gray-100 bg-slate-50 p-2 text-left hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <AlertTriangle className="size-3 shrink-0 text-gray-400" />
                    <span className="text-xs font-bold text-gray-800 truncate uppercase">
                      {alert.object_class ?? "Object"}
                    </span>
                  </div>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold ${threatColor(alert.threat_level)}`}>
                    {threatLabel(alert.threat_level)}
                  </span>
                </div>

                {alert.zone_name && (
                  <p className="mt-0.5 text-[10px] text-yellow-600 font-semibold truncate">
                    {alert.zone_name}
                  </p>
                )}

                {alert.camera_id && (
                  <p className="text-[10px] text-gray-500 truncate">{alert.camera_id}</p>
                )}

                {alert.summary && (
                  <p className="mt-1 text-[10px] text-gray-600 line-clamp-2 leading-snug">
                    {alert.summary}
                  </p>
                )}

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
