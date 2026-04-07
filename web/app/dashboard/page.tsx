"use client";

import { useEffect, useState } from "react";
import { 
  Mail, 
  Clock, 
  ShieldCheck, 
  Star, 
  ChevronRight,
  TrendingDown,
  RefreshCw,
  Zap,
  Calendar as CalendarIcon,
  MapPin
} from "lucide-react";
import { useAccount } from "@/features/dashboard/context/AccountContext";
import { apiFetch } from "@/lib/api";

interface StatsResponse {
  total_analyzed: number;
  high_priority_count: number;
  needs_response_count: number;
  meetings_count: number;
}

interface EmailResponse {
  id: string;
  sender: string;
  subject: string;
  synced_at: string;
  priority: string;
}

export default function DashboardHome() {
  const { user, loading: contextLoading } = useAccount();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recentEmails, setRecentEmails] = useState<EmailResponse[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    let completed = 0;
    const checkDone = () => { completed++; if (completed === 3) setLoading(false); };

    apiFetch("/api/inbox/stats")
      .then(async res => { if (res.ok) setStats(await res.json()); })
      .catch(err => console.error(err))
      .finally(checkDone);

    apiFetch("/api/inbox?priority=high")
      .then(async res => { if (res.ok) { const data = await res.json(); setRecentEmails(data.slice(0, 4)); } })
      .catch(err => console.error(err))
      .finally(checkDone);

    apiFetch("/api/calendar/today")
      .then(async res => { if (res.ok) setMeetings(await res.json()); })
      .catch(err => console.error(err))
      .finally(checkDone);
  };

  useEffect(() => {
    if (!contextLoading && user) {
      fetchData();
    }
  }, [contextLoading, user]);

  const statCards = [
    { 
      label: "Emails Analyzed", 
      value: stats?.total_analyzed?.toLocaleString() || "0", 
      icon: Mail, 
      color: "var(--primary)" 
    },
    { 
      label: "Meetings Found", 
      value: stats?.meetings_count?.toString() || "0", 
      icon: Star, 
      color: "#10b981" 
    },
    { 
      label: "High Priority", 
      value: stats?.high_priority_count?.toString() || "0", 
      icon: ShieldCheck, 
      color: "#ef4444" 
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getUTCHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", animation: "fade-in 0.5s ease-out" }}>
      {/* Welcome Banner */}
      <div 
        className="glass-bright"
        style={{
          padding: "32px",
          borderRadius: "20px",
          marginBottom: "32px",
          background: "linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(2,6,23,0.4) 100%)",
          border: "1px solid rgba(6, 182, 212, 0.2)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "var(--primary)", filter: "blur(100px)", opacity: 0.15, borderRadius: "50%" }}></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
              {getGreeting()}, {user?.name ? user.name.split(" ")[0] : "Commander"} 👋
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "600px" }}>
              Your AI has triaged your inbox. You have <strong style={{ color: "var(--primary)" }}>{stats?.high_priority_count || 0} high-priority</strong> emails requiring your attention.
            </p>
          </div>
          <button 
            onClick={fetchData}
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.9rem",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass p-6 rounded-2xl flex items-center gap-5">
              <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: `rgba(${stat.color === "var(--primary)" ? "6,182,212" : stat.color === "var(--accent)" ? "14,165,233" : "16,185,129"}, 0.15)`, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                <Icon size={28} />
              </div>
              <div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "4px" }}>{stat.label}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <h3 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{stat.value}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Left Column: Priority Inbox */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>Priority Inbox</h2>
            <a href="/dashboard/inbox" style={{ textDecoration: "none", color: "var(--primary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "4px" }}>
              View All <ChevronRight size={16} />
            </a>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentEmails.length > 0 ? (
              recentEmails.map((email) => (
                <div 
                  key={email.id} 
                  className="glass"
                  style={{ 
                    padding: "16px 20px", 
                    borderRadius: "12px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    borderLeft: "3px solid var(--primary)",
                    background: "rgba(6, 182, 212, 0.05)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onClick={() => window.location.href = `/dashboard/inbox`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
                    <div style={{ 
                      width: "40px", 
                      height: "40px", 
                      borderRadius: "50%", 
                      background: "var(--sea-800)", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      fontSize: "0.9rem"
                    }}>
                      {email.sender.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>{email.sender.split("<")[0].trim()}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{new Date(email.synced_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 500 }}>{email.subject}</span>
                        <span style={{ padding: "2px 8px", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", borderRadius: "12px", fontSize: "0.7rem", fontWeight: 600 }}>High Priority</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass" style={{ padding: "40px", borderRadius: "12px", textAlign: "center", color: "var(--text-muted)" }}>
                <Mail size={32} style={{ marginBottom: "12px", opacity: 0.3 }} />
                <p>No high-priority emails currently. All caught up!</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: AI Assistant Actions */}
        <section>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>AI Insights</h2>
          
          <div className="glass-bright" style={{ padding: "24px", borderRadius: "16px", background: "linear-gradient(180deg, rgba(2,6,23,0.4) 0%, rgba(6,182,212,0.05) 100%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(14, 165, 233, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                <Zap size={20} fill="currentColor" />
              </div>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Today's Briefing</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Smart Sync active</p>
              </div>
            </div>
            
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
              "Your AI has processed {stats?.total_analyzed || 0} emails and highlighted critical items requiring your immediate attention."
            </p>
            
            <button 
              className="btn-primary" 
              style={{ width: "100%", padding: "12px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
              onClick={() => window.location.href = '/dashboard/inbox'}
            >
              Go to Inbox
            </button>
          </div>

          <div style={{ marginTop: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>Today's Agenda</h2>
              <a href="/dashboard/calendar" style={{ textDecoration: "none", color: "var(--primary)", fontSize: "0.85rem" }}>View Full</a>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {meetings.length > 0 ? (
                meetings.slice(0, 3).map((meeting: any) => (
                  <div key={meeting.id} className="glass" style={{ padding: "16px", borderRadius: "12px" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div style={{ 
                        minWidth: "45px", 
                        height: "45px", 
                        borderRadius: "10px", 
                        background: "rgba(0, 212, 255, 0.1)", 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        justifyContent: "center",
                        color: "var(--accent)"
                      }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>
                          {meeting.start.dateTime ? new Date(meeting.start.dateTime).toLocaleTimeString([], { hour: 'numeric', hour12: false }) : "All"}
                        </span>
                        <span style={{ fontSize: "0.6rem", fontWeight: 600, opacity: 0.8 }}>
                          {meeting.start.dateTime ? new Date(meeting.start.dateTime).toLocaleTimeString([], { minute: '2-digit' }) : "Day"}
                        </span>
                      </div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
                          {meeting.summary}
                        </h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "4px" }}>
                          <MapPin size={10} />
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {meeting.location || "No location"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  <CalendarIcon size={24} style={{ marginBottom: "8px", opacity: 0.3 }} />
                  <p>No meetings today</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
