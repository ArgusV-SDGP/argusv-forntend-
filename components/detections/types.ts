export type Detection = {
  detection_id: string;
  event_id: string;
  camera_id: string;
  zone_name: string;
  object_class: string;
  confidence: number;
  threat_level: string | null;
  is_threat: boolean;
  vlm_summary: string | null;
  dwell_sec: number;
  event_type: string;
  detected_at: string;
  thumbnail_url: string | null;
  bbox: { x1: number; y1: number; x2: number; y2: number } | null;
};

export type CameraItem = {
  camera_id: string;
  name: string;
};
