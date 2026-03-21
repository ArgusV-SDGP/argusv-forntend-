"use client";

import { useEffect, useState } from "react";

import { CameraSelector } from "@/components/recordings/camera-selector";
import { PlayerPanel } from "@/components/recordings/player-panel";
import { RecordingsErrorAlert } from "@/components/recordings/recordings-error-alert";
import { RecordingsHeader } from "@/components/recordings/recordings-header";
import { SegmentTimeline } from "@/components/recordings/segment-timeline";
import type { CameraItem, Segment } from "@/components/recordings/types";
import { authFetch, API_BASE_URL } from "@/lib/client-services/auth.service";

export function RecordingsPageContent() {
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [selectedCamId, setSelectedCamId] = useState<string>("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSeg, setSelectedSeg] = useState<Segment | null>(null);
  const [loadingCams, setLoadingCams] = useState(true);
  const [loadingSegs, setLoadingSegs] = useState(false);
  const [error, setError] = useState("");

  const handleCameraChange = (cameraId: string) => {
    setError("");
    setSelectedSeg(null);
    setSegments([]);
    setLoadingSegs(true);
    setSelectedCamId(cameraId);
  };

  useEffect(() => {
    authFetch("/api/cameras")
      .then((r) => r.json())
      .then((data: CameraItem[]) => {
        setCameras(data);
        if (data.length > 0) {
          setLoadingSegs(true);
          setSelectedCamId(data[0].camera_id);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingCams(false));
  }, []);

  useEffect(() => {
    if (!selectedCamId) return;

    authFetch(`/api/recordings/${selectedCamId}`)
      .then((r) => r.json())
      .then((data: Segment[]) => setSegments(Array.isArray(data) ? data.reverse() : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSegs(false));
  }, [selectedCamId]);

  const playlistUrl = selectedSeg
    ? `${API_BASE_URL}/api/recordings/${selectedSeg.camera_id}/playlist?start=${encodeURIComponent(selectedSeg.start_time)}&end=${encodeURIComponent(selectedSeg.end_time)}`
    : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 font-sans text-slate-800 md:p-6 lg:p-8">
      <RecordingsHeader />
      <RecordingsErrorAlert error={error} />
      <CameraSelector
        cameras={cameras}
        selectedCamId={selectedCamId}
        loadingCams={loadingCams}
        segmentCount={segments.length}
        onChange={handleCameraChange}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <SegmentTimeline
          segments={segments}
          selectedSeg={selectedSeg}
          loadingSegs={loadingSegs}
          onSelect={setSelectedSeg}
        />
        <PlayerPanel playlistUrl={playlistUrl} selectedSeg={selectedSeg} />
      </div>
    </div>
  );
}
