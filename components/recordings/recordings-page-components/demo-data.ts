import type {
  CameraItem,
  Marker,
  ThreatLevel,
  TimelineResponse,
} from "./types";

const DEMO_CAMERAS: CameraItem[] = [
  { camera_id: "cam-yard-01", name: "Perimeter North", zone: "Yard A" },
  { camera_id: "cam-gate-02", name: "Main Gate", zone: "Entry Control" },
  { camera_id: "cam-warehouse-03", name: "Warehouse East", zone: "Storage" },
];

const DEMO_MARKERS: Record<string, Marker[]> = {
  "cam-yard-01": [
    createMarker("yard-1", "01:22:00", "Person", "LOW", false, 0.18, 0.3, 0.3, 0.72),
    createMarker("yard-2", "05:47:00", "Vehicle", "MEDIUM", true, 0.56, 0.42, 0.82, 0.77),
    createMarker("yard-3", "08:15:00", "Forklift", "LOW", false, 0.2, 0.44, 0.42, 0.79),
    createMarker("yard-4", "11:05:00", "Person", "HIGH", true, 0.63, 0.21, 0.76, 0.61),
    createMarker("yard-5", "14:32:00", "Truck", "MEDIUM", true, 0.15, 0.38, 0.46, 0.82),
    createMarker("yard-6", "18:18:00", "Person", "HIGH", true, 0.71, 0.28, 0.84, 0.62),
    createMarker("yard-7", "21:06:00", "Vehicle", "MEDIUM", true, 0.35, 0.45, 0.68, 0.84),
  ],
  "cam-gate-02": [
    createMarker("gate-1", "00:40:00", "Truck", "LOW", false, 0.16, 0.34, 0.45, 0.82),
    createMarker("gate-2", "04:12:00", "Person", "MEDIUM", true, 0.58, 0.22, 0.69, 0.62),
    createMarker("gate-3", "07:26:00", "Vehicle", "LOW", false, 0.28, 0.46, 0.58, 0.8),
    createMarker("gate-4", "12:08:00", "Person", "HIGH", true, 0.7, 0.16, 0.81, 0.57),
    createMarker("gate-5", "16:41:00", "Truck", "MEDIUM", true, 0.12, 0.39, 0.48, 0.85),
    createMarker("gate-6", "20:14:00", "Person", "HIGH", true, 0.49, 0.18, 0.62, 0.61),
  ],
  "cam-warehouse-03": [
    createMarker("wh-1", "02:20:00", "Person", "LOW", false, 0.23, 0.2, 0.33, 0.6),
    createMarker("wh-2", "06:55:00", "Forklift", "MEDIUM", true, 0.44, 0.38, 0.7, 0.84),
    createMarker("wh-3", "09:11:00", "Pallet", "LOW", false, 0.12, 0.48, 0.37, 0.86),
    createMarker("wh-4", "13:19:00", "Person", "HIGH", true, 0.66, 0.2, 0.78, 0.6),
    createMarker("wh-5", "17:03:00", "Forklift", "MEDIUM", true, 0.24, 0.31, 0.55, 0.81),
    createMarker("wh-6", "22:07:00", "Person", "HIGH", true, 0.58, 0.23, 0.69, 0.63),
  ],
};

const DEMO_INCIDENTS: Record<
  string,
  { camera_id: string; focusTime: string; durationMinutes: number }
> = {
  "INC-2048": {
    camera_id: "cam-gate-02",
    focusTime: "12:08:00",
    durationMinutes: 24,
  },
  "INC-9182": {
    camera_id: "cam-yard-01",
    focusTime: "18:18:00",
    durationMinutes: 18,
  },
};

export const PLAYBACK_WINDOW_SECONDS = 360;

function createMarker(
  id: string,
  time: string,
  objectClass: string,
  threatLevel: ThreatLevel,
  isThreat: boolean,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): Marker {
  return {
    id,
    timestamp: time,
    object_class: objectClass,
    threat_level: threatLevel,
    is_threat: isThreat,
    bbox: { x1, y1, x2, y2 },
  };
}

function addDateToMarker(date: string, marker: Marker): Marker {
  return {
    ...marker,
    timestamp: `${date}T${marker.timestamp}Z`,
  };
}

export async function getCameras() {
  return DEMO_CAMERAS;
}

export async function getDailyTimeline(
  cameraId: string,
  date: string,
  threatsOnly: boolean,
): Promise<TimelineResponse> {
  const start = new Date(`${date}T00:00:00Z`);
  const end = new Date(`${date}T23:59:59Z`);
  const markers = (DEMO_MARKERS[cameraId] ?? [])
    .map((marker) => addDateToMarker(date, marker))
    .filter((marker) => (threatsOnly ? marker.is_threat : true));

  return { markers, window: { start, end } };
}

export async function getIncidentReplay(
  incidentId: string,
  date: string,
): Promise<TimelineResponse & { camera_id: string; incidentId: string }> {
  const incident = DEMO_INCIDENTS[incidentId] ?? DEMO_INCIDENTS["INC-2048"];
  const focus = new Date(`${date}T${incident.focusTime}Z`);
  const start = new Date(focus.getTime() - incident.durationMinutes * 60_000);
  const end = new Date(focus.getTime() + incident.durationMinutes * 60_000);
  const markers = (DEMO_MARKERS[incident.camera_id] ?? [])
    .map((marker) => addDateToMarker(date, marker))
    .filter((marker) => {
      const time = new Date(marker.timestamp).getTime();
      return time >= start.getTime() && time <= end.getTime();
    });

  return {
    camera_id: incident.camera_id,
    incidentId,
    markers,
    window: { start, end },
  };
}
