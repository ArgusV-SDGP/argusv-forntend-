import React from "react";
import {
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
  Tag,
} from "lucide-react";

export function LiveFeedSidebar() {
  const events = [
    {
      icon: Activity,
      label: "MOTION",
      sub: "LHQ - Nest Reception",
      count: 22177,
      color: "bg-red-500/20 text-red-400",
    },
    {
      icon: DoorOpen,
      label: "DOOR",
      sub: "",
      count: 0,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      icon: Wifi,
      label: "RFID",
      sub: "",
      count: 0,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      icon: AlertTriangle,
      label: "SYSTEM",
      sub: "LHQ.07.018",
      count: 8,
      color: "bg-red-500/20 text-red-400",
    },
    {
      icon: MessageSquare,
      label: "MESSAGES",
      sub: "",
      count: 0,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      icon: ImageIcon,
      label: "SHARED VIEWS",
      sub: "",
      count: 0,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      icon: Tag,
      label: "TAGS",
      sub: "Window Smash",
      count: 34,
      color: "bg-red-500/20 text-red-400",
    },
    {
      icon: Copy,
      label: "IMAGE EXTRACTIONS",
      sub: "First Floor -...",
      count: 2,
      color: "bg-red-500/20 text-red-400",
    },
  ];

  return (
    <div className="w-full lg:w-80 bg-[#0f0f0f] border-l border-white/[0.06] flex flex-col h-full overflow-y-auto min-h-0">
      {/* Actions */}
      <div className="p-4 border-b border-white/[0.06]">
        <h2 className="text-xs font-bold text-white/40 mb-4 tracking-wider flex items-center gap-1">
          <ChevronDown className="size-3" /> ACTIONS
        </h2>
        <div className="space-y-4 px-1">
          <button className="flex items-center gap-3 text-sm font-bold text-white/50 hover:text-white transition-colors w-full">
            <Send className="size-4 text-white/30" />
            SEND MESSAGE
          </button>
          <button className="flex items-center gap-3 text-sm font-bold text-white/50 hover:text-white transition-colors w-full">
            <Share2 className="size-4 text-white/30" />
            SHARE VIEW
          </button>
        </div>
      </div>

      {/* Events */}
      <div className="p-4 flex-1">
        <h2 className="text-xs font-bold text-white/40 mb-2 tracking-wider flex items-center gap-1">
          <ChevronDown className="size-3" /> EVENTS
        </h2>
        <div className="space-y-0.5">
          {events.map((evt, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 hover:bg-white/[0.04] rounded-md cursor-pointer group border-b border-white/[0.04] last:border-0"
            >
              <div className="flex items-start gap-3">
                <evt.icon className="size-4 min-w-4 mt-0.5 text-white/30 group-hover:text-white/60 transition-colors" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white/70">
                    {evt.label}
                  </span>
                  {evt.sub && (
                    <span className="text-[10px] font-semibold text-[#18ffbe]/60 tracking-tight leading-tight mt-0.5">
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
