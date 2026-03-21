export type CameraItem = {
  camera_id: string;
  name: string;
  status: string;
};

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
