import React, { Suspense } from "react";

import { HomeContent } from "@/components/home/home-content";
import { HomeContentSkeleton } from "@/components/home/home-content-skeleton";

export default function Home() {
  return (
    <Suspense fallback={<HomeContentSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
