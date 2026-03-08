"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export function ZonesHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Shield className="size-8 text-blue-500" />
          Zone Configuration
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Draw polygons to configure monitoring areas and automated alerts.
        </p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all text-sm font-medium text-slate-700 shadow-sm"
      >
        <ArrowLeft className="size-4" />
        Back to Live Feed
      </Link>
    </div>
  );
}
