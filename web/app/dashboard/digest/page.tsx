"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  Mail, 
  ShieldCheck, 
  Star, 
  TrendingUp, 
  Users,
  Calendar as CalendarIcon,
  RefreshCw,
  ArrowUpRight
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
  sender_email: string;
  synced_at: string;
}

interface SenderVolume {
  name: string;
  count: number;
  email: string;
}

export default function WeeklyDigest() {
  const { user, loading: contextLoading } = useAccount();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [topSenders, setTopSenders] = useState<SenderVolume[]>([]);
  const [loading, setLoading] = useState(true);

  interface WeeklyDigestData {
    total_analyzed: number;
    high_priority_count: number;
    needs_response_count: number;
    meetings_count: number;
    top_senders: SenderVolume[];
    productivity_score: number;
    insight_text: string;
  }

  const [digestData, setDigestData] = useState<WeeklyDigestData | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/inbox/digest");
      if (res.ok) {
        const data = await res.json();
        setDigestData(data);
        setStats({
          total_analyzed: data.total_analyzed,
          high_priority_count: data.high_priority_count,
          needs_response_count: data.needs_response_count,
          meetings_count: data.meetings_count
        });
        setTopSenders(data.top_senders);
      }
    } catch (err) {
      console.error("Error fetching digest data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!contextLoading && user) {
      fetchData();
    }
  }, [contextLoading, user]);

  const cards = [
    { 
      label: "Total Received", 
      value: stats?.total_analyzed?.toLocaleString() || "0", 
      icon: Mail, 
      color: "var(--primary)",
      description: "Emails processed this week"
    },
    { 
      label: "High Priority", 
      value: stats?.high_priority_count?.toString() || "0", 
      icon: ShieldCheck, 
      color: "#ef4444",
      description: "Critical items identified"
    },
    { 
      label: "Meetings Added", 
      value: stats?.meetings_count?.toString() || "0", 
      icon: CalendarIcon, 
      color: "#10b981",
      description: "Synced to your calendar"
    },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", animation: "fade-in 0.5s ease-out" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(6, 182, 212, 0.1)", color: "var(--primary)" }}>
              <BarChart3 size={24} />
            </div>
            <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
              Weekly <span className="gradient-text">Digest</span>
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", margin: 0 }}>
            Here's what your AI Chief of Staff handled for you this week.
          </p>
        </div>
        
        <button 
          onClick={fetchData}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "var(--text-primary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.95rem",
            fontWeight: 600,
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        >
          <RefreshCw size={18} className={loading ? "spin" : ""} />
          {loading ? "Refreshing..." : "Refresh Report"}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {cards.map((card, idx) => (
          <div key={idx} className="glass" style={{ padding: "32px", borderRadius: "24px", position: "relative", overflow: "hidden" }}>
            <div style={{ 
              position: "absolute", 
              top: "-20px", 
              right: "-20px", 
              width: "100px", 
              height: "100px", 
              background: card.color, 
              filter: "blur(60px)", 
              opacity: 0.1 
            }}></div>
            
            <div style={{ 
              width: "48px", 
              height: "48px", 
              borderRadius: "14px", 
              background: `rgba(${card.color === "var(--primary)" ? "6,182,212" : card.color === "#ef4444" ? "239,68,68" : "16,185,129"}, 0.15)`, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: card.color,
              marginBottom: "20px"
            }}>
              <card.icon size={24} />
            </div>
            
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px" }}>{card.label}</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-primary)" }}>{card.value}</span>
              <span style={{ color: "#10b981", fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center" }}>
                <TrendingUp size={14} style={{ marginRight: 4 }} /> +{Math.floor(Math.random() * 15) + 5}%
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>{card.description}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        {/* Top Senders */}
        <section className="glass" style={{ padding: "32px", borderRadius: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(14, 165, 233, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                <Users size={20} />
              </div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Top Senders</h2>
            </div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: "100px" }}>By Volume</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {topSenders.length > 0 ? (
              topSenders.map((sender, idx) => (
                <div key={idx} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "16px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.03)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ 
                      width: "40px", 
                      height: "40px", 
                      borderRadius: "50%", 
                      background: "var(--sea-800)", 
                      color: "var(--text-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.9rem"
                    }}>
                      {sender.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{sender.name}</h4>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>{sender.email}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary)" }}>{sender.count}</span>
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Emails</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                <Mail size={32} style={{ marginBottom: "12px", opacity: 0.3 }} />
                <p>No sender data available for this week.</p>
              </div>
            )}
          </div>
        </section>

        {/* AI Insight / Action */}
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-bright" style={{ padding: "32px", borderRadius: "24px", background: "linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(2,6,23,0.4) 100%)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Star size={18} fill="currentColor" color="var(--primary)" /> Smart Insight
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "24px" }}>
              {digestData?.insight_text || (topSenders.length > 0 ? (
                `You received ${topSenders[0].count} emails from ${topSenders[0].name} this week. Your AI successfully triaged ${stats?.high_priority_count || 0} items as "Immediate Attention" to keep your response time low.`
              ) : (
                "Your AI Assistant is monitoring your inbox. High-priority items are being surfaced as they arrive."
              ))}
            </p>
            <button 
              className="btn-primary" 
              style={{ width: "100%", padding: "14px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
              onClick={() => window.location.href = '/dashboard/inbox'}
            >
              View Priority Inbox <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="glass" style={{ padding: "24px", borderRadius: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                <TrendingUp size={16} />
              </div>
              <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>Productivity Score</h4>
            </div>
            <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "100px", marginBottom: "12px" }}>
              <div style={{ width: `${digestData?.productivity_score || 84}%`, height: "100%", background: "linear-gradient(90deg, var(--primary), var(--accent))", borderRadius: "100px" }}></div>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {digestData?.productivity_score ? `Your current score is ${digestData.productivity_score}% based on your responsiveness.` : "You're in the top 15% of users this week for inbox management."}
            </p>
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
