import { Camera } from "lucide-react";

import type { CameraItem } from "@/components/recordings/types";

type CameraSelectorProps = {
  cameras: CameraItem[];
  selectedCamId: string;
  loadingCams: boolean;
  segmentCount: number;
  onChange: (cameraId: string) => void;
};

export function CameraSelector({
  cameras,
  selectedCamId,
  loadingCams,
  segmentCount,
  onChange,
}: CameraSelectorProps) {
  return (
    <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Camera className="size-5 shrink-0 text-slate-400" />
      <label className="shrink-0 text-sm font-semibold text-slate-600">Camera</label>
      {loadingCams ? (
        <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <select
          value={selectedCamId}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {cameras.map((camera) => (
            <option key={camera.camera_id} value={camera.camera_id}>
              {camera.name} ({camera.camera_id})
            </option>
          ))}
        </select>
      )}
      <span className="ml-auto text-xs text-slate-400">
        {segmentCount} segment{segmentCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
