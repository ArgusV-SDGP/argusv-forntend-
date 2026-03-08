import React from "react";
import {
  Play,
  Tag,
  Camera as CameraIcon,
  Circle,
  MonitorPlay,
  Maximize,
  Video,
} from "lucide-react";
import { LiveFeedSidebar } from "@/components/live-feed/live-feed-sidebar";

export function LiveFeed() {
  const cameras = [
    {
      id: "LHQ.07.017",
      time: "2/15/2012 7:13:45 AM",
      span: "col-span-1 md:col-span-2 row-span-1 md:row-span-2",
      active: true,
    },
    {
      id: "LHQ.07.003",
      time: "2/15/2012 7:14:14 AM",
      span: "col-span-1 row-span-1",
      active: false,
    },
    {
      id: "LHQ.07.015",
      time: "2/15/2012 7:14:14 AM",
      span: "col-span-1 row-span-1",
      active: false,
    },
    {
      id: "LHQ.07.020",
      time: "2/15/2012 7:14:33 AM",
      span: "col-span-1 row-span-1",
      active: false,
    },
    {
      id: "LHQ.07.018",
      time: "2/15/2012 7:14:14 AM",
      span: "col-span-1 row-span-1",
      active: false,
    },
    {
      id: "LHQ.07.013",
      time: "2/15/2012 7:14:14 AM",
      span: "col-span-1 row-span-1",
      active: false,
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-white text-slate-900 border-t border-gray-200 overflow-hidden">
      {/* Main Camera Grid */}
      <div className="flex-1 p-2 bg-slate-100 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-2 h-full min-h-[600px]">
          {cameras.map((cam, idx) => (
            <div
              key={cam.id + idx}
              className={`relative bg-black rounded-lg overflow-hidden border-2 flex flex-col group ${
                cam.active ? "border-yellow-400" : "border-slate-800"
              } ${cam.span}`}
            >
              {/* Header */}
              <div
                className={`absolute top-0 left-0 right-0 p-2 flex justify-between text-xs font-bold z-10 bg-gradient-to-b from-black/80 to-transparent ${
                  cam.active ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Play
                    className={`size-3 fill-current ${cam.active ? "text-green-500" : "text-gray-400"}`}
                  />
                  <span>{cam.id}</span>
                </div>
                <span>{cam.time}</span>
              </div>

              {/* Fake Video Content */}
              <div className="flex-1 w-full bg-slate-900 flex items-center justify-center">
                <Video className="size-10 text-slate-700 opacity-50" />
              </div>

              {/* Toolbar (Bottom) */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-md flex items-center gap-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Tag className="size-4 hover:text-yellow-400 cursor-pointer transition-colors" />
                <CameraIcon className="size-4 hover:text-yellow-400 cursor-pointer transition-colors" />
                <Circle className="size-4 hover:text-red-500 cursor-pointer text-red-500 transition-colors" />
                <div className="w-px h-4 bg-gray-600 mx-1"></div>
                <MonitorPlay className="size-4 hover:text-yellow-400 cursor-pointer transition-colors" />
                <Maximize className="size-4 hover:text-yellow-400 cursor-pointer transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <LiveFeedSidebar />
    </div>
  );
}
