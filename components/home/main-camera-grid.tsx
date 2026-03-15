import React from "react";

import { getLiveCameras } from "@/lib/server-services/live-cam.service";
import type { CameraGridItem } from "@/lib/mappers/cam.mappers";
import { MainCameraGridClient } from "./main-camera-grid-client";

export async function MainCameraGrid() {
  let cameras: CameraGridItem[] = [];

  try {
    cameras = await getLiveCameras();
  } catch (error) {
    console.error("Unable to load cameras", error);
  }

  return (
    <div className="flex-1 p-2 sm:p-4 bg-slate-100 lg:overflow-y-auto min-h-0">
      {cameras.length === 0 ? (
        <div className="mb-2 flex min-h-[240px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70 px-6 text-center">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Camera feed is unavailable
            </p>
            <p className="mt-2 text-xs text-slate-500">
              The server could not load `/api/cameras` with the required headers.
            </p>
          </div>
        </div>
      ) : null}

      <MainCameraGridClient cameras={cameras} />
    </div>
  );
}
