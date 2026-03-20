"use client";

import { useMemo, useState } from "react";
import { RecordingCameraCard } from "@/components/recordings/recording-camera-card";
import { RecordingsEventsPanel } from "@/components/recordings/recordings-events-panel";
import { RecordingsFilters } from "@/components/recordings/recordings-filters";
import { RecordingsHeader } from "@/components/recordings/recordings-header";
import {
  eventToMetadata,
  MOCK_CAMERAS,
  MOCK_RECORDING_EVENTS,
} from "@/components/recordings/recordings-data";

function formatDateIso(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function RecordingsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date("2023-10-14"));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCameraId, setSelectedCameraId] = useState(MOCK_CAMERAS[0]?.id ?? "");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeMinute, setActiveMinute] = useState(900);

  const selectedDateIso = formatDateIso(selectedDate);

  const allFilteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return MOCK_RECORDING_EVENTS.filter((event) => {
      if (event.dateIso !== selectedDateIso) return false;
      if (!query) return true;
      return (
        event.label.toLowerCase().includes(query) ||
        event.summary.toLowerCase().includes(query) ||
        event.insight.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, selectedDateIso]);

  const cameraEvents = useMemo(
    () => allFilteredEvents.filter((event) => event.cameraId === selectedCameraId),
    [allFilteredEvents, selectedCameraId]
  );

  const resolvedSelectedEventId = cameraEvents.some((event) => event.id === selectedEventId)
    ? selectedEventId
    : cameraEvents[0]?.id ?? null;

  const selectedEvent =
    cameraEvents.find((event) => event.id === resolvedSelectedEventId) ?? cameraEvents[0] ?? null;
  const selectedCamera =
    MOCK_CAMERAS.find((camera) => camera.id === selectedCameraId) ?? MOCK_CAMERAS[0] ?? null;
  const otherCameras = MOCK_CAMERAS.filter((camera) => camera.id !== selectedCameraId);

  function handleSelectCamera(cameraId: string) {
    setSelectedCameraId(cameraId);
  }

  function handleSelectEvent(eventId: string) {
    setSelectedEventId(eventId);
    const event = cameraEvents.find((item) => item.id === eventId);
    if (event) {
      setActiveMinute(event.minuteOfDay);
    }
  }

  function handleSeekMinute(minute: number) {
    setActiveMinute(minute);
    const closestEvent = cameraEvents.reduce<(typeof cameraEvents)[number] | null>(
      (closest, event) => {
        if (!closest) return event;
        const closestGap = Math.abs(closest.minuteOfDay - minute);
        const eventGap = Math.abs(event.minuteOfDay - minute);
        return eventGap < closestGap ? event : closest;
      },
      null
    );
    if (closestEvent) {
      setSelectedEventId(closestEvent.id);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-x-hidden bg-slate-50 p-4 font-sans text-slate-800 selection:bg-blue-200 md:p-6 lg:p-8">
      <RecordingsHeader />
      <RecordingsFilters
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-7">
            {selectedCamera && (
              <RecordingCameraCard
                cameraId={selectedCamera.id}
                title={selectedCamera.title}
                cameraCount={selectedCamera.cameraCount}
                isSelected
                isFeatured
                onSelect={handleSelectCamera}
                metadataEvents={allFilteredEvents
                  .filter((event) => event.cameraId === selectedCamera.id)
                  .map(eventToMetadata)}
                activeTimestamp={selectedEvent?.timestamp}
                timelineEvents={cameraEvents}
                activeMinute={activeMinute}
                onSeekMinute={handleSeekMinute}
              />
            )}

          </div>

          <div className="xl:col-span-5">
            <RecordingsEventsPanel
              events={cameraEvents}
              selectedEventId={resolvedSelectedEventId}
              onSelectEvent={handleSelectEvent}
            />
          </div>
        </div>

      </div>
    </div>
    
  );
}
