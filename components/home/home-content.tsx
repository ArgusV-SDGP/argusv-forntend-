import React, { Suspense } from "react";

import { MainCameraGrid } from "./main-camera-grid";
import { MainCameraGridSkeleton } from "./main-camera-grid-skeleton";
import { RightSidebar } from "./right-sidebar";

export function HomeContent() {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] bg-white text-slate-900 border-t border-gray-200 lg:overflow-hidden">
      <Suspense fallback={<MainCameraGridSkeleton />}>
        <MainCameraGrid />
      </Suspense>
      <RightSidebar />
    </div>
  );
}
