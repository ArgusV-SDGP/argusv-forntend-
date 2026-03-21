"use client";

import { useEffect, useRef, useState } from "react";
import { authFetch } from "@/lib/client-services/auth.service";
import { ChatMessage, CameraItem } from "@/components/chat/types";
import ChatHeader from "@/components/chat/chat-header";
import ChatEmptyState from "@/components/chat/chat-empty-state";
import ChatInput from "@/components/chat/chat-input";
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

  useEffect(() => {
    authFetch("/api/cameras")
      .then((r) => r.json())
      .then((d) => setCameras(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

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
      const body: Record<string, unknown> = { message: q, history, limit: sourceLimit };
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
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 font-sans">

      <ChatHeader
        cameras={cameras}
        selectedCam={selectedCam}
        onCamChange={setSelectedCam}
        sourceLimit={sourceLimit}
        onSourceLimitChange={setSourceLimit}
        hasMessages={messages.length > 0}
        onClear={() => setMessages([])}
      />

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.length === 0 && (
            <ChatEmptyState
              selectedCam={selectedCam}
              cameras={cameras}
              onSend={send}
            />
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      <ChatInput
        input={input}
        onChange={setInput}
        onSend={() => send(input)}
        loading={loading}
        selectedCam={selectedCam}
        cameras={cameras}
        onClearCam={() => setSelectedCam("all")}
      />

    </div>
  );
}
