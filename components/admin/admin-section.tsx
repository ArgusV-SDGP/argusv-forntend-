"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type AdminSectionProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function AdminSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: AdminSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between bg-slate-50 px-6 py-4 transition-colors hover:bg-slate-100"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
          {icon}
          {title}
        </span>
        {open ? (
          <ChevronUp className="size-4 text-slate-400" />
        ) : (
          <ChevronDown className="size-4 text-slate-400" />
        )}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}
