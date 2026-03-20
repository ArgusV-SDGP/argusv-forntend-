import { Filter } from "lucide-react";

import type { CameraItem } from "@/components/detections/types";

type DetectionsFiltersProps = {
  camFilter: string;
  classFilter: string;
  limit: number;
  threatsOnly: boolean;
  cameras: CameraItem[];
  knownClasses: string[];
  detectionCount: number;
  onCamFilterChange: (value: string) => void;
  onClassFilterChange: (value: string) => void;
  onLimitChange: (value: number) => void;
  onThreatsOnlyChange: (value: boolean) => void;
};

export function DetectionsFilters({
  camFilter,
  classFilter,
  limit,
  threatsOnly,
  cameras,
  knownClasses,
  detectionCount,
  onCamFilterChange,
  onClassFilterChange,
  onLimitChange,
  onThreatsOnlyChange,
}: DetectionsFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Filter className="size-4 shrink-0 text-slate-400" />

      <select
        value={camFilter}
        onChange={(e) => onCamFilterChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        <option value="all">All Cameras</option>
        {cameras.map((camera) => (
          <option key={camera.camera_id} value={camera.camera_id}>
            {camera.name} ({camera.camera_id})
          </option>
        ))}
      </select>

      <select
        value={classFilter}
        onChange={(e) => onClassFilterChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        <option value="all">All Classes</option>
        {knownClasses.map((itemClass) => (
          <option key={itemClass} value={itemClass}>
            {itemClass}
          </option>
        ))}
      </select>

      <select
        value={limit}
        onChange={(e) => onLimitChange(Number(e.target.value))}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        <option value={50}>Last 50</option>
        <option value={100}>Last 100</option>
        <option value={200}>Last 200</option>
      </select>

      <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={threatsOnly}
          onChange={(e) => onThreatsOnlyChange(e.target.checked)}
          className="size-4 accent-violet-600"
        />
        Threats only
      </label>

      <span className="ml-auto text-xs text-slate-400">
        {detectionCount} detection{detectionCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
