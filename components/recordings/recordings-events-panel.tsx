import { Bot, Clock4 } from "lucide-react";
import type { RecordingEvent } from "./recordings-data";

type RecordingsEventsPanelProps = {
  events: RecordingEvent[];
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
};

function badgeClass(type: RecordingEvent["type"]) {
  if (type === "person") return "bg-red-50 text-red-600 border-red-200";
  if (type === "vehicle") return "bg-blue-50 text-blue-600 border-blue-200";
  return "bg-emerald-50 text-emerald-600 border-emerald-200";
}

export function RecordingsEventsPanel({
  events,
  selectedEventId,
  onSelectEvent,
}: RecordingsEventsPanelProps) {
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;

  return (
    <div className="grid grid-cols-1 gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Detected Events</h3>
            <p className="text-sm text-slate-500">Review the AI-detected activity for this camera.</p>
          </div>
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {events.length} result(s)
          </p>
        </div>

        <div className="space-y-3">
          {events.length === 0 && (
            <p className="py-4 text-sm text-slate-500">No events match current filters.</p>
          )}

          {events.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelectEvent(event.id)}
              className={`w-full rounded-xl border p-4 text-left transition-all ${
                selectedEventId === event.id
                  ? "border-blue-300 bg-blue-50/70 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-800">{event.label}</p>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md border uppercase tracking-wide ${badgeClass(
                    event.type
                  )}`}
                >
                  {event.type}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock4 className="size-3.5" />
                {event.timestamp}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{event.summary}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
          <Bot className="size-5 text-blue-500" />
          AI Insights
        </h3>

        {!selectedEvent && (
          <p className="text-sm text-slate-500">Select an event to view AI-generated insight.</p>
        )}

        {selectedEvent && (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-1 text-xs text-slate-500">Selected Event</p>
              <p className="text-lg font-semibold text-slate-900">{selectedEvent.label}</p>
              <p className="mt-1 text-sm text-slate-500">{selectedEvent.timestamp}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <p className="mb-2 text-xs font-medium text-blue-700">VLM Summary</p>
              <p className="text-sm leading-7 text-slate-700">{selectedEvent.insight}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
