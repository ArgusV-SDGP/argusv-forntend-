import "server-only";

import { cookies, headers } from "next/headers";

import {
  mapCamerasToGridItems,
  type CameraApiResponse,
  type CameraGridItem,
} from "@/lib/mappers/cam.mappers";

const CAMERA_API_BASE_URL =
  process.env.CAMERA_API_BASE_URL ??
  process.env.BASE_URL ??
  process.env.NEXT_PUBLIC_BASE_URL ??
  "http://127.0.0.1:8000";

function getApiUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${CAMERA_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function buildCameraRequestHeaders() {
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const apiKey =
    process.env.CAMERA_API_KEY ??
    process.env.API_KEY ??
    requestHeaders.get("x-api-key") ??
    "";
  const cookieUser = cookieStore.get("argusv_forwarded_user")?.value;
  const cookieRole = cookieStore.get("argusv_forwarded_role")?.value;
  const accessToken = cookieStore.get("argusv_access_token")?.value;
  const forwardedUser =
    requestHeaders.get("x-forwarded-user") ??
    cookieUser ??
    process.env.DEFAULT_FORWARDED_USER ??
    "admin";
  const forwardedRole =
    requestHeaders.get("x-forwarded-role") ??
    cookieRole ??
    process.env.DEFAULT_FORWARDED_ROLE ??
    "ADMIN";

  if (!apiKey) {
    throw new Error(
      "Missing API key. Set CAMERA_API_KEY or API_KEY in the server environment.",
    );
  }

  const nextHeaders = new Headers();
  nextHeaders.set("X-API-Key", apiKey);
  nextHeaders.set("x-forwarded-user", forwardedUser);
  nextHeaders.set("x-forwarded-role", forwardedRole);

  if (accessToken) {
    nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  return nextHeaders;
}

export async function getLiveCameras(): Promise<CameraGridItem[]> {
  const requestHeaders = await buildCameraRequestHeaders();
  const response = await fetch(getApiUrl("/api/cameras"), {
    method: "GET",
    headers: requestHeaders,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch cameras: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as CameraApiResponse[];

  if (!Array.isArray(payload)) {
    throw new Error("Invalid camera response shape");
  }

  return mapCamerasToGridItems(payload);
}
