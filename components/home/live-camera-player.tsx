"use client";

import React from "react";

import { attachLiveStream } from "@/lib/client-services/live-stream.service";

type LiveCameraPlayerProps = {
  cameraId: string;
  name: string;
  streamPath: string;
};

export function LiveCameraPlayer({
  cameraId,
  name,
  streamPath,
}: LiveCameraPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [state, setState] = React.useState<"connecting" | "live" | "error">(
    "connecting",
  );

  React.useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    attachLiveStream(video, streamPath, {
      onConnecting: () => {
        if (!disposed) {
          setState("connecting");
        }
      },
      onLive: () => {
        if (!disposed) {
          setState("live");
        }
      },
      onError: () => {
        if (!disposed) {
          setState("error");
        }
      },
    }).then((dispose) => {
      if (disposed) {
        dispose();
        return;
      }

      cleanup = dispose;
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [streamPath]);

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        className="h-full w-full bg-black object-cover"
        muted
        autoPlay
        playsInline
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
