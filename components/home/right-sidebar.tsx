import React from "react";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  Copy,
  DoorOpen,
  Image as ImageIcon,
  MessageSquare,
  Send,
  Share2,
  Tag,
  Wifi,
} from "lucide-react";

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

export function RightSidebar() {
  return (
    <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col lg:h-full lg:overflow-y-auto min-h-0">
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
  );
}
