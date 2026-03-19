import { authFetch } from "./auth.service";
import { mapIncidents } from "../mappers/incident.mappers";
import type { IncidentListItem } from "../mappers/incident.mappers";

export type SearchResult = {
  detection_id: string;
  event_id?: string;
  camera_id: string;
  zone_name?: string;
  object_class?: string;
  threat_level?: string;
  is_threat?: boolean;
  vlm_summary?: string;
  detected_at: string;
  score: number;
  incident_id?: string;
  thumbnail_url?: string;
};

async function parseError(response: Response) {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;
  } catch {
    // ignore
  }
  return response.statusText || "Request failed";
}

export async function getIncidents(): Promise<IncidentListItem[]> {
  const response = await authFetch("/api/incidents");
  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }
  const data = await response.json();
  return mapIncidents(Array.isArray(data) ? data : (data.items ?? []));
}

export async function acknowledgeIncident(id: string): Promise<void> {
  // Backend has no "acknowledged" status — add an annotation to mark it acknowledged
  const response = await authFetch(`/api/incidents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ annotation: "Acknowledged by operator" }),
  });
  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }
}

export async function resolveIncident(id: string): Promise<void> {
  const response = await authFetch(`/api/incidents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "RESOLVED" }),
  });
  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }
}

export async function semanticSearch(query: string, limit = 20): Promise<SearchResult[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const response = await authFetch(`/api/search?${params}`);
  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }
  return response.json();
}
