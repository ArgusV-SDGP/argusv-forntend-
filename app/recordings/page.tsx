"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Download,
  Film,
  Pause,
  Play,
  Search,
  Volume2,
  X,
} from "lucide-react";

const METADATA_EVENTS = [
  {
    time: "03:02 PM",
    text: "VLM: A delivery van arrived and parked near the entrance.",
    color: "bg-emerald-500",
  },
  {
    time: "03:15 PM",
    text: "VLM: Two people walked from the van toward the building.",
    color: "bg-blue-500",
  },
  {
    time: "03:20 PM",
    text: "VLM: A person in a red jacket left a package.",
    color: "bg-lime-500",
  },
];

const TIMELINE_INTENSITY = [
  8, 12, 18, 68, 22, 76, 80, 30, 12, 20, 10, 0, 16, 54, 18, 0, 70, 24, 18, 12,
  28, 74, 82, 76, 20, 14, 18, 48, 16, 0, 0, 36, 0, 14, 0, 0, 0, 0, 10, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
];

const TIMELINE_LABELS = [
  "00:00",
  "02:00",
  "04:00",
  "06:00",
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
  "22:00",
  "24:00",
];

function CameraCard({
  title,
  cameraCount,
  showMetadata = false,
}: {
  title: string;
  cameraCount: number;
  showMetadata?: boolean;
}) {
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

export default function RecordingsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 overflow-y-auto font-sans selection:bg-blue-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Film className="size-8 text-blue-500" />
            AI VLM Recording Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review camera history with AI event summaries and timeline heatmap.
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all text-sm font-medium text-slate-700 shadow-sm"
        >
          <ArrowLeft className="size-4" />
          Back to Live Feed
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm mb-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <button
            type="button"
            className="h-11 px-4 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-sm font-medium flex items-center gap-2 hover:bg-slate-100 transition-colors"
          >
            <CalendarDays className="size-4 text-slate-500" />
            OCTOBER 14, 2023
          </button>

          <label className="relative flex-1">
            <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              defaultValue=""
              placeholder='Search events: e.g., "Find red vehicle after 3 PM"'
              className="w-full h-11 pl-9 pr-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
        <CameraCard title="Front Entrance" cameraCount={1} showMetadata />
        <CameraCard title="Rear Yard" cameraCount={2} />
      </div>

      <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`shrink-0 w-20 h-12 rounded-lg border transition-all ${
                i === 1
                  ? "border-blue-300 ring-2 ring-blue-100"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="w-full h-full rounded-[7px] bg-[linear-gradient(125deg,#475569_0%,#7c8f5a_55%,#1e293b_100%)]" />
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-100 p-4">
          <div className="h-16 rounded-lg bg-slate-300/60 flex items-end gap-[2px] px-1">
            {TIMELINE_INTENSITY.map((value, index) => (
              <span
                key={`${value}-${index}`}
                className="flex-1 rounded-sm"
                style={{
                  height: `${Math.max(value, 6)}%`,
                  background:
                    value > 70
                      ? "rgb(239 68 68 / 0.9)"
                      : value > 45
                        ? "rgb(59 130 246 / 0.75)"
                        : "rgb(14 165 233 / 0.55)",
                }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            {TIMELINE_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <p className="text-center text-xs text-slate-600 mt-4">03:30 PM</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-400" />
            Person
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-500" />
            Vehicle
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            Package
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-slate-400" />
            All Events
          </span>
        </div>
      </div>
    </div>
  );
}
