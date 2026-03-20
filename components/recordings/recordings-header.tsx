import { Film } from "lucide-react";

export function RecordingsHeader() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Film className="size-6 text-blue-600" />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recordings</h1>
        <p className="text-sm text-slate-500">Browse and play recorded video segments</p>
      </div>
    </div>
  );
}
