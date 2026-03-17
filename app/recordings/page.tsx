import { Suspense } from "react";

import { RecordingsPageClient } from "@/components/recordings/recordings-page-client";

export default function RecordingsPage() {
  return (
    <Suspense fallback={<main className="p-8 text-sm text-slate-500">Loading recordings...</main>}>
      <RecordingsPageClient />
    </Suspense>
  );
}
