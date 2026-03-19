export type IncidentSeverity = "low" | "medium" | "high";
export type IncidentStatus = "open" | "acknowledged" | "resolved";
export type IncidentType =
  | "intrusion"
  | "motion"
  | "system";

// Backend response shape from /api/incidents
export type IncidentApiResponse = {
  incident_id?: string;
  camera_id?: string;
  zone_id?: string;
  zone_name?: string;
  object_class?: string;   // YOLO class: "person", "car", etc.
  threat_level?: string;   // "HIGH" | "MEDIUM" | "LOW"
  summary?: string;        // VLM description
  status?: string;         // "OPEN" | "RESOLVED"
  detected_at?: string;    // ISO timestamp
  resolved_at?: string;
  thumbnail_url?: string;
  metadata_json?: Record<string, unknown>;
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
  objectClass: string;
  timestamp: string;
  thumbnailUrl: string;
};

const PERSON_CLASSES = new Set(["person", "people", "human", "pedestrian"]);
const VEHICLE_CLASSES = new Set(["car", "truck", "bus", "motorcycle", "bicycle", "vehicle"]);

function mapObjectClassToType(cls?: string): IncidentType {
  const c = cls?.toLowerCase() ?? "";
  if (PERSON_CLASSES.has(c)) return "intrusion";
  if (VEHICLE_CLASSES.has(c)) return "motion";
  return "system";
}

function mapThreatLevel(level?: string): IncidentSeverity {
  const l = level?.toUpperCase();
  if (l === "HIGH") return "high";
  if (l === "MEDIUM") return "medium";
  return "low";
}

function mapStatus(status?: string): IncidentStatus {
  const s = status?.toUpperCase();
  if (s === "RESOLVED") return "resolved";
  return "open";
}

export function mapIncident(raw: IncidentApiResponse): IncidentListItem {
  return {
    id: raw.incident_id ?? "unknown",
    type: mapObjectClassToType(raw.object_class),
    severity: mapThreatLevel(raw.threat_level),
    status: mapStatus(raw.status),
    cameraId: raw.camera_id ?? "",
    cameraName: raw.camera_id ?? "Unknown Camera",
    zoneName: raw.zone_name ?? "—",
    description: raw.summary ?? "",
    objectClass: raw.object_class ?? "unknown",
    timestamp: raw.detected_at ?? new Date().toISOString(),
    thumbnailUrl: raw.thumbnail_url ?? "",
  };
}

export function mapIncidents(raw: IncidentApiResponse[]): IncidentListItem[] {
  return raw.map(mapIncident);
}
