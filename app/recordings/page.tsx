import { Suspense } from "react";

import { RecordingsPageContent } from "@/components/recordings/recordings-page-content";
import { RecordingsPageSkeleton } from "@/components/recordings/recordings-page-skeleton";

export default function RecordingsPage() {
  return (
    <Suspense fallback={<RecordingsPageSkeleton />}>
      <RecordingsPageContent />
    </Suspense>
  );
}
