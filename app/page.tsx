import React from "react";
import {
  Play,
  Tag,
  Camera as CameraIcon,
  Circle,
  MonitorPlay,
  Maximize,
  Video,
  Send,
  Share2,
  Activity,
  DoorOpen,
  Wifi,
  AlertTriangle,
  MessageSquare,
  Image as ImageIcon,
  Copy,
  ChevronDown,
} from "lucide-react";

export default function Home() {
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

  const events = [
    {
      icon: Activity,
      label: "MOTION",
      sub: "LHQ - Nest Reception",
      count: 22177,
      color: "bg-red-500 text-white",
    },
    {
      icon: DoorOpen,
      label: "DOOR",
      sub: "",
      count: 0,
      color: "bg-blue-500 text-white",
    },
    {
      icon: Wifi,
      label: "RFID",
      sub: "",
      count: 0,
      color: "bg-blue-500 text-white",
    },
    {
      icon: AlertTriangle,
      label: "SYSTEM",
      sub: "LHQ.07.018",
      count: 8,
      color: "bg-red-500 text-white",
    },
    {
      icon: MessageSquare,
      label: "MESSAGES",
      sub: "",
      count: 0,
      color: "bg-blue-500 text-white",
    },
    {
      icon: ImageIcon,
      label: "SHARED VIEWS",
      sub: "",
      count: 0,
      color: "bg-blue-500 text-white",
    },
    {
      icon: Tag,
      label: "TAGS",
      sub: "Window Smash",
      count: 34,
      color: "bg-red-500 text-white",
    },
    {
      icon: Copy,
      label: "IMAGE EXTRACTIONS",
      sub: "First Floor -...",
      count: 2,
      color: "bg-red-500 text-white",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] bg-white text-slate-900 border-t border-gray-200 lg:overflow-hidden">
      {/* Main Camera Grid */}
      <div className="flex-1 p-2 sm:p-4 bg-slate-100 lg:overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-max lg:grid-rows-3 gap-2 lg:h-full lg:min-h-[600px]">
          {cameras.map((cam, idx) => (
            <div
              key={cam.id + idx}
              className={`relative bg-black rounded-lg overflow-hidden border-2 flex flex-col group min-h-[250px] lg:min-h-0 ${
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

      {/* Right Sidebar */}
      <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col lg:h-full lg:overflow-y-auto min-h-0">
        {/* Actions */}
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xs font-bold text-gray-500 mb-4 tracking-wider flex items-center gap-1">
            <ChevronDown className="size-3" /> ACTIONS
          </h2>
          <div className="space-y-4 px-1">
            <button className="flex items-center gap-3 text-sm font-bold text-gray-600 hover:text-black transition-colors w-full">
              <Send className="size-4 text-gray-400" />
              SEND MESSAGE
            </button>
            <button className="flex items-center gap-3 text-sm font-bold text-gray-600 hover:text-black transition-colors w-full">
              <Share2 className="size-4 text-gray-400" />
              SHARE VIEW
            </button>
          </div>
        </div>

        {/* Events */}
        <div className="p-4 flex-1">
          <h2 className="text-xs font-bold text-gray-500 mb-2 tracking-wider flex items-center gap-1">
            <ChevronDown className="size-3" /> EVENTS
          </h2>
          <div className="space-y-0.5">
            {events.map((evt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md cursor-pointer group border-b border-gray-100/50 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <evt.icon className="size-4 min-w-4 mt-0.5 text-gray-400 group-hover:text-gray-700 transition-colors" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700">
                      {evt.label}
                    </span>
                    {evt.sub && (
                      <span className="text-[10px] font-semibold text-yellow-600 tracking-tight leading-tight mt-0.5">
                        {evt.sub}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`px-1.5 py-0.5 rounded text-[10px] min-w-[20px] text-center font-bold ${evt.color}`}
                >
                  {evt.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
