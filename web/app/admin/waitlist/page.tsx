"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Download,
  RefreshCw,
  Search,
  Mail,
  Bell,
  BellOff,
  Calendar,
  ChevronUp,
  ChevronDown,
  Filter,
  Loader2,
  Copy,
  AlertCircle,
  TrendingUp,
  Clock,
  Trash2,
  PieChart as PieChartIcon,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Shield,
  FileText
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://decamp-m.onrender.com";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface WaitlistEntry {
  id: string;
  email: string;
  feedback: string | null;
  emails_per_day: string | null;
  user_type: string | null;
  notify: boolean;
  created_at: string;
}

type SortKey = "created_at" | "email" | "user_type";
type SortDir = "asc" | "desc";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function exportCSV(data: WaitlistEntry[]) {
  const header = ["id", "email", "role", "volume", "notify", "feedback", "created_at"];
  const rows = data.map((e) => [
    e.id,
    e.email,
    e.user_type ?? "Other",
    e.emails_per_day ?? "Not Specified",
    String(e.notify),
    (e.feedback ?? "").replace(/"/g, '""'),
    e.created_at,
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `decamp_waitlist_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ════════════════════════════════════════════════════════════════════════════
   ADMIN WAITLIST PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function AdminWaitlistHub() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterNotify, setFilterNotify] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /* ── fetch ── */
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/waitlist/");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: WaitlistEntry[] = await res.json();
      setEntries(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load waitlist data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  /* ── mutations ── */
  const deleteEntry = async (id: string) => {
    if (!confirm("Confirm Deletion: This operation is permanent.")) return;
    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/waitlist/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Deletion failed");
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert("System Error: Could not remove identity.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleNotify = async (id: string, current: boolean) => {
    setUpdatingId(id);
    try {
      const res = await apiFetch(`/api/waitlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notify: !current })
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, notify: updated.notify } : e)));
    } catch (err) {
      alert("System Error: Could not update notification parity.");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── derived ── */
  const filtered = entries
    .filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q || e.email.toLowerCase().includes(q) || (e.feedback ?? "").toLowerCase().includes(q);
      const matchRole = filterRole === "all" || (e.user_type ?? "unknown") === filterRole;
      const matchNotify =
        filterNotify === "all" ||
        (filterNotify === "yes" && e.notify) ||
        (filterNotify === "no" && !e.notify);
      return matchSearch && matchRole && matchNotify;
    })
    .sort((a, b) => {
      const va = a[sortKey] ?? "";
      const vb = b[sortKey] ?? "";
      return sortDir === "asc" ? (va > vb ? 1 : -1) : va < vb ? 1 : -1;
    });

  const roles = [...new Set(entries.map((e) => e.user_type).filter(Boolean))] as string[];

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function copyEmail(email: string) {
    navigator.clipboard.writeText(email);
    setCopiedId(email);
    setTimeout(() => setCopiedId(null), 1800);
  }

  /* ── render ── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", animation: "fade-in 0.6s ease-out" }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
            <Link href="/admin" style={{ color: "inherit", textDecoration: "none" }}>Admin</Link>
            <ChevronRight size={14} />
            <span style={{ color: "var(--primary)" }}>Waitlist Hub</span>
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.04em", margin: 0, color: "#fff" }}>
            Identity <span style={{ color: "var(--primary)" }}>Vault</span>
          </h1>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={fetchEntries} className="admin-action-btn">
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            Resync
          </button>
          <button onClick={() => exportCSV(filtered)} className="admin-action-btn primary">
            <Download size={16} />
            Export Protocol
          </button>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="glass-panel" style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "300px" }}>
          <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search verified identities or feedback..."
            className="admin-input"
          />
        </div>
        
        <div style={{ display: "flex", gap: "12px" }}>
          <div className="select-wrapper">
            <Filter size={14} className="icon" />
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="admin-select">
              <option value="all">All Roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div className="select-wrapper">
             <Bell size={14} className="icon" />
             <select value={filterNotify} onChange={e => setFilterNotify(e.target.value)} className="admin-select">
                <option value="all">All Opt-ins</option>
                <option value="yes">Notify: On</option>
                <option value="no">Notify: Off</option>
             </select>
          </div>
        </div>

        <div style={{ marginLeft: "auto", fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>
          {filtered.length} / {entries.length} MATCHES
        </div>
      </div>

      {/* ── Main Table ── */}
      <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "100px", textAlign: "center" }}>
            <Loader2 size={40} className="spin" color="var(--primary)" />
            <p style={{ marginTop: 20, color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.2em" }}>FETCHING SECURE DATA...</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort("email")} className={sortKey === "email" ? "active" : ""}>
                    Identity {sortKey === "email" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => toggleSort("user_type")} className={sortKey === "user_type" ? "active" : ""}>
                     Role {sortKey === "user_type" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Status</th>
                  <th>Engagement</th>
                  <th style={{ width: "250px" }}>Feedback Capsule</th>
                  <th onClick={() => toggleSort("created_at")} className={sortKey === "created_at" ? "active" : ""}>
                    Timestamp {sortKey === "created_at" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th style={{ width: "100px" }}></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((e, idx) => (
                    <motion.tr
                      key={e.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.02 }}
                    >
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                           <div className="avatar-mini">
                             {e.email.charAt(0).toUpperCase()}
                           </div>
                           <span className="email-link" onClick={() => copyEmail(e.email)}>{e.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`tag ${e.user_type ? "active" : "muted"}`}>
                          {e.user_type || "N/A"}
                        </span>
                      </td>
                      <td>
                         <button 
                           onClick={() => toggleNotify(e.id, e.notify)}
                           disabled={updatingId === e.id}
                           className={`notify-toggle ${e.notify ? "on" : "off"}`}
                         >
                           {updatingId === e.id ? <Loader2 size={12} className="spin" /> : (e.notify ? <Bell size={12} /> : <BellOff size={12} />)}
                           {e.notify ? "Notified" : "Muted"}
                         </button>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                          {e.emails_per_day ? `${e.emails_per_day}/day` : "—"}
                        </span>
                      </td>
                      <td>
                        {e.feedback ? (
                          <div 
                            className={`feedback-box ${showFeedback === e.id ? "expanded" : ""}`}
                            onClick={() => setShowFeedback(showFeedback === e.id ? null : e.id)}
                          >
                            <FileText size={12} />
                            <span>{e.feedback}</span>
                          </div>
                        ) : <span style={{ color: "rgba(255,255,255,0.15)" }}>Empty Capsule</span>}
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ color: "#fff", fontSize: "0.8rem", fontWeight: 600 }}>{timeAgo(e.created_at)}</span>
                          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem" }}>{formatDate(e.created_at)}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => copyEmail(e.email)} className="icon-btn" title="Copy ID">
                              {copiedId === e.email ? <CheckCheck size={14} color="#10b981" /> : <Copy size={14} />}
                            </button>
                            <button onClick={() => deleteEntry(e.id)} className="icon-btn delete" title="Terminate Identity">
                              <Trash2 size={14} />
                            </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx global>{`
        .glass-panel {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 24px;
        }
        .admin-action-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: #fff;
        }
        .admin-action-btn:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.2);
        }
        .admin-action-btn.primary {
          background: var(--primary);
          color: #020617;
          border: none;
        }
        .admin-action-btn.primary:hover {
          background: #22d3ee;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(6,182,212,0.3);
        }
        .admin-input {
          width: 100%;
          background: rgba(2, 6, 23, 0.4);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 10px 16px 10px 44px;
          color: #fff;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .admin-input:focus {
          border-color: var(--primary);
        }
        .select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .select-wrapper .icon {
          position: absolute;
          left: 14px;
          color: rgba(255,255,255,0.3);
          pointer-events: none;
        }
        .admin-select {
          background: rgba(2, 6, 23, 0.4);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 10px 32px 10px 38px;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          appearance: none;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }
        .admin-table th {
          text-align: left;
          padding: 20px 24px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.4);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          white-space: nowrap;
        }
        .admin-table th.active {
          color: var(--primary);
        }
        .admin-table td {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          vertical-align: middle;
        }
        .avatar-mini {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(6,182,212,0.1), rgba(139,92,246,0.1));
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--primary);
        }
        .email-link {
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
        }
        .email-link:hover {
          color: var(--primary);
          text-decoration: underline;
        }
        .tag {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .tag.active {
          background: rgba(6,182,212,0.1);
          color: var(--primary);
        }
        .tag.muted {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.2);
        }
        .notify-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .notify-toggle.on {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        .notify-toggle.off {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.3);
        }
        .feedback-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 8px;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          max-width: 200px;
          transition: all 0.2s;
        }
        .feedback-box span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feedback-box.expanded {
          max-width: 400px;
          background: rgba(255,255,255,0.05);
          color: #fff;
        }
        .feedback-box.expanded span {
          white-space: normal;
        }
        .icon-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: transparent;
          border: 1px solid transparent;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          transition: all 0.2s;
        }
        .icon-btn:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
          border-color: rgba(255,255,255,0.1);
        }
        .icon-btn.delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </div>
  );
}

function CheckCheck({ size, color }: { size: number, color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-7.5 7.5L13 16" />
    </svg>
  );
}
