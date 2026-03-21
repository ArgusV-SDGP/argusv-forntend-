export type SourceClip = {
  event_id: string;
  camera_id: string;
  zone_name: string | null;
  timestamp: string;
  vlm_summary: string | null;
  threat_level: string | null;
  is_threat: boolean | null;
  thumbnail_url: string | null;
  playlist_url: string | null;
  incident_id: string | null;
  distance: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceClip[];
  error?: boolean;
};

export type CameraItem = { camera_id: string; name: string };
