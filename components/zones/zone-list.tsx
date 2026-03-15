"use client";

import React from "react";
import { Activity, RefreshCw, PenTool, Trash2, Clock } from "lucide-react";
import type { ZoneListItem } from "@/lib/mappers/zone.mappers";

type ZoneListProps = {
  zones: ZoneListItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string;
  onRefresh: () => void;
};

export function ZoneList({
  zones,
  isLoading,
  isRefreshing,
  error,
  onRefresh,
}: ZoneListProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="size-5 text-indigo-500" />
            Zone List
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Current configured zones from API
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium transition-colors text-slate-600 disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="size-10 text-slate-700 mb-3" />
            <p className="text-slate-400 font-medium">Loading zones...</p>
          </div>
        ) : null}

        {zones.map((zone) => (
          <div
            key={zone.id}
            className="bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white rounded-xl p-4 transition-all group flex flex-col gap-3 relative overflow-hidden shadow-sm hover:shadow"
          >
            <div
              className={`absolute top-0 left-0 w-1 h-full ${zone.active ? "bg-green-500" : "bg-slate-400"}`}
            ></div>
            <div className="flex justify-between items-start ml-2">
              <h3 className="text-base font-bold text-slate-800 tracking-wide">
                {zone.name}
              </h3>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  <PenTool className="size-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs ml-2">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="text-slate-500">Type:</span>
                <span className="capitalize font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {zone.type}
                </span>
              </div>
              {zone.dwell > 0 && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="size-3.5 text-slate-500" />
                  <span className="text-slate-500">Dwell:</span>
                  <span className="font-medium text-slate-700">
                    {zone.dwell}s
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="text-slate-500">Active:</span>
                <span
                  className={`font-medium ${zone.active ? "text-green-600" : "text-slate-500"}`}
                >
                  {zone.active.toString()}
                </span>
              </div>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-3 text-[10px] ml-2 text-slate-500 font-mono">
              <span>Points: {zone.points}</span>
              <span>•</span>
              <span className="truncate max-w-[200px]" title={zone.id}>
                ID: {zone.id}
              </span>
            </div>
          </div>
        ))}

        {!isLoading && zones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="size-10 text-slate-700 mb-3" />
            <p className="text-slate-400 font-medium">
              No zones configured yet.
            </p>
            <p className="text-slate-600 text-sm mt-1">
              Use the canvas to draw a new zone.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
