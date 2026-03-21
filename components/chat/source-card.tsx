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
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors overflow-hidden">

      {/* Video / Thumbnail area */}
      <div className="relative w-full h-32 bg-slate-900">
        {showVideo && playlistSrc ? (
          <MiniPlayer src={playlistSrc} />
        ) : clip.thumbnail_url ? (
          <img
            src={`${API_BASE_URL}${clip.thumbnail_url}`}
            alt="Detection snapshot"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="size-7 text-slate-600" />
          </div>
        )}

        {playlistSrc && !showVideo && (
          <button
            type="button"
            onClick={() => setShowVideo(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors group"
          >
            <div className="size-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Play className="size-4 text-slate-800 ml-0.5" />
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
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Camera className="size-3" />{clip.camera_id}
          </span>
          {clip.zone_name && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
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

        <p className="text-[10px] text-slate-400 mb-1">{formatTs(clip.timestamp)}</p>

        {clip.vlm_summary && (
          <p className="text-xs text-slate-600 leading-snug line-clamp-2">{clip.vlm_summary}</p>
        )}

        {clip.incident_id ? (
          <p className="mt-1.5 text-[10px] font-medium text-slate-500">
            Incident ID: {clip.incident_id}
          </p>
        ) : null}
      </div>
    </div>
  );
}
