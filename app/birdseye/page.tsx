import { Suspense } from "react";
import { BirdseyePageContent } from "@/components/birdseye/birdseye-page-content";
import { BirdseyePageSkeleton } from "@/components/birdseye/birdseye-page-skeleton";

export default function BirdseyePage() {
  return (
    <Suspense fallback={<BirdseyePageSkeleton />}>
      <BirdseyePageContent />
    </Suspense>
  );
}
