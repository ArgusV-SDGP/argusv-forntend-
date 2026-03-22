import React, { Suspense } from "react";

import { MainCameraGrid } from "./main-camera-grid";
import { MainCameraGridSkeleton } from "./main-camera-grid-skeleton";
import { RightSidebar } from "./right-sidebar";

export function HomeContent() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col border-t border-white/[0.06] bg-[#0a0a0a] text-white lg:h-[calc(100vh-4rem)] lg:flex-row lg:overflow-hidden">
      <Suspense fallback={<MainCameraGridSkeleton />}>
        <MainCameraGrid />
      </Suspense>
      <RightSidebar />
    </div>
  );
}
