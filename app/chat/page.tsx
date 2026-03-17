"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Loader2,
  Bot,
  User,
  Camera,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Search,
  Trash2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface SourceClip {
  event_id: string;
  camera_id: string;
  timestamp: string;
  vlm_summary: string | null;
  distance: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: SourceClip[];
  error?: boolean;
}

function formatTimestamp(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SourcesPanel({ sources }: { sources: SourceClip[] }) {
  const [open, setOpen] = useState(false);
  if (!sources.length) return null;

  return (
    <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-500 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Search className="size-3" />
          {sources.length} source clip{sources.length !== 1 ? "s" : ""} retrieved
        </span>
        {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
      </button>
      {open && (
        <div className="divide-y divide-slate-100">
          {sources.map((src) => (
            <div key={src.event_id} className="px-3 py-2.5 bg-white">
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-1">
                <span className="flex items-center gap-1">
                  <Camera className="size-3" />
                  {src.camera_id}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatTimestamp(src.timestamp)}
                </span>
                <span className="text-slate-400 font-mono">
                  sim: {(1 - src.distance).toFixed(2)}
                </span>
              </div>
              {src.vlm_summary && (
                <p className="text-xs text-slate-700 leading-relaxed">{src.vlm_summary}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          isUser ? "bg-blue-600 text-white" : "bg-slate-800 text-white"
        }`}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-blue-600 text-white rounded-tr-sm"
              : message.error
              ? "bg-red-50 text-red-700 border border-red-200 rounded-tl-sm"
              : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
          }`}
        >
          {message.error && (
            <AlertCircle className="size-4 inline mr-1.5 mb-0.5" />
          )}
          {message.content}
        </div>
        {!isUser && message.sources && (
          <div className="w-full mt-1">
            <SourcesPanel sources={message.sources} />
          </div>
        )}
      </div>
    </div>
  );
}

const SUGGESTED_QUESTIONS = [
  "Were there any high-threat events in the last hour?",
  "Show me any incidents involving people loitering.",
  "What happened near the entrance today?",
  "Any suspicious activity detected overnight?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraFilter, setCameraFilter] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await apiFetch<{ answer: string; sources: SourceClip[] }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: trimmed,
          history,
          camera_id: cameraFilter.trim() || undefined,
          limit: 6,
        }),
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: err.message ?? "Request failed.", error: true },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-slate-800 flex items-center justify-center">
            <Bot className="size-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900">ArgusV Chat</h1>
            <p className="text-[11px] text-slate-500">Ask about camera footage and events</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
              Camera
            </label>
            <input
              type="text"
              value={cameraFilter}
              onChange={(e) => setCameraFilter(e.target.value)}
              placeholder="All cameras"
              title="Filter by camera ID"
              className="w-32 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none"
            />
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              title="Clear conversation"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-slate-200 text-xs font-medium text-slate-500 transition-colors"
            >
              <Trash2 className="size-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center pb-8">
            <div className="size-16 rounded-2xl bg-slate-800 flex items-center justify-center">
              <MessageSquare className="size-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Ask about your cameras</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Search through detected events using natural language. Answers are grounded in real footage summaries.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="text-left px-4 py-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-sm text-slate-700 transition-all shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
              <Bot className="size-4 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Searching footage and generating answer...
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-slate-200 px-4 md:px-6 py-3 shrink-0">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about camera footage… (Enter to send, Shift+Enter for new line)"
            title="Chat input"
            rows={1}
            className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none resize-none transition-all max-h-32 overflow-y-auto"
            style={{ minHeight: "44px" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 128) + "px";
            }}
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="size-11 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors shrink-0"
            title="Send message"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          Answers are grounded in real footage summaries via semantic search
        </p>
      </div>
    </div>
  );
}
