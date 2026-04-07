"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCheck,
  AlertCircle,
  TrendingUp,
  Clock,
  Trash2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

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
  const header = ["id", "email", "user_type", "emails_per_day", "notify", "feedback", "created_at"];
  const rows = data.map((e) => [
    e.id,
    e.email,
    e.user_type ?? "",
    e.emails_per_day ?? "",
    String(e.notify),
    (e.feedback ?? "").replace(/"/g, '""'),
    e.created_at,
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `waitlist_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  colour,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  colour: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 flex items-start gap-4"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${colour}22`, color: colour }}
      >
        <Icon size={22} />
      </div>
      <div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{label}</p>
        <p
          style={{ fontSize: "1.7rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}
        >
          {value}
        </p>
        {sub && (
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{sub}</p>
        )}
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function WaitlistAdminPage() {
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
    if (!confirm("Are you sure you want to remove this entry?")) return;
    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/waitlist/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete");
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert("Error deleting entry");
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
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, notify: updated.notify } : e)));
    } catch (err) {
      alert("Error updating notification status");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── derived stats ── */
  const totalCount = entries.length;
  const notifyCount = entries.filter((e) => e.notify).length;
  const withFeedback = entries.filter((e) => e.feedback && e.feedback.trim().length > 0).length;
  const todayCount = entries.filter(
    (e) => new Date(e.created_at).toDateString() === new Date().toDateString()
  ).length;
  const roles = [...new Set(entries.map((e) => e.user_type).filter(Boolean))] as string[];

  /* ── filter + sort ── */
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

  /* ── column header ── */
  function ColHeader({ label, sortable, id }: { label: string; sortable?: boolean; id?: SortKey }) {
    const active = id && sortKey === id;
    return (
      <th
        onClick={sortable && id ? () => toggleSort(id) : undefined}
        style={{
          padding: "10px 14px",
          textAlign: "left",
          fontSize: "0.7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: active ? "var(--primary)" : "var(--text-muted)",
          cursor: sortable ? "pointer" : "default",
          userSelect: "none",
          whiteSpace: "nowrap",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {label}
          {sortable && id && (
            <span style={{ opacity: active ? 1 : 0.3 }}>
              {active && sortDir === "asc" ? (
                <ChevronUp size={12} />
              ) : (
                <ChevronDown size={12} />
              )}
            </span>
          )}
        </span>
      </th>
    );
  }

  /* ── render ── */
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", animation: "fade-in 0.4s ease-out" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            Waitlist Management
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Real-time user management
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={fetchEntries}
            disabled={loading}
            className="glass"
            style={{
              padding: "9px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.875rem",
              background: "transparent",
            }}
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => exportCSV(filtered)}
            disabled={filtered.length === 0}
            style={{
              padding: "9px 18px",
              borderRadius: 12,
              background: "var(--primary)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.875rem",
              fontWeight: 600,
              opacity: filtered.length === 0 ? 0.5 : 1,
            }}
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18, marginBottom: 28 }}>
        <StatCard icon={Users} label="Total Signups" value={totalCount} colour="var(--primary)" />
        <StatCard icon={Bell} label="Wants Notifications" value={notifyCount} sub={`${Math.round((notifyCount / totalCount || 0) * 100)}% opt-in rate`} colour="#10b981" />
        <StatCard icon={Calendar} label="Signed Up Today" value={todayCount} colour="#f59e0b" />
        <StatCard icon={TrendingUp} label="With Feedback" value={withFeedback} sub="user pain points" colour="#8b5cf6" />
      </div>



      {/* ── Filters ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass"
        style={{ borderRadius: 16, padding: "14px 18px", marginBottom: 18, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emails or feedback…"
            style={{
              width: "100%",
              paddingLeft: 34,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
        </div>

        {/* Role filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Filter size={13} style={{ color: "var(--text-muted)" }} />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: "7px 30px 7px 10px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--text-primary)",
              fontSize: "0.8rem",
              cursor: "pointer",
              appearance: "none",
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
            }}
          >
            <option value="all">All Roles</option>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Notify filter */}
        <select
          value={filterNotify}
          onChange={(e) => setFilterNotify(e.target.value)}
          style={{
            padding: "7px 30px 7px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--text-primary)",
            fontSize: "0.8rem",
            cursor: "pointer",
            appearance: "none",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 8px center",
          }}
        >
          <option value="all">All Notifications</option>
          <option value="yes">Notify: On</option>
          <option value="no">Notify: Off</option>
        </select>

        <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {filtered.length} / {totalCount} entries
        </span>
      </motion.div>

      {/* ── Error State ── */}
      {error && (
        <div className="glass" style={{ borderRadius: 14, padding: "16px 20px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)" }}>
          <AlertCircle size={18} color="#ef4444" />
          <div>
            <p style={{ color: "#ef4444", fontWeight: 600, fontSize: "0.9rem" }}>Failed to load waitlist</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{error}</p>
          </div>
          <button onClick={fetchEntries} style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.4)", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: "0.8rem" }}>
            Retry
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass"
        style={{ borderRadius: 18, overflow: "hidden" }}
      >
        {loading ? (
          <div style={{ padding: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading waitlist…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <Users size={36} style={{ margin: "0 auto 12px", opacity: 0.25, color: "var(--text-primary)" }} />
            <p style={{ color: "var(--text-muted)" }}>No entries match your filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "rgba(255,255,255,0.03)" }}>
                <tr>
                  <ColHeader label="Email" sortable id="email" />
                  <ColHeader label="Role" sortable id="user_type" />
                  <ColHeader label="Volume" />
                  <ColHeader label="Notify" />
                  <ColHeader label="Feedback" />
                  <ColHeader label="Joined" sortable id="created_at" />
                  <ColHeader label="" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((entry, idx) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                      transition={{ delay: Math.min(idx * 0.03, 0.25) }}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Email */}
                      <td style={{ padding: "14px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(6,182,212,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Mail size={14} style={{ color: "var(--primary)" }} />
                          </div>
                          <div>
                            <p style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: "0.875rem" }}>
                              {entry.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: "14px 14px" }}>
                        {entry.user_type ? (
                          <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(6,182,212,0.12)", color: "var(--primary)", fontSize: "0.75rem", fontWeight: 600 }}>
                            {entry.user_type}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>
                        )}
                      </td>

                      {/* Volume */}
                      <td style={{ padding: "14px 14px" }}>
                        {entry.emails_per_day ? (
                          <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                            {entry.emails_per_day} / day
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>
                        )}
                      </td>

                      {/* Notify */}
                      <td style={{ padding: "14px 14px" }}>
                        <button
                          onClick={() => toggleNotify(entry.id, entry.notify)}
                          disabled={updatingId === entry.id}
                          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: 0 }}
                        >
                          {updatingId === entry.id ? (
                             <Loader2 size={13} className="spin" color="var(--primary)" />
                          ) : entry.notify ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#10b981", fontSize: "0.8rem" }}>
                              <Bell size={13} />
                              On
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)", fontSize: "0.8rem" }}>
                              <BellOff size={13} />
                              Off
                            </div>
                          )}
                        </button>
                      </td>

                      {/* Feedback */}
                      <td style={{ padding: "14px 14px", maxWidth: 220 }}>
                        {entry.feedback ? (
                          <button
                            onClick={() => setShowFeedback(showFeedback === entry.id ? null : entry.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
                          >
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.4, whiteSpace: showFeedback === entry.id ? "normal" : "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>
                              {entry.feedback}
                            </p>
                          </button>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>
                        )}
                      </td>

                      {/* Joined */}
                      <td style={{ padding: "14px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Clock size={12} style={{ color: "var(--text-muted)" }} />
                          <div>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{timeAgo(entry.created_at)}</p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{formatDate(entry.created_at)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button
                            onClick={() => copyEmail(entry.email)}
                            title="Copy email"
                            style={{ background: "none", border: "none", cursor: "pointer", color: copiedId === entry.email ? "#10b981" : "var(--text-muted)", padding: "4px 6px", borderRadius: 6, transition: "all 0.2s" }}
                          >
                            {copiedId === entry.email ? <CheckCheck size={14} /> : <Copy size={14} />}
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            disabled={deletingId === entry.id}
                            title="Delete entry"
                            style={{ background: "none", border: "none", cursor: "pointer", color: deletingId === entry.id ? "var(--text-muted)" : "rgba(239, 68, 68, 0.5)", padding: "4px 6px", borderRadius: 6, transition: "all 0.2s" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(239, 68, 68, 0.5)"}
                          >
                            {deletingId === entry.id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
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
      </motion.div>

      {/* ── Bottom Summary ── */}
      {!loading && filtered.length > 0 && (
        <p style={{ textAlign: "center", marginTop: 16, color: "var(--text-muted)", fontSize: "0.8rem" }}>
          Showing {filtered.length} of {totalCount} total signups
          {search && ` · filtered by "${search}"`}
        </p>
      )}
    </div>
  );
}
