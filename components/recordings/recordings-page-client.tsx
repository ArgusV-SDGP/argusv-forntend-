"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import {
  getCameras,
  getDailyTimeline,
  getIncidentReplay,
  PLAYBACK_WINDOW_SECONDS,
} from "./recordings-page-components/demo-data";
import {
  getTodayDate,
  parseDateValue,
} from "./recordings-page-components/helpers";
import { RecordingsPlayer } from "./recordings-page-components/recordings-player";
import { RecordingsSidebar } from "./recordings-page-components/recordings-sidebar";
import { RecordingsTimeline } from "./recordings-page-components/recordings-timeline";
import { RecordingsToolbar } from "./recordings-page-components/recordings-toolbar";
import type {
  CameraItem,
  Marker,
  TimelineWindow,
} from "./recordings-page-components/types";

export function RecordingsPageClient() {
  const searchParams = useSearchParams();
  const incidentId = searchParams.get("incident_id");

  const [cameras, setCameras] = React.useState<CameraItem[]>([]);
  const [selectedCamera, setSelectedCamera] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState(getTodayDate);
  const [eventsOnly, setEventsOnly] = React.useState(false);
  const [markers, setMarkers] = React.useState<Marker[]>([]);
  const [windowRange, setWindowRange] = React.useState<TimelineWindow | null>(
    null,
  );
  const [status, setStatus] = React.useState("Loading demo recordings...");
  const [isIncidentReplay, setIsIncidentReplay] = React.useState(false);
  const [playbackSeconds, setPlaybackSeconds] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [isReady, setIsReady] = React.useState(false);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const lastFrameRef = React.useRef<number | null>(null);

  const currentCamera =
    cameras.find((camera) => camera.camera_id === selectedCamera) ?? null;
  const selectedDateValue = React.useMemo(
    () => parseDateValue(selectedDate),
    [selectedDate],
  );

  const progress = playbackSeconds / PLAYBACK_WINDOW_SECONDS;

  const currentActualTime = React.useMemo(() => {
    if (!windowRange) {
      return null;
    }

    const span = windowRange.end.getTime() - windowRange.start.getTime();
    return new Date(windowRange.start.getTime() + span * progress);
  }, [progress, windowRange]);

  const activeMarkers = React.useMemo(() => {
    if (!currentActualTime) {
      return [];
    }

    const current = currentActualTime.getTime();

    return markers.filter((marker) => {
      const markerTime = new Date(marker.timestamp).getTime();
      return Math.abs(markerTime - current) <= 90_000;
    });
  }, [currentActualTime, markers]);

  const loadTimeline = React.useCallback(async () => {
    if (!selectedCamera) {
      return;
    }

    setStatus("Loading timeline...");
    const timeline = await getDailyTimeline(
      selectedCamera,
      selectedDate,
      eventsOnly,
    );
    setMarkers(timeline.markers);
    setWindowRange(timeline.window);
    setPlaybackSeconds(0);
    setIsIncidentReplay(false);
    setIsReady(true);
    setStatus(`Playback ready for ${currentCamera?.name ?? "camera"}`);
  }, [currentCamera?.name, eventsOnly, selectedCamera, selectedDate]);

  React.useEffect(() => {
    let cancelled = false;

    async function init() {
      const cameraItems = await getCameras();
      if (cancelled) {
        return;
      }

      setCameras(cameraItems);
      const fallbackCamera = cameraItems[0]?.camera_id ?? "";

      if (incidentId) {
        const incidentReplay = await getIncidentReplay(
          incidentId,
          selectedDate,
        );
        if (cancelled) {
          return;
        }

        setSelectedCamera(incidentReplay.camera_id);
        setMarkers(incidentReplay.markers);
        setWindowRange(incidentReplay.window);
        setPlaybackSeconds(0);
        setIsIncidentReplay(true);
        setIsReady(true);
        setStatus(`Incident replay ${incidentReplay.incidentId}`);
        return;
      }

      setSelectedCamera(fallbackCamera);
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [incidentId, selectedDate]);

  React.useEffect(() => {
    if (!selectedCamera || incidentId) {
      return;
    }

    void loadTimeline();
  }, [incidentId, loadTimeline, selectedCamera]);

  React.useEffect(() => {
    if (!isPlaying || !isReady) {
      lastFrameRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const step = (timestamp: number) => {
      const last = lastFrameRef.current ?? timestamp;
      const elapsed = (timestamp - last) / 1000;
      lastFrameRef.current = timestamp;

      setPlaybackSeconds((current) => {
        const next = current + elapsed * 12;
        return next >= PLAYBACK_WINDOW_SECONDS ? 0 : next;
      });

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, isReady]);

  function handleTimelineSeek(event: React.MouseEvent<HTMLDivElement>) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const pct = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width),
    );
    setPlaybackSeconds(pct * PLAYBACK_WINDOW_SECONDS);
  }

  return (
      <div className="h-screen overflow-hidden p-3 sm:p-4">
        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-600">
                  NVR Playback
                </p>
                <h1 className="mt-1.5 text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Recordings Console
                </h1>
              </div>

              <RecordingsToolbar
                cameras={cameras}
                selectedCamera={selectedCamera}
                onCameraChange={setSelectedCamera}
                calendarOpen={calendarOpen}
                onCalendarOpenChange={setCalendarOpen}
                selectedDateValue={selectedDateValue}
                onDateChange={setSelectedDate}
                eventsOnly={eventsOnly}
                onToggleEventsOnly={() => setEventsOnly((current) => !current)}
              />
            </div>
          </div>

          <div className="grid min-h-0 flex-1 gap-4 px-4 py-4 sm:px-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="flex min-h-0 flex-col gap-4">
              <RecordingsPlayer
                isIncidentReplay={isIncidentReplay}
                status={status}
                currentCamera={currentCamera}
                activeMarkers={activeMarkers}
                isPlaying={isPlaying}
                onTogglePlaying={() => setIsPlaying((current) => !current)}
                currentActualTime={currentActualTime}
              />

              <RecordingsTimeline
                windowRange={windowRange}
                currentActualTime={currentActualTime}
                markers={markers}
                progress={progress}
                trackRef={trackRef}
                onTimelineSeek={handleTimelineSeek}
              />
            </div>

            <RecordingsSidebar
              isIncidentReplay={isIncidentReplay}
              markers={markers}
            />
          </div>
        </section>
      </div>

  );
}
