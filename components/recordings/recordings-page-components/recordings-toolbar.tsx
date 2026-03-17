"use client";

import { CalendarIcon, ChevronDownIcon, Download, Filter } from "lucide-react";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { CameraItem } from "./types";

type RecordingsToolbarProps = {
  cameras: CameraItem[];
  selectedCamera: string;
  onCameraChange: (value: string) => void;
  calendarOpen: boolean;
  onCalendarOpenChange: (open: boolean) => void;
  selectedDateValue?: Date;
  onDateChange: (value: string) => void;
  eventsOnly: boolean;
  onToggleEventsOnly: () => void;
};

export function RecordingsToolbar({
  cameras,
  selectedCamera,
  onCameraChange,
  calendarOpen,
  onCalendarOpenChange,
  selectedDateValue,
  onDateChange,
  eventsOnly,
  onToggleEventsOnly,
}: RecordingsToolbarProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Select value={selectedCamera} onValueChange={(value) => onCameraChange(value || "")}>
          <SelectTrigger className="h-11 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100">
            <SelectValue placeholder="Select camera" />
          </SelectTrigger>
          <SelectContent align="start">
            {cameras.map((camera) => (
              <SelectItem key={camera.camera_id} value={camera.camera_id}>
                {camera.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Popover open={calendarOpen} onOpenChange={onCalendarOpenChange}>
          <PopoverTrigger className="flex h-11 w-full items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100">
            <CalendarIcon className="size-4" />
            {selectedDateValue ? format(selectedDateValue, "PPP") : "Pick a date"}
            <ChevronDownIcon className="size-4" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDateValue}
              onSelect={(date) => {
                if (date) {
                  onDateChange(format(date, "yyyy-MM-dd"));
                  onCalendarOpenChange(false);
                }
              }}
              defaultMonth={selectedDateValue}
            />
          </PopoverContent>
        </Popover>
      </div>

      <button
        type="button"
        onClick={onToggleEventsOnly}
        className={`flex h-11 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
          eventsOnly
            ? "border-sky-600 bg-sky-600 text-white shadow-sm"
            : "border-slate-200 bg-slate-50 text-slate-700 shadow-sm hover:bg-slate-100"
        }`}
      >
        <Filter className="size-4" />
        Events Only
      </button>

      <button
        type="button"
        className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <Download className="size-4" />
        Download Segment
      </button>
    </div>
  );
}
