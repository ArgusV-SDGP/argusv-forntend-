export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "open" | "acknowledged" | "resolved";
export type IncidentType =
  | "motion"
  | "door"
  | "rfid"
  | "system"
  | "tag"
  | "intrusion";

export type IncidentApiResponse = {
  incident_id?: string;
  type?: string;
  severity?: string;
  status?: string;
  camera_id?: string;
  camera_name?: string;
  zone_name?: string;
  description?: string;
  timestamp?: string;
  thumbnail_url?: string;
};

export type IncidentListItem = {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  cameraId: string;
  cameraName: string;
  zoneName: string;
  description: string;
  timestamp: string;
  thumbnailUrl: string;
};

export function mapIncident(raw: IncidentApiResponse): IncidentListItem {
  return {
    id: raw.incident_id ?? "unknown",
    type: (raw.type?.toLowerCase() ?? "system") as IncidentType,
    severity: (raw.severity?.toLowerCase() ?? "low") as IncidentSeverity,
    status: (raw.status?.toLowerCase() ?? "open") as IncidentStatus,
    cameraId: raw.camera_id ?? "",
    cameraName: raw.camera_name ?? "Unknown Camera",
    zoneName: raw.zone_name ?? "—",
    description: raw.description ?? "",
    timestamp: raw.timestamp ?? new Date().toISOString(),
    thumbnailUrl: raw.thumbnail_url ?? "",
  };
}

export function mapIncidents(raw: IncidentApiResponse[]): IncidentListItem[] {
  return raw.map(mapIncident);
}
