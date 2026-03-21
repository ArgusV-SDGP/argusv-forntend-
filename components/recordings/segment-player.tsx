"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

type SegmentPlayerProps = {
  playlistUrl: string;
};

export function SegmentPlayer({ playlistUrl }: SegmentPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playlistUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playlistUrl;
      video.play().catch(() => {});
      return;
    }

    if (!Hls.isSupported()) return;

    const hls = new Hls({ enableWorker: true });
    hlsRef.current = hls;
    hls.loadSource(playlistUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {});
    });

    return () => {
      hls.destroy();
    };
  }, [playlistUrl]);

  return <video ref={videoRef} className="aspect-video w-full rounded-lg bg-black" controls playsInline />;
}
