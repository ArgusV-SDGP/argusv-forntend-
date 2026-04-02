"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Eye, RefreshCw, Radio, AlertCircle } from "lucide-react";
import { authFetch } from "@/lib/client-services/auth.service";

const POLL_INTERVAL_MS = 2000;

export function BirdseyePageContent() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchFrame = useCallback(async () => {
    try {
      const res = await authFetch("/api/birdseye");
      if (!res.ok) {
        setError(
          res.status === 503
            ? "Birdseye renderer is not ready — the detection pipeline may still be starting."
            : `Server returned ${res.status}`,
        );
        setLoading(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImgSrc((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setLastUpdated(new Date());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch frame");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFrame();
  }, [fetchFrame]);

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(fetchFrame, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, fetchFrame]);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (imgSrc) URL.revokeObjectURL(imgSrc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0a] p-4 font-sans text-white md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Eye className="size-5 text-[#18ffbe]" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Birdseye View
            </h1>
          </div>
          <p className="mt-1 text-sm text-white/50">
            Live composite overview — all camera zones and active tracked objects
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live / Paused pill */}
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              paused
                ? "border-white/10 bg-white/[0.04] text-white/40 hover:text-white/70"
                : "border-[#18ffbe]/20 bg-[#18ffbe]/[0.08] text-[#18ffbe] hover:bg-[#18ffbe]/[0.14]"
            }`}
          >
            <Radio
              className={`size-3 ${paused ? "" : "animate-pulse"}`}
            />
            {paused ? "Paused" : `Live · ${POLL_INTERVAL_MS / 1000}s`}
          </button>

          {/* Manual refresh */}
          <button
            type="button"
            onClick={() => fetchFrame()}
            title="Refresh now"
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <RefreshCw className="size-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Frame container */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        {loading && !imgSrc ? (
          /* Initial loading state */
          <div className="flex h-64 items-center justify-center md:h-[540px]">
            <div className="flex flex-col items-center gap-3 text-white/25">
              <Camera className="size-10" />
              <span className="text-sm">Initialising renderer…</span>
            </div>
          </div>
        ) : imgSrc ? (
          <img
            src={imgSrc}
            alt="Birdseye overview of all camera zones"
            className="w-full"
            style={{ imageRendering: "crisp-edges", display: "block" }}
          />
        ) : null}
      </div>

      {/* Footer meta */}
      <div className="mt-3 flex items-center justify-between">
        {lastUpdated ? (
          <span className="flex items-center gap-1.5 text-xs text-white/30">
            <RefreshCw className="size-3" />
            Last updated {lastUpdated.toLocaleTimeString()}
          </span>
        ) : (
          <span />
        )}
        <span className="text-xs text-white/20">
          Polling every {POLL_INTERVAL_MS / 1000}s · GET /api/birdseye
        </span>
      </div>
    </div>
  );
}
