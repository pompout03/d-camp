"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  X, 
  Minus, 
  Bot, 
  User as UserIcon,
  Loader2
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substr(2, 9)}`);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      fetchHistory();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const fetchHistory = async () => {
    try {
      const res = await apiFetch(`/api/chat/history?session_id=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch chat history", err);
    }
  };

  const sendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const userMsg = (customMsg || input).trim();
    if (!userMsg || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    setIsStreaming(true);

    try {
      const response = await apiFetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, session_id: sessionId }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");
      
      const decoder = new TextDecoder();
      let assistantMsg = "";
      
      // Add empty assistant message to be filled
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                assistantMsg += data.chunk;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  const lastMsg = newMsgs[newMsgs.length - 1];
                  if (lastMsg && lastMsg.role === "assistant") {
                    lastMsg.content = assistantMsg;
                  }
                  return [...newMsgs];
                });
              }
            } catch (e) {
              console.error("Error parsing stream chunk", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again later." }]);
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const renderContent = (content: string) => {
    // Simple markdown-style formatting for bold and lists
    return content.split("\n").map((line, i) => {
      // Bold: **text**
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
        return <div key={i} style={{ paddingLeft: "8px", margin: "4px 0" }} dangerouslySetInnerHTML={{ __html: `• ${formattedLine.substring(1)}` }} />;
      }
      return <div key={i} style={{ marginBottom: i < content.split("\n").length - 1 ? "4px" : 0 }} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  const QUICK_ACTIONS = [
    { label: "Summarize Day", icon: "📋", msg: "Give me a briefing of my day" },
    { label: "Urgent items?", icon: "🔥", msg: "What are my most urgent items?" },
    { label: "Check Meetings", icon: "📅", msg: "What's on my calendar today?" },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[88px] md:bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white border-none cursor-pointer z-[1000] transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, var(--accent) 0%, #00a8ff 100%)",
          boxShadow: "0 8px 24px rgba(0, 212, 255, 0.3)",
        }}
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div
      className={`fixed ${isMinimized ? 'h-[60px]' : 'h-[calc(100vh-100px)] md:h-[500px]'} 
        bottom-[80px] md:bottom-6 right-0 md:right-6 
        w-full md:w-[360px] 
        bg-[#0d1117f2] backdrop-blur-xl
        md:rounded-2xl border border-white/10 shadow-2xl
        flex flex-col overflow-hidden z-[1000] transition-all duration-300
      `}
    >
      <div
        style={{
          padding: "16px",
          background: "rgba(255, 255, 255, 0.03)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(0, 212, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={18} color="var(--accent)" />
          </div>
          <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>Decamp AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => setIsMinimized(!isMinimized)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
            <Minus size={18} />
          </button>
          <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {messages.length === 0 && !loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                <div style={{ textAlign: "center", padding: "20px 10px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  <Bot size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
                  <p>Hello! I'm your Decamp AI assistant. Ask me anything about your emails or schedule.</p>
                </div>
                <div style={{ display: "grid", gap: "8px" }}>
                  {QUICK_ACTIONS.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(undefined, action.msg)}
                      style={{
                        padding: "10px 14px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        color: "var(--text-secondary)",
                        fontSize: "0.85rem",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.borderColor = "var(--accent)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      }}
                    >
                      <span>{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: "flex", 
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start" 
                }}
              >
                <div 
                  style={{ 
                    maxWidth: "85%",
                    padding: "10px 16px",
                    borderRadius: "14px",
                    fontSize: "0.88rem",
                    lineHeight: 1.6,
                    background: msg.role === "user" ? "var(--accent)" : "rgba(255,255,255,0.06)",
                    color: msg.role === "user" ? "white" : "var(--text-primary)",
                    border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.05)",
                    borderBottomRightRadius: msg.role === "user" ? "2px" : "14px",
                    borderBottomLeftRadius: msg.role === "assistant" ? "2px" : "14px",
                    boxShadow: msg.role === "user" ? "0 4px 12px rgba(0, 212, 255, 0.2)" : "none"
                  }}
                >
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <div style={{ padding: "10px 14px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)", borderBottomLeftRadius: "2px" }}>
                  <Loader2 size={16} className="animate-spin" color="var(--text-muted)" />
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => sendMessage(e)}
            style={{
              padding: "16px",
              borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isStreaming ? "Thinking..." : "Type a message..."}
              disabled={isStreaming}
              style={{
                flex: 1,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "0.88rem",
                color: "white",
                outline: "none",
                opacity: isStreaming ? 0.6 : 1
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: input.trim() && !loading ? "var(--accent)" : "rgba(255,255,255,0.05)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: input.trim() && !loading ? "pointer" : "default",
                transition: "background 0.2s ease",
              }}
            >
              {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
