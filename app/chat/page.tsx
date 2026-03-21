"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  Camera,
  ChevronRight,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { authFetch } from "@/lib/client-services/auth.service";
import { ChatMessage, CameraItem } from "@/components/chat/types";
import { SUGGESTED } from "@/components/chat/helpers";
import MessageBubble from "@/components/chat/message-bubble";
import TypingIndicator from "@/components/chat/typing-indicator";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [selectedCam, setSelectedCam] = useState("all");
  const [sourceLimit, setSourceLimit] = useState(6);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load cameras for filter
  useEffect(() => {
    authFetch("/api/cameras")
      .then((r) => r.json())
      .then((d) => setCameras(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: q,
    };

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        message: q,
        history,
        limit: sourceLimit,
      };
      if (selectedCam !== "all") body.camera_id = selectedCam;

      const res = await authFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? "Request failed");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          sources: data.sources ?? [],
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: e instanceof Error ? e.message : "Something went wrong.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 font-sans">

      {/* Top bar */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-slate-900 flex items-center justify-center">
            <Bot className="size-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-tight">ArgusV Chat</p>
            <p className="text-[11px] text-slate-400">Ask questions about your footage</p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Camera filter */}
          <div className="flex items-center gap-1.5">
            <Camera className="size-3.5 text-slate-400" />
            <select
              value={selectedCam}
              onChange={(e) => setSelectedCam(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All cameras</option>
              {cameras.map((c) => (
                <option key={c.camera_id} value={c.camera_id}>
                  {c.name} ({c.camera_id})
                </option>
              ))}
            </select>
          </div>

          {/* Source count */}
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-slate-400" />
            <select
              value={sourceLimit}
              onChange={(e) => setSourceLimit(Number(e.target.value))}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value={4}>4 sources</option>
              <option value={6}>6 sources</option>
              <option value={10}>10 sources</option>
            </select>
          </div>

          {/* Clear */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
            >
              <X className="size-3.5" />Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-20 pt-10">
            <div className="size-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-4 shadow-lg">
              <Bot className="size-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">ArgusV Security AI</h2>
            <p className="text-sm text-slate-400 mb-8 max-w-sm">
              Ask anything about your camera footage. Answers are grounded in real VLM-analysed detections.
            </p>

            {/* Camera scope indicator */}
            <div className="mb-6 px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
              <Camera className="size-3" />
              {selectedCam === "all"
                ? "Searching across all cameras"
                : `Filtered to: ${cameras.find(c => c.camera_id === selectedCam)?.name ?? selectedCam}`}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="text-left text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-colors flex items-start gap-2 shadow-sm"
                >
                  <ChevronRight className="size-3.5 shrink-0 mt-0.5 text-slate-400" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 bg-white border-t border-slate-200 px-4 md:px-6 py-4">
        {selectedCam !== "all" && (
          <div className="flex items-center gap-1.5 mb-2 text-[11px] text-violet-600 font-medium">
            <Camera className="size-3" />
            Filtering to {cameras.find(c => c.camera_id === selectedCam)?.name ?? selectedCam} only
            <button
              type="button"
              onClick={() => setSelectedCam("all")}
              className="ml-1 text-slate-400 hover:text-slate-600"
            >
              <X className="size-3" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your footage… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-colors max-h-32 overflow-y-auto"
            style={{ height: "auto" }}
            onInput={(e) => {
              const el = e.target as HTMLTextAreaElement;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
            }}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="size-11 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shrink-0"
          >
            <Send className="size-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          Answers grounded in VLM-analysed detections · Requires <span className="font-mono">OPENAI_API_KEY</span>
        </p>
      </div>

    </div>
  );
}
