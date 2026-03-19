import { CalendarDays, Search } from "lucide-react";

export function RecordingsFilters() {
  return (
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
  );
}
