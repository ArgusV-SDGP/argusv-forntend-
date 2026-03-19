import { authFetch } from "@/lib/client-services/auth.service";
import {
  mapZonesToListItems,
  type CreateZonePayload,
  type CreateRulePayload,
  type ZoneApiResponse,
  type ZoneRule,
} from "@/lib/mappers/zone.mappers";

async function getResponseError(response: Response, fallback: string): Promise<string> {
  const data = (await response.json().catch(() => null)) as
    | { detail?: string; message?: string }
    | null;
  return data?.detail ?? data?.message ?? fallback;
}

export async function getZones() {
  const response = await authFetch("/api/zones");
  if (!response.ok) throw new Error(await getResponseError(response, "Failed to load zones"));
  const data = (await response.json()) as ZoneApiResponse[];
  return mapZonesToListItems(Array.isArray(data) ? data : []);
}

export async function createZone(payload: CreateZonePayload) {
  const response = await authFetch("/api/zones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await getResponseError(response, "Failed to create zone"));
  return (await response.json()) as { zone_id?: string };
}

export async function deleteZone(zoneId: string) {
  const response = await authFetch(`/api/zones/${zoneId}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    throw new Error(await getResponseError(response, "Failed to delete zone"));
  }
}

export async function patchZone(zoneId: string, payload: Partial<CreateZonePayload>) {
  const response = await authFetch(`/api/zones/${zoneId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await getResponseError(response, "Failed to update zone"));
  return (await response.json()) as ZoneApiResponse;
}

export async function getZoneRules(zoneId: string): Promise<ZoneRule[]> {
  const response = await authFetch(`/api/zones/${zoneId}/rules`);
  if (!response.ok) throw new Error(await getResponseError(response, "Failed to load rules"));
  return (await response.json()) as ZoneRule[];
}

export async function createZoneRule(zoneId: string, payload: CreateRulePayload): Promise<ZoneRule> {
  const response = await authFetch(`/api/zones/${zoneId}/rules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await getResponseError(response, "Failed to create rule"));
  return (await response.json()) as ZoneRule;
}

export async function deleteZoneRule(zoneId: string, ruleId: string) {
  const response = await authFetch(`/api/zones/${zoneId}/rules/${ruleId}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    throw new Error(await getResponseError(response, "Failed to delete rule"));
  }
}
