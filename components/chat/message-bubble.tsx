"use client";

import { Bot, Sparkles, User } from "lucide-react";
import { ChatMessage } from "./types";
import SourceCard from "./source-card";

export default function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`size-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
        isUser ? "bg-violet-600" : "bg-slate-800"
      }`}>
        {isUser
          ? <User className="size-4 text-white" />
          : <Bot className="size-4 text-white" />
        }
      </div>

      <div className={`flex-1 max-w-[80%] space-y-3 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-violet-600 text-white rounded-tr-sm"
            : msg.error
              ? "bg-red-50 border border-red-200 text-red-700 rounded-tl-sm"
              : "bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-sm"
        }`}>
          {msg.content}
        </div>

        {msg.sources && msg.sources.length > 0 && (
          <div className="w-full space-y-2">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
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
