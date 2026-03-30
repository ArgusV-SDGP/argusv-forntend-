"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export function ZonesHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <div className="rounded-xl bg-[#18ffbe]/10 p-2">
            <Shield className="size-6 text-[#18ffbe]" />
          </div>
          Zone Configuration
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Draw polygons to configure monitoring areas and automated alerts.
        </p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all text-sm font-medium text-white/60 hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to Live Feed
      </Link>
    </div>
  );
}
