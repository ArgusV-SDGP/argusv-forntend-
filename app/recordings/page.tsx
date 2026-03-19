import { Suspense } from "react";

import { RecordingsPageClient } from "@/components/recordings/recordings-page-client";

export default function RecordingsPage() {
  return (
    <Suspense fallback={null}>
      <RecordingsPageClient />
    </Suspense>
  );
}
