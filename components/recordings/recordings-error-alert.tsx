import { AlertTriangle } from "lucide-react";

type RecordingsErrorAlertProps = {
  error: string;
};

export function RecordingsErrorAlert({ error }: RecordingsErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <AlertTriangle className="size-4 shrink-0" />
      {error}
    </div>
  );
}
