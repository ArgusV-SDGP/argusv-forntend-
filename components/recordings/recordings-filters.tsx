"use client";

import { format } from "date-fns";
import { CalendarDays, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type RecordingsFiltersProps = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

export function RecordingsFilters({
  selectedDate,
  onDateChange,
  searchQuery,
  onSearchQueryChange,
}: RecordingsFiltersProps) {

  return (
    <div className=" p-4 md:p-5 mb-5">
      <div className="flex flex-col lg:flex-row gap-3 lg:justify-end lg:items-center">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-11 px-4 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-sm font-medium flex items-center gap-2 hover:bg-slate-100 transition-colors"
            >
              <CalendarDays className="size-4 text-slate-500" />
              {format(selectedDate, "MMMM d, yyyy").toUpperCase()}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  onDateChange(date);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <label className="relative w-full lg:w-[30rem] xl:w-[36rem]">
          <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder='Search events: e.g., "Find red vehicle after 3 PM"'
            className="w-full h-11 pl-9 pr-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </label>
      </div>
    </div>
  );
}
