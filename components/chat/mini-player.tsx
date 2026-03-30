"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function MiniPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }
    if (!Hls.isSupported()) return;
    const hls = new Hls({ enableWorker: true });
    hlsRef.current = hls;
    hls.loadSource(src);
    hls.attachMedia(video);
    return () => { hls.destroy(); };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      controls
      playsInline
      muted
    />
  );
}
