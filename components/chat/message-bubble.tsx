"use client";

import { Bot, Sparkles, User } from "lucide-react";
import { ChatMessage } from "./types";
import SourceCard from "./source-card";

export default function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`size-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
        isUser
          ? "bg-[#18ffbe]/15 border border-[#18ffbe]/30"
          : "bg-white/[0.06] border border-white/10"
      }`}>
        {isUser
          ? <User className="size-4 text-[#18ffbe]" />
          : <Bot className="size-4 text-white/60" />
        }
      </div>

      <div className={`flex-1 max-w-[80%] space-y-3 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[#18ffbe]/10 border border-[#18ffbe]/20 text-white rounded-tr-sm"
            : msg.error
              ? "bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-sm"
              : "bg-white/[0.06] border border-white/[0.08] text-white/80 rounded-tl-sm"
        }`}>
          {msg.content}
        </div>

        {msg.sources && msg.sources.length > 0 && (
          <div className="w-full space-y-2">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="size-3" />
              {msg.sources.length} source{msg.sources.length !== 1 ? "s" : ""} from footage
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {msg.sources.map((clip) => (
                <SourceCard key={clip.event_id} clip={clip} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
