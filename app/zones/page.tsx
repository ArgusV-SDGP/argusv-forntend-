"use client";

import React from "react";
import { ZonesHeader } from "../../components/zones/zones-header";
import { DrawZone } from "../../components/zones/draw-zone";
import { ZoneList } from "../../components/zones/zone-list";

export default function ZonesPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 overflow-y-auto font-sans selection:bg-blue-200">
      <ZonesHeader />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        <div className="xl:col-span-7 flex flex-col gap-6">
          <DrawZone />
        </div>

        <div className="xl:col-span-5 flex flex-col">
          <ZoneList />
        </div>
      </div>
    </div>
  );
}
