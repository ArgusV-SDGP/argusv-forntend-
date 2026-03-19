import { Camera, Download, Pause, Play, Volume2, X } from "lucide-react";
import type { MetadataEvent, RecordingEvent } from "./recordings-data";
import { RecordingsTimeline } from "./recordings-timeline";

type RecordingCameraCardProps = {
  cameraId: string;
  title: string;
  cameraCount: number;
  isSelected: boolean;
  isFeatured?: boolean;
  onSelect: (cameraId: string) => void;
  metadataEvents: MetadataEvent[];
  activeTimestamp?: string;
  timelineEvents?: RecordingEvent[];
  activeMinute?: number;
  onSeekMinute?: (minute: number) => void;
};

export function RecordingCameraCard({
  cameraId,
  title,
  cameraCount,
  isSelected,
  isFeatured = false,
  onSelect,
  metadataEvents,
  activeTimestamp,
  timelineEvents = [],
  activeMinute,
  onSeekMinute,
}: RecordingCameraCardProps) {
  return (
    <section
      className={`w-full overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors ${
        isSelected ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3">
        <button
          type="button"
          onClick={() => onSelect(cameraId)}
          className="text-left text-sm font-semibold uppercase tracking-wide text-slate-700 transition-colors hover:text-slate-900"
        >
          {title} (Cams {cameraCount})
        </button>
        <div className="flex items-center gap-2 text-slate-400">
          <button type="button" className="p-1 transition-colors hover:text-slate-600">
            <span className="sr-only">Minimize</span>-
          </button>
          <button type="button" className="p-1 transition-colors hover:text-slate-600">
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div
        className={`${
          isSelected && metadataEvents.length > 0
            ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem]"
            : "grid grid-cols-1"
        }`}
      >
        <div className="min-w-0">
          <div
            className={`relative overflow-hidden bg-slate-900 ${
              isFeatured ? "h-[16rem] md:h-[20rem] xl:h-[24rem]" : "h-[11rem] md:h-[12.5rem]"
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(148,163,184,0.2),transparent_40%),radial-gradient(circle_at_70%_50%,rgba(15,23,42,0.35),transparent_55%),linear-gradient(140deg,#2c3e50_0%,#3f5a3e_40%,#6b8e57_70%,#1f2937_100%)]" />
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/35 to-transparent" />
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-sm text-white">
              <Camera className="size-4" />
              Live Playback
            </div>
            {activeTimestamp && (
              <div className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1.5 text-sm text-white">
                {activeTimestamp}
              </div>
            )}
          </div>
        </div>

        {isSelected && metadataEvents.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 p-4 lg:max-h-[24rem] lg:overflow-y-auto lg:border-l lg:border-t-0">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-600">
                AI Metadata
              </p>
              <p className="text-xs text-slate-500">{metadataEvents.length} event(s)</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {metadataEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-1 size-2 rounded-full ${event.color}`} />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{event.time}</p>
                      <p className="text-sm leading-6 text-slate-600">{event.text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {isSelected && metadataEvents.length === 0 && (
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-500">No events for selected filters.</p>
          </div>
        )}
      </div>

      {isSelected && typeof activeMinute === "number" && onSeekMinute && (
        <div className="border-t border-slate-200 bg-white p-4">
          <RecordingsTimeline
            events={timelineEvents}
            activeMinute={activeMinute}
            onSeekMinute={onSeekMinute}
          />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3 text-slate-600">
          <button type="button" className="transition-colors hover:text-slate-900">
            <Play className="size-4" />
          </button>
          <button type="button" className="transition-colors hover:text-slate-900">
            <Pause className="size-4" />
          </button>
          <button type="button" className="transition-colors hover:text-slate-900">
            <Volume2 className="size-4" />
          </button>
          <span className="text-xs font-medium">1x</span>
          <span className="text-xs text-slate-500">2x</span>
          <span className="text-xs text-slate-500">4x</span>
        </div>
        <button
          type="button"
          className="text-slate-500 transition-colors hover:text-slate-700"
          title="Download clip"
        >
          <Download className="size-4" />
        </button>
      </div>
    </section>
  );
}
