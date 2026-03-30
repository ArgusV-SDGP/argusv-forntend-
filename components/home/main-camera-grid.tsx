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
    <div className="ux-scrollbar flex-1 min-h-0 bg-[#0a0a0a] p-2 sm:p-4 lg:overflow-y-auto">
      {cameras.length === 0 ? (
        <div className="mb-2 flex min-h-[240px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
          <div>
            <p className="text-sm font-semibold text-white/60">
              Camera feed is unavailable
            </p>
            <p className="mt-2 text-xs text-white/30">
              The server could not load `/api/cameras` with the required headers.
            </p>
          </div>
        </div>
      ) : null}

      <MainCameraGridClient cameras={cameras} />
    </div>
  );
}
