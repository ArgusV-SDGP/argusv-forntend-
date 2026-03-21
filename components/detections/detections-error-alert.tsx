import { AlertTriangle } from "lucide-react";

type DetectionsErrorAlertProps = {
  error: string;
};

export function DetectionsErrorAlert({ error }: DetectionsErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <AlertTriangle className="size-4 shrink-0" />
      {error}
    </div>
  );
}
