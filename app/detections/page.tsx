import { Suspense } from "react";

import { DetectionsPageContent } from "@/components/detections/detections-page-content";
import { DetectionsPageSkeleton } from "@/components/detections/detections-page-skeleton";

export default function DetectionsPage() {
  return (
    <Suspense fallback={<DetectionsPageSkeleton />}>
      <DetectionsPageContent />
    </Suspense>
  );
}
