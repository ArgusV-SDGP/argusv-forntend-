export type CameraItem = { camera_id: string; name: string; status: string };

export type Segment = {
  segment_id: string;
  camera_id: string;
  start_time: string;
  end_time: string;
  duration_sec: number;
  url: string;
  size_bytes: number;
  has_motion: boolean;
  has_detections: boolean;
  detection_count: number;
};

export type BBox = { x1: number; y1: number; x2: number; y2: number };

export type DetectionMarker = {
  detection_id: string;
  incident_id: string | null;
  timestamp: string;
  object_class: string;
  threat_level: string;
  is_threat: boolean;
  zone_name: string;
  bbox: BBox | null;
  thumbnail_url: string | null;
};

export type ThreatStyle = { bg: string; text: string; badge: string; dot: string; glow: string };

export type FilterLevel = "all" | "HIGH" | "MEDIUM" | "LOW";
