export type ThreatLevel = "LOW" | "MEDIUM" | "HIGH";

export type CameraItem = {
  camera_id: string;
  name: string;
  zone: string;
};

export type Marker = {
  id: string;
  timestamp: string;
  object_class: string;
  threat_level: ThreatLevel;
  is_threat: boolean;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
};

export type TimelineWindow = {
  start: Date;
  end: Date;
};

export type TimelineResponse = {
  markers: Marker[];
  window: TimelineWindow;
};
