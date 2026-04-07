"use client";

import { useEffect, useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  ExternalLink, 
  RefreshCw,
  Plus,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "@/features/dashboard/context/AccountContext";
import { apiFetch } from "@/lib/api";

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink: string;
  hangoutLink?: string;
}

export default function CalendarPage() {
  const { user, loading: contextLoading } = useAccount();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch("/api/calendar/today");
      if (!response.ok) throw new Error("Failed to fetch calendar data. Please ensure you are logged in.");
      const data = await response.json();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong while fetching your schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!contextLoading && user) {
      fetchEvents();
    }
  }, [contextLoading, user]);

  const formatTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return "All Day";
    return new Date(dateTimeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatus = (start?: string, end?: string) => {
    if (!start) return "Upcoming";
    const now = new Date();
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date(startTime.getTime() + 30 * 60000);

    if (now > endTime) return "Completed";
    if (now >= startTime && now <= endTime) return "In Progress";
    return "Upcoming";
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", animation: "fade-in 0.8s ease-out" }}>
      {/* Header Section */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-end", 
        marginBottom: "40px",
        padding: "0 8px"
      }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: "2.8rem", fontWeight: 900, marginBottom: "8px", letterSpacing: "-0.02em" }}>
            Today's Agenda
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "10px" }}>
            <CalendarIcon size={18} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            onClick={fetchEvents}
            className="btn-secondary"
            style={{ 
              padding: "10px 18px", 
              borderRadius: "14px", 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              fontSize: "0.9rem"
            }}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            Sync Calendar
          </button>
          <button 
            className="btn-primary"
            style={{ 
              padding: "10px 22px", 
              borderRadius: "14px", 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              fontSize: "0.9rem"
            }}
            onClick={() => window.open("https://calendar.google.com", "_blank")}
          >
            <Plus size={20} />
            New Event
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: "20px" }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass" style={{ height: "140px", opacity: 0.4, animation: "pulse 2s infinite ease-in-out" }} />
          ))}
        </div>
      ) : error ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass" 
          style={{ padding: "60px 40px", textAlign: "center", border: "1px solid rgba(255,87,101,0.2)" }}
        >
          <AlertCircle size={48} style={{ color: "var(--high)", marginBottom: "20px" }} />
          <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px" }}>Connection Issue</h3>
          <p style={{ color: "var(--text-secondary)", maxWidth: "450px", margin: "0 auto 24px" }}>{error}</p>
          <button className="btn-primary" style={{ padding: "12px 24px" }} onClick={fetchEvents}>Reconnect & Sync</button>
        </motion.div>
      ) : events.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass" 
          style={{ padding: "80px 40px", textAlign: "center", background: "rgba(0, 180, 216, 0.03)" }}
        >
          <div style={{ 
            width: "80px", 
            height: "80px", 
            borderRadius: "50%", 
            background: "var(--accent-dim)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            margin: "0 auto 24px",
            color: "var(--accent)"
          }}>
            <CalendarIcon size={36} />
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "12px" }}>All clear for today!</h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto", fontSize: "1.1rem", lineHeight: 1.6 }}>
            Your schedule is currently empty. It's the perfect time to tackle your high-priority emails or focus on deep work sessions.
          </p>
        </motion.div>
      ) : (
        <div style={{ display: "grid", gap: "32px" }}>
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingLeft: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                <Clock size={16} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>Timeline</h3>
            </div>
            
            <div style={{ display: "grid", gap: "16px" }}>
              <AnimatePresence mode="popLayout">
                {events.map((event, idx) => {
                  const status = getStatus(event.start.dateTime, event.end.dateTime);
                  const isNow = status === "In Progress";
                  const isDone = status === "Completed";

                  return (
                       <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: idx * 0.08 }}
                        className={`${isNow ? "glass-bright" : "glass"} flex flex-col md:flex-row p-4 md:p-7 gap-4 md:gap-7`}
                        style={{ 
                          position: "relative",
                          overflow: "hidden",
                          borderLeft: isNow ? "4px solid var(--accent)" : "1px solid var(--border)",
                          opacity: isDone ? 0.6 : 1,
                          transition: "all 0.3s ease"
                        }}
                      >
                      {isNow && (
                        <div style={{ 
                          position: "absolute", 
                          top: 0, right: 0, 
                          width: "150px", height: "150px", 
                          background: "var(--accent)", 
                          filter: "blur(70px)", 
                          opacity: 0.1, 
                          pointerEvents: "none" 
                        }} />
                      )}

                      {/* Time Indicator */}
                      <div style={{ 
                        minWidth: "100px", 
                        display: "flex", 
                        flexDirection: "column", 
                        justifyContent: "center",
                        borderRight: "1px solid var(--border)",
                        paddingRight: "20px"
                      }}>
                        <p style={{ fontSize: "1.15rem", fontWeight: 800, color: isNow ? "var(--accent)" : "var(--text-primary)" }}>
                          {formatTime(event.start.dateTime)}
                        </p>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          {event.end.dateTime ? formatTime(event.end.dateTime) : "Full Day"}
                        </p>
                      </div>

                      {/* Event Details */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                          <h4 style={{ 
                            fontSize: "1.3rem", 
                            fontWeight: 700, 
                            color: isDone ? "var(--text-secondary)" : "var(--text-primary)",
                            textDecoration: isDone ? "line-through" : "none"
                          }}>
                            {event.summary}
                          </h4>
                          <span 
                            className={`badge ${isNow ? "pulse-ring" : ""}`}
                            style={{ 
                              fontSize: "0.75rem", 
                              fontWeight: 700,
                              padding: "4px 12px", 
                              borderRadius: "20px", 
                              background: isNow ? "var(--accent-dim)" : isDone ? "rgba(255,255,255,0.05)" : "rgba(0, 212, 255, 0.05)",
                              color: isNow ? "var(--accent)" : isDone ? "var(--text-muted)" : "var(--sea-300)",
                              border: `1px solid ${isNow ? "var(--accent)" : "transparent"}`
                            }}
                          >
                            {status}
                          </span>
                        </div>

                        {event.description && (
                          <p style={{ 
                            fontSize: "0.95rem", 
                            color: "var(--text-secondary)", 
                            marginBottom: "18px", 
                            lineHeight: 1.6, 
                            maxWidth: "700px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}>
                            {event.description}
                          </p>
                        )}

                        <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
                          {event.location && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                              <MapPin size={16} />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.hangoutLink && (
                            <a 
                              href={event.hangoutLink} 
                              target="_blank" 
                              rel="noreferrer"
                              className="btn-secondary"
                              style={{ 
                                padding: "6px 14px", 
                                borderRadius: "10px", 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "8px", 
                                fontSize: "0.85rem",
                                background: isNow ? "var(--accent-dim)" : "transparent",
                                borderColor: isNow ? "var(--accent)" : "var(--border-bright)"
                              }}
                            >
                              <Video size={16} />
                              Join Meeting
                            </a>
                          )}
                          <a 
                            href={event.htmlLink} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "6px", 
                              color: "var(--text-muted)", 
                              fontSize: "0.9rem", 
                              textDecoration: "none",
                              transition: "color 0.2s" 
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = "var(--accent)"}
                            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                          >
                            <ExternalLink size={16} />
                            Google Calendar
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.01); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        .spin {
          animation: spin 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
}
