import { authFetch } from "@/lib/client-services/auth.service";
import {
  mapZonesToListItems,
  type CreateZonePayload,
  type ZoneApiResponse,
} from "@/lib/mappers/zone.mappers";

async function getResponseError(
  response: Response,
  fallback: string
): Promise<string> {
  const data = (await response.json().catch(() => null)) as
    | { detail?: string; message?: string }
    | null;

  return data?.detail ?? data?.message ?? fallback;
}

export async function getZones() {
  const response = await authFetch("/api/zones");

  if (!response.ok) {
    throw new Error(await getResponseError(response, "Failed to load zones"));
  }

  const data = (await response.json()) as ZoneApiResponse[];
  return mapZonesToListItems(Array.isArray(data) ? data : []);
}

export async function createZone(payload: CreateZonePayload) {
  const response = await authFetch("/api/zones", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getResponseError(response, "Failed to create zone"));
  }

  return (await response.json().catch(() => null)) as
    | { zone_id?: string; message?: string }
    | null;
}