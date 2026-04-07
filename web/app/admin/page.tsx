"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Activity, 
  Database, 
  Zap, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight,
  Monitor,
  Cloud,
  Cpu,
  Mail,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://decamp-m.onrender.com";

/* ─── Bento Card Component ─────────────────────────────────────────────── */
function BentoCard({ 
  children, 
  className = "", 
  title, 
  icon: Icon,
  delay = 0 
}: { 
  children: React.ReactNode, 
  className?: string, 
  title?: string, 
  icon?: any,
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`glass-card ${className}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "24px",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}
    >
      {title && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>
            {title}
          </h3>
          {Icon && <Icon size={16} color="var(--primary)" style={{ opacity: 0.5 }} />}
        </div>
      )}
      {children}
    </motion.div>
  );
}

/* ─── Main Admin Page ───────────────────────────────────────────────────── */
export default function AdminOverview() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/waitlist/")
      .then(res => res.json())
      .then(data => {
        setEntries(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = entries.length;
    const today = entries.filter(e => new Date(e.created_at).toDateString() === new Date().toDateString()).length;
    const withFeedback = entries.filter(e => e.feedback).length;
    
    return { total, today, withFeedback };
  }, [entries]);

  const chartData = useMemo(() => {
    if (entries.length === 0) return [];
    const counts: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    last7Days.forEach(day => counts[day] = 0);
    entries.forEach(e => {
      const day = e.created_at.split("T")[0];
      if (counts[day] !== undefined) counts[day]++;
    });

    return last7Days.map(day => ({
      name: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
      count: counts[day],
    }));
  }, [entries]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", animation: "fade-in 0.6s ease-out" }}>
      
      {/* ── Header Section ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 8px 0", color: "#fff" }}>
            Command <span style={{ color: "var(--primary)" }}>Center</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, margin: 0, fontSize: "1.1rem" }}>
            Decamp Operating System — <span style={{ color: "#10b981" }}>Cluster Alpha Stable</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div className="status-pill green">
            <span className="dot" />
            System Live
          </div>
          <div className="status-pill blue">
            <Activity size={14} />
            99.9% Uptime
          </div>
        </div>
      </div>

      {/* ── Main Bento Grid ── */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(4, 1fr)", 
        gridTemplateRows: "repeat(2, auto)",
        gap: "24px" 
      }}>
        
        {/* Total Signups (Large) */}
        <BentoCard title="Total Waitlist" icon={Users} className="col-span-2" delay={0.1}>
           <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
              <span style={{ fontSize: "4rem", fontWeight: 900, color: "#fff" }}>{stats.total}</span>
              <span style={{ color: "#10b981", fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center" }}>
                <TrendingUp size={16} style={{ marginRight: 4 }} /> +12%
              </span>
           </div>
           <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", margin: 0 }}>
             Unique early-access verified identities across all regions.
           </p>
        </BentoCard>

        {/* Growth Chart */}
        <BentoCard title="Velocity" icon={Activity} className="col-span-2" delay={0.2}>
          <div style={{ width: "100%", height: "120px", marginTop: "auto" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "10px" }}
                />
                <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorAdmin)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        {/* Today's Pulse */}
        <BentoCard title="Today's Pulse" icon={Clock} delay={0.3}>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>+{stats.today}</span>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", margin: 0 }}>
            New signups in the last 24 planetary hours.
          </p>
        </BentoCard>

        {/* System Health */}
        <BentoCard title="Node Health" icon={Cpu} delay={0.4}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>CPU Load</span>
              <span style={{ color: "var(--primary)" }}>14%</span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
              <div style={{ width: "14%", height: "100%", background: "var(--primary)", borderRadius: "2px" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginTop: 4 }}>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>Memory</span>
              <span style={{ color: "#8b5cf6" }}>2.4GB / 8GB</span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
              <div style={{ width: "30%", height: "100%", background: "#8b5cf6", borderRadius: "2px" }} />
            </div>
          </div>
        </BentoCard>

        {/* Feedback Density */}
        <BentoCard title="Pain Points" icon={Mail} delay={0.5}>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>{stats.withFeedback}</span>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", margin: 0 }}>
            Users provided context for their email frustrations.
          </p>
        </BentoCard>

        {/* Quick Actions */}
        <BentoCard title="Directives" icon={ShieldCheck} delay={0.6}>
           <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
             <button onClick={() => window.location.href='/admin/waitlist'} className="admin-btn secondary">
               Manage Waitlist <ArrowUpRight size={14} />
             </button>
             <button className="admin-btn ghost">
               System Logs <Monitor size={14} />
             </button>
           </div>
        </BentoCard>

      </div>

      {/* ── Recent Activity ── */}
      <BentoCard title="Recent Activity Feed" icon={Activity} delay={0.7}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {entries.slice(0, 5).map((e, i) => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(6,182,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                  <Users size={14} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>{e.email}</p>
                  <p style={{ margin: 0, fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>New signup detected</p>
                </div>
              </div>
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>
                {new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {entries.length === 0 && (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", padding: "20px 0" }}>No recent activity detected.</p>
          )}
        </div>
      </BentoCard>

      <style jsx>{`
        .status-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .status-pill.green {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .status-pill.blue {
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
          border: 1px solid rgba(6, 182, 212, 0.2);
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        }
        .admin-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .admin-btn.secondary {
          background: rgba(255,255,255,0.05);
          color: #fff;
          border-color: rgba(255,255,255,0.1);
        }
        .admin-btn.secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: var(--primary);
        }
        .admin-btn.ghost {
          background: transparent;
          color: rgba(255,255,255,0.4);
        }
        .admin-btn.ghost:hover {
          color: #fff;
          background: rgba(255,255,255,0.03);
        }
        .col-span-2 {
          grid-column: span 2;
        }
      `}</style>
    </div>
  );
}
