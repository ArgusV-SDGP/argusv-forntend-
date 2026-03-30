"use client";

import { useState } from "react";
import { Camera, MapPin, Play, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/client-services/auth.service";
import { SourceClip } from "./types";
import { THREAT_BADGE, formatTs, relevanceLabel } from "./helpers";
import MiniPlayer from "./mini-player";

export default function SourceCard({ clip }: { clip: SourceClip }) {
  const [showVideo, setShowVideo] = useState(false);
  const rel = relevanceLabel(clip.distance);
  const tBadge = THREAT_BADGE[clip.threat_level ?? ""] ?? THREAT_BADGE.LOW;
  const playlistSrc = clip.playlist_url ? `${API_BASE_URL}${clip.playlist_url}` : null;

  return (
    <div className="border border-white/[0.08] bg-white/[0.04] rounded-xl hover:border-white/[0.14] transition-colors overflow-hidden">

      {/* Video / Thumbnail area */}
      <div className="relative w-full h-32 bg-black">
        {showVideo && playlistSrc ? (
          <MiniPlayer src={playlistSrc} />
        ) : clip.thumbnail_url ? (
          <img
            src={`${API_BASE_URL}${clip.thumbnail_url}`}
            alt="Detection snapshot"
            className="w-full h-full object-cover opacity-80"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="size-7 text-white/20" />
          </div>
        )}

        {playlistSrc && !showVideo && (
          <button
            type="button"
            onClick={() => setShowVideo(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-colors group"
          >
            <div className="size-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform backdrop-blur-sm">
              <Play className="size-4 text-white ml-0.5" />
            </div>
          </button>
        )}
        {showVideo && (
          <button
            type="button"
            onClick={() => setShowVideo(false)}
            className="absolute top-1 right-1 size-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs font-semibold text-white/60 flex items-center gap-1">
            <Camera className="size-3" />{clip.camera_id}
          </span>
          {clip.zone_name && (
            <span className="text-xs text-white/40 flex items-center gap-1">
              <MapPin className="size-3" />{clip.zone_name}
            </span>
          )}
          {clip.threat_level && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tBadge}`}>
              {clip.threat_level}
            </span>
          )}
          <span className={`text-[10px] font-medium ml-auto ${rel.color}`}>{rel.label}</span>
        </div>

        <p className="text-[10px] text-white/25 mb-1">{formatTs(clip.timestamp)}</p>

        {clip.vlm_summary && (
          <p className="text-xs text-white/40 leading-snug line-clamp-2">{clip.vlm_summary}</p>
        )}

        {clip.incident_id ? (
          <p className="mt-1.5 text-[10px] font-medium text-white/30">
            Incident ID: {clip.incident_id}
          </p>
        ) : null}
      </div>
    </div>
  );
}
