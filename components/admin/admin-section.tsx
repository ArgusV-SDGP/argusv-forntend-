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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between bg-white/[0.03] px-6 py-4 transition-colors hover:bg-white/[0.06]"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-white/80">
          {icon}
          {title}
        </span>
        {open ? (
          <ChevronUp className="size-4 text-white/30" />
        ) : (
          <ChevronDown className="size-4 text-white/30" />
        )}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}
