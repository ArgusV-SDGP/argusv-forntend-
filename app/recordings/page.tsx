import { RecordingCameraCard } from "@/components/recordings/recording-camera-card";
import { RecordingsFilters } from "@/components/recordings/recordings-filters";
import { RecordingsHeader } from "@/components/recordings/recordings-header";
import { RecordingsTimeline } from "@/components/recordings/recordings-timeline";

export default function RecordingsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 overflow-y-auto font-sans selection:bg-blue-200">
      <RecordingsHeader />
      <RecordingsFilters />

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
        <RecordingCameraCard title="Front Entrance" cameraCount={1} showMetadata />
        <RecordingCameraCard title="Rear Yard" cameraCount={2} />
      </div>

      <RecordingsTimeline />
    </div>
  );
}
