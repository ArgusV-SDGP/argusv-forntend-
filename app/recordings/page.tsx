import { Suspense } from "react";

import { RecordingsPageClient } from "@/components/recordings/recordings-page-client";

export default function RecordingsPage() {
  return (
    <Suspense fallback={null}>
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 overflow-y-auto font-sans selection:bg-blue-200">

      <RecordingsPageClient />

      </div>
    </Suspense>
  );
}
