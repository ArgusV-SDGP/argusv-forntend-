export type ZoneApiResponse = {
  zone_id?: string;
  name?: string;
  zone_type?: string;
  dwell_threshold_sec?: number;
  active?: boolean;
  polygon_coords?: [number, number][];
};

export type ZoneListItem = {
  id: string;
  name: string;
  type: string;
  dwell: number;
  active: boolean;
  points: number;
  polygonCoords: [number, number][];
};

export type CreateZonePayload = {
  name: string;
  zone_type: string;
  dwell_threshold_sec: number;
  active: boolean;
  polygon_coords: [number, number][];
};

export function mapZoneToListItem(
  zone: ZoneApiResponse,
  index: number
): ZoneListItem {
  const polygonCoords = Array.isArray(zone.polygon_coords)
    ? zone.polygon_coords.filter(
        (point): point is [number, number] =>
          Array.isArray(point) &&
          point.length === 2 &&
          typeof point[0] === "number" &&
          typeof point[1] === "number"
      )
    : [];

  return {
    id: zone.zone_id ?? `zone-${index}`,
    name: zone.name ?? "Unnamed Zone",
    type: zone.zone_type ?? "security",
    dwell: Number(zone.dwell_threshold_sec ?? 0),
    active: Boolean(zone.active),
    points: polygonCoords.length,
    polygonCoords,
  };
}

export function mapZonesToListItems(zones: ZoneApiResponse[]) {
  return zones.map(mapZoneToListItem);
}
