import { authFetch } from "./auth.service";
import { mapIncidents } from "../mappers/incident.mappers";
import type { IncidentListItem } from "../mappers/incident.mappers";

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
  const response = await authFetch(`/api/incidents/${id}/acknowledge`, {
    method: "POST",
  });
  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }
}

export async function resolveIncident(id: string): Promise<void> {
  const response = await authFetch(`/api/incidents/${id}/resolve`, {
    method: "POST",
  });
  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }
}
