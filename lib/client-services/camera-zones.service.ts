import { authFetch } from "@/lib/client-services/auth.service";

export type ZoneViewMode = "with_zones" | "without_zones";
export type ZoneSelectionMode = "all" | "assigned";

type ZoneBBox = Record<string, number | null>;

export type CameraZone = {
  camera_id?: string | null;
  zone_id: string;
  name: string;
  polygon_coords: [number, number][];
  zone_type: string | null;
  dwell_threshold_sec: number | null;
  active: boolean;
  bbox_norm?: ZoneBBox | null;
  bbox_px?: ZoneBBox | null;
  rule_count: number | null;
};

export type CameraZonesResponse = {
  camera_id: string;
  camera_name: string;
  camera_zone_id: string | null;
  frame?: {
    width: number;
    height: number;
  } | null;
  view: ZoneViewMode;
  selection: ZoneSelectionMode;
  requested_zone_ids: string[];
  available_zone_ids: string[];
  zone_count: number;
  zones: CameraZone[];
};

async function getResponseError(response: Response, fallback: string): Promise<string> {
  const data = (await response.json().catch(() => null)) as
    | { detail?: string; message?: string }
    | null;
  return data?.detail ?? data?.message ?? fallback;
}

export async function getCameraZones(
  cameraId: string,
  params: {
    view: ZoneViewMode;
    selection?: ZoneSelectionMode;
    zoneIds?: string[];
    activeOnly?: boolean;
  },
) {
  const searchParams = new URLSearchParams();
  searchParams.set("view", params.view);

  if (params.selection) {
    searchParams.set("selection", params.selection);
  }

  if (params.zoneIds && params.zoneIds.length > 0) {
    searchParams.set("zone_ids", params.zoneIds.join(","));
  }

  if (typeof params.activeOnly === "boolean") {
    searchParams.set("active_only", String(params.activeOnly));
  }

  const response = await authFetch(`/api/cameras/${cameraId}/zones?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(await getResponseError(response, "Failed to load camera zones"));
  }

  return (await response.json()) as CameraZonesResponse;
}

export async function getAssignedCameraZones(cameraId: string) {
  return getCameraZones(cameraId, {
    view: "with_zones",
    selection: "assigned",
    activeOnly: true,
  });
}
