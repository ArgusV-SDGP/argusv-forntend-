"use client";

import Hls from "hls.js";
import { useEffect, useRef } from "react";
import { getAccessToken } from "@/lib/client-services/auth.service";
import { BboxOverlay } from "./bbox-overlay";
import { DetectionMarker } from "./types";

export function DayPlayer({
  playlistUrl, seekTo, bboxMarker, onBboxExpire,
}: {
  playlistUrl: string;
  seekTo: number | null;
  bboxMarker: DetectionMarker | null;
  onBboxExpire: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const pendingSeek = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playlistUrl) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playlistUrl; return;
    }
    if (!Hls.isSupported()) return;

    const token = getAccessToken();
    const hls = new Hls({
      enableWorker: true,
      ...(token && {
        xhrSetup(xhr) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        },
      }),
    });
    hlsRef.current = hls;
    hls.loadSource(playlistUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (pendingSeek.current !== null) {
        video.currentTime = pendingSeek.current;
        pendingSeek.current = null;
      }
      video.play().catch(() => {});
    });
    return () => { hls.destroy(); };
  }, [playlistUrl]);

  useEffect(() => {
    if (seekTo === null) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState >= 1) { video.currentTime = seekTo; video.play().catch(() => {}); }
    else { pendingSeek.current = seekTo; }
  }, [seekTo]);

  return (
    <div className="relative w-full aspect-video bg-black overflow-hidden">
      <video ref={videoRef} className="absolute inset-0 w-full h-full" controls playsInline />
      {bboxMarker && (
        <BboxOverlay key={bboxMarker.detection_id} marker={bboxMarker} onExpire={onBboxExpire} />
      )}
    </div>
  );
}
