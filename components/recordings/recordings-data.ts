export type RecordingEventType = "person" | "vehicle" | "package";

export type RecordingCamera = {
  id: string;
  title: string;
  cameraCount: number;
};

export type RecordingEvent = {
  id: string;
  cameraId: string;
  type: RecordingEventType;
  dateIso: string;
  timestamp: string;
  minuteOfDay: number;
  label: string;
  summary: string;
  insight: string;
};

export type MetadataEvent = {
  id: string;
  time: string;
  text: string;
  color: string;
};

export const MOCK_CAMERAS: RecordingCamera[] = [
  { id: "front-entrance", title: "Front Entrance", cameraCount: 1 },
  { id: "rear-yard", title: "Rear Yard", cameraCount: 2 },
];

export const MOCK_RECORDING_EVENTS: RecordingEvent[] = [
  {
    id: "evt-001",
    cameraId: "front-entrance",
    type: "vehicle",
    dateIso: "2023-10-14",
    timestamp: "03:02 PM",
    minuteOfDay: 902,
    label: "Delivery van arrived",
    summary: "A white delivery van arrived and parked near the entrance.",
    insight:
      "Vehicle remained idle for 3 minutes, then driver-side door opened once.",
  },
  {
    id: "evt-002",
    cameraId: "front-entrance",
    type: "person",
    dateIso: "2023-10-14",
    timestamp: "03:15 PM",
    minuteOfDay: 915,
    label: "Two people walked in",
    summary: "Two people walked from the van toward the building entrance.",
    insight: "Subjects moved directly to the front door carrying a medium parcel.",
  },
  {
    id: "evt-003",
    cameraId: "front-entrance",
    type: "package",
    dateIso: "2023-10-14",
    timestamp: "03:20 PM",
    minuteOfDay: 920,
    label: "Package dropped",
    summary: "A person in a red jacket left a package at the doorstep.",
    insight: "Package was left unattended for 5 minutes before retrieval.",
  },
  {
    id: "evt-004",
    cameraId: "rear-yard",
    type: "person",
    dateIso: "2023-10-14",
    timestamp: "11:48 AM",
    minuteOfDay: 708,
    label: "Back gate opened",
    summary: "A person entered from the rear gate and moved toward the house.",
    insight: "Entry duration was 18 seconds; no additional subjects detected.",
  },
  {
    id: "evt-005",
    cameraId: "rear-yard",
    type: "vehicle",
    dateIso: "2023-10-14",
    timestamp: "01:12 PM",
    minuteOfDay: 792,
    label: "Vehicle movement",
    summary: "A dark sedan briefly appeared near the rear lane.",
    insight: "Vehicle remained in frame for 11 seconds before exiting eastbound.",
  },
  {
    id: "evt-006",
    cameraId: "rear-yard",
    type: "package",
    dateIso: "2023-10-14",
    timestamp: "06:05 PM",
    minuteOfDay: 1085,
    label: "Package transfer",
    summary: "A small box was transferred near the side entrance.",
    insight: "Object handoff involved two people and lasted roughly 9 seconds.",
  },
];

export function typeToColor(type: RecordingEventType) {
  if (type === "person") return "bg-red-400";
  if (type === "vehicle") return "bg-blue-500";
  return "bg-emerald-500";
}

export function eventToMetadata(event: RecordingEvent): MetadataEvent {
  return {
    id: event.id,
    time: event.timestamp,
    text: `VLM: ${event.summary}`,
    color: typeToColor(event.type),
  };
}

export const TIMELINE_INTENSITY = [
  8, 12, 18, 68, 22, 76, 80, 30, 12, 20, 10, 0, 16, 54, 18, 0, 70, 24, 18, 12,
  28, 74, 82, 76, 20, 14, 18, 48, 16, 0, 0, 36, 0, 14, 0, 0, 0, 0, 10, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
];

export const TIMELINE_LABELS = [
  "00:00",
  "02:00",
  "04:00",
  "06:00",
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
  "22:00",
  "24:00",
];
