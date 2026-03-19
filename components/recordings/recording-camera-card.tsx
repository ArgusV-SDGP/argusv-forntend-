import { Camera, Download, Pause, Play, Volume2, X } from "lucide-react";
import { METADATA_EVENTS } from "./recordings-data";

type RecordingCameraCardProps = {
  title: string;
  cameraCount: number;
  showMetadata?: boolean;
};

export function RecordingCameraCard({
  title,
  cameraCount,
  showMetadata = false,
}: RecordingCameraCardProps) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-700">
          {title} (Cams {cameraCount})
        </h2>
        <div className="flex items-center gap-2 text-slate-400">
          <button type="button" className="p-1 hover:text-slate-600 transition-colors">
            <span className="sr-only">Minimize</span>-
          </button>
          <button type="button" className="p-1 hover:text-slate-600 transition-colors">
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_11rem]">
        <div className="relative bg-slate-900 aspect-video overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(148,163,184,0.2),transparent_40%),radial-gradient(circle_at_70%_50%,rgba(15,23,42,0.35),transparent_55%),linear-gradient(140deg,#2c3e50_0%,#3f5a3e_40%,#6b8e57_70%,#1f2937_100%)]" />
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/35 to-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-2 py-1 text-xs text-white">
            <Camera className="size-3.5" />
            Live Playback
          </div>
        </div>

        {showMetadata && (
          <aside className="hidden xl:block border-l border-slate-200 bg-slate-50 p-3 space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-teal-600 uppercase">
              AI Metadata
            </p>
            {METADATA_EVENTS.map((event) => (
              <article
                key={`${event.time}-${event.text}`}
                className="rounded-lg border border-slate-200 bg-white p-2"
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-1 size-2 rounded-full ${event.color}`} />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-700">{event.time}</p>
                    <p className="text-[11px] leading-snug text-slate-600">{event.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </aside>
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-600">
          <button type="button" className="hover:text-slate-900 transition-colors">
            <Play className="size-4" />
          </button>
          <button type="button" className="hover:text-slate-900 transition-colors">
            <Pause className="size-4" />
          </button>
          <button type="button" className="hover:text-slate-900 transition-colors">
            <Volume2 className="size-4" />
          </button>
          <span className="text-xs font-medium">1x</span>
          <span className="text-xs text-slate-500">2x</span>
          <span className="text-xs text-slate-500">4x</span>
        </div>
        <button
          type="button"
          className="text-slate-500 hover:text-slate-700 transition-colors"
          title="Download clip"
        >
          <Download className="size-4" />
        </button>
      </div>
    </section>
  );
}
