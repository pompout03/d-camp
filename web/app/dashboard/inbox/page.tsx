"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  RefreshCw,
  Search,
  AlertCircle,
  Clock,
  Zap,
  CheckCircle2,
  Calendar,
  FileText,
  Hourglass,
  Inbox,
  ChevronRight,
} from "lucide-react";
import { useAccount } from "@/features/dashboard/context/AccountContext";
import { apiFetch } from "@/lib/api";

interface ActionItem {
  text: string;
}

interface Email {
  id: string;
  gmail_id: string;
  subject: string;
  sender: string;
  sender_email: string;
  snippet: string;
  body: string | null;
  body_html: string;
  synced_at: string;
  // AI fields
  priority: "high" | "medium" | "low" | null;
  urgency_tier: "Immediate Attention" | "Needs Response" | "Can Wait" | null;
  needs_response: boolean | null;
  summary: string | null;
  action_items: string[];
  category: string | null;
  sentiment: string | null;
  deadline_detected: string | null;
  meeting_detected: boolean | null;
  meeting_title: string | null;
  meeting_date: string | null;
  meeting_time: string | null;
  form_detected: boolean | null;
  form_description: string | null;
  waiting_on: boolean | null;
}

type Tab = "all" | "immediate" | "meetings" | "forms" | "waiting" | "low";

const TABS: { id: Tab; label: string; icon: React.FC<any> }[] = [
  { id: "all", label: "All", icon: Inbox },
  { id: "immediate", label: "Immediate", icon: Zap },
  { id: "meetings", label: "Meetings", icon: Calendar },
  { id: "forms", label: "Forms", icon: FileText },
  { id: "waiting", label: "Waiting", icon: Hourglass },
  { id: "low", label: "Low Priority", icon: CheckCircle2 },
];

const PRIORITY_COLORS: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  high: {
    text: "#ff5765",
    bg: "rgba(255,87,101,0.12)",
    border: "rgba(255,87,101,0.3)",
    dot: "#ff5765",
  },
  medium: {
    text: "#ffb020",
    bg: "rgba(255,176,32,0.12)",
    border: "rgba(255,176,32,0.3)",
    dot: "#ffb020",
  },
  low: {
    text: "#00e676",
    bg: "rgba(0,230,118,0.12)",
    border: "rgba(0,230,118,0.3)",
    dot: "#00e676",
  },
};

const URGENCY_ICONS: Record<string, React.FC<any>> = {
  "Immediate Attention": Zap,
  "Needs Response": Clock,
  "Can Wait": CheckCircle2,
};

function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;
  const c = PRIORITY_COLORS[priority] || PRIORITY_COLORS.low;
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: "12px",
        fontSize: "0.7rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: c.text,
        background: c.bg,
        border: `1px solid ${c.border}`,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.dot,
          display: priority === "high" ? "inline-block" : "none",
        }}
        className={priority === "high" ? "pulse-ring" : ""}
      />
      {priority}
    </span>
  );
}

function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return null;
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: "12px",
        fontSize: "0.7rem",
        fontWeight: 500,
        color: "var(--text-secondary)",
        background: "rgba(0,180,216,0.08)",
        border: "1px solid rgba(0,180,216,0.2)",
      }}
    >
      {category}
    </span>
  );
}

function filterEmails(emails: Email[], tab: Tab): Email[] {
  switch (tab) {
    case "immediate":
      return emails.filter((e) => e.urgency_tier === "Immediate Attention");
    case "meetings":
      return emails.filter((e) => e.meeting_detected);
    case "forms":
      return emails.filter((e) => e.form_detected);
    case "waiting":
      return emails.filter((e) => e.waiting_on);
    case "low":
      return emails.filter(
        (e) => e.priority === "low" || e.urgency_tier === "Can Wait"
      );
    default:
      return emails;
  }
}

export default function InboxPage() {
  const { user, loading: contextLoading } = useAccount();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Email | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"summary" | "original">("summary");
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Reset viewMode to summary when selected email changes
  useEffect(() => {
    setViewMode("summary");
  }, [selected?.id]);

  const fetchEmailDetail = async (emailId: string) => {
    try {
      setLoadingDetail(true);
      const res = await apiFetch(`/api/inbox/${emailId}`);
      if (!res.ok) throw new Error("Failed to fetch email details");
      const fullEmail = await res.json();
      
      // Update the emails list with the full data so we don't fetch it again
      setEmails(prev => prev.map(e => e.id === emailId ? fullEmail : e));
      setSelected(fullEmail);
    } catch (err: any) {
      setError(err.message || "Failed to load original email content");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleView = (mode: "summary" | "original") => {
    if (mode === "original" && selected && !selected.body_html && !selected.body) {
      fetchEmailDetail(selected.id);
    }
    setViewMode(mode);
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiFetch("/api/inbox");
      if (!res.ok) throw new Error("Failed to fetch emails");
      const data = await res.json();
      setEmails(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching emails");
    } finally {
      setLoading(false);
    }
  };

  const syncEmails = async () => {
    try {
      setSyncing(true);
      setSyncStatus("");
      setError("");
      const res = await apiFetch("/api/inbox/sync", {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to sync emails");
      const data = await res.json();
      if (data.error) {
        setError(data.message || "Sync partially failed");
      } else {
        setSyncStatus(data.message || "Sync complete!");
      }
      await fetchEmails();
      
      // Clear status after 5 seconds
      setTimeout(() => setSyncStatus(""), 5000);
    } catch (err: any) {
      setError(err.message || "An error occurred while syncing");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!contextLoading && user) {
      fetchEmails();
    }
  }, [contextLoading, user]);

  // Auto-refresh if empty (to catch the background sync results)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!loading && emails.length === 0 && !syncing && !error) {
      interval = setInterval(() => {
        fetchEmails();
      }, 5000); // Check every 5 seconds
    }
    return () => { if (interval) clearInterval(interval); };
  }, [loading, emails.length, syncing, error]);

  const displayed = filterEmails(emails, tab).filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (e.subject || "").toLowerCase().includes(q) ||
      (e.sender || "").toLowerCase().includes(q) ||
      (e.snippet || "").toLowerCase().includes(q)
    );
  });

  const highCount = emails.filter((e) => e.priority === "high").length;

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        height: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        animation: "fade-in 0.5s ease-out",
        padding: "0 4px",
      }}
    >
      {/* Header - hide on mobile when email is selected to focus on content */}
      <div
        className={`${selected ? "hidden md:flex" : "flex"} justify-between items-center mb-5 shrink-0`}
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] mb-1">
            Inbox
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {emails.length} emails synced
            {highCount > 0 && (
              <span className="ml-3 px-2.5 py-0.5 rounded-xl text-xs font-semibold text-[#ff5765] bg-[rgba(255,87,101,0.12)] border border-[rgba(255,87,101,0.3)]">
                ⚡ {highCount} high priority
              </span>
            )}
          </p>
        </div>
        <button
          onClick={syncEmails}
          disabled={syncing}
          className="btn-primary py-2.5 px-4 flex items-center gap-2 text-sm"
        >
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          <span>{syncing ? "Syncing..." : "Sync & Analyze"}</span>
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-3 mb-4 shrink-0">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Sync Success banner */}
      {syncStatus && (
        <div className="p-3 md:p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 flex items-center gap-3 mb-4 shrink-0 animate-fade-in">
          <CheckCircle2 size={18} />
          {syncStatus}
        </div>
      )}

      {/* Category Tabs - hide on mobile when detail is open */}
      <div
        className={`${selected ? "hidden md:flex" : "flex"} gap-2 mb-4 shrink-0 overflow-x-auto pb-2 scrollbar-hide`}
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = tab === id;
          const count =
            id === "all"
              ? emails.length
              : id === "immediate"
              ? emails.filter((e) => e.urgency_tier === "Immediate Attention").length
              : id === "meetings"
              ? emails.filter((e) => e.meeting_detected).length
              : id === "forms"
              ? emails.filter((e) => e.form_detected).length
              : id === "waiting"
              ? emails.filter((e) => e.waiting_on).length
              : emails.filter((e) => e.priority === "low" || e.urgency_tier === "Can Wait").length;

          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs whitespace-nowrap transition-all duration-200 ${
                isActive 
                  ? "border-[var(--accent)] bg-[rgba(0,212,255,0.1)] text-[var(--accent)] font-semibold" 
                  : "border-[var(--border)] bg-[rgba(2,6,23,0.3)] text-[var(--text-secondary)] font-normal"
              }`}
            >
              <Icon size={14} />
              {label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold min-w-[18px] text-center ${
                  isActive ? "bg-[rgba(0,212,255,0.2)] text-[var(--accent)]" : "bg-white/10 text-[var(--text-muted)]"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main panels */}
      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        {/* Email list - toggle visibility on mobile */}
        <div
          className={`${selected ? "hidden md:flex" : "flex"} flex-col w-full md:w-[380px] shrink-0 glass rounded-2xl overflow-hidden`}
        >
          {/* Search */}
          <div
            style={{
              padding: "12px",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Search emails..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "rgba(2,6,23,0.5)",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "var(--text-muted)",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", opacity: 0.4 }} />
                <span style={{ fontSize: "0.9rem" }}>Loading...</span>
              </div>
            ) : displayed.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "var(--text-muted)",
                  gap: "12px",
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <Mail size={40} opacity={0.3} />
                <p style={{ fontSize: "0.9rem" }}>
                  {emails.length === 0
                    ? 'No emails synced yet.'
                    : "No emails here."}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {displayed.map((email) => {
                  const isSelected = selected?.id === email.id;
                  const hasHighPriority = email.priority === "high";

                  return (
                    <div
                      key={email.id}
                      onClick={() => setSelected(email)}
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background: isSelected
                          ? "rgba(0,212,255,0.08)"
                          : "transparent",
                        border: isSelected
                          ? "1px solid rgba(0,212,255,0.3)"
                          : hasHighPriority
                          ? "1px solid rgba(255,87,101,0.2)"
                          : "1px solid transparent",
                        borderLeft: hasHighPriority && !isSelected
                          ? "3px solid #ff5765"
                          : isSelected
                          ? "1px solid rgba(0,212,255,0.3)"
                          : "1px solid transparent",
                        transition: "all 0.18s ease",
                      }}
                    >
                      {/* Sender row */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "5px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            fontSize: "0.85rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "160px",
                          }}
                        >
                          {email.sender?.split("<")[0].trim() || email.sender_email}
                        </span>
                        <PriorityBadge priority={email.priority} />
                      </div>

                      {/* Subject */}
                      <div
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.82rem",
                          fontWeight: 500,
                          marginBottom: "4px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {email.subject}
                      </div>

                      {/* AI Summary or snippet */}
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.78rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: "6px",
                        }}
                      >
                        {email.summary || email.snippet}
                      </div>

                      {/* Tags row */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <CategoryBadge category={email.category} />
                        {email.meeting_detected && (
                          <span style={{ fontSize: "0.65rem", color: "#1e90ff", background: "rgba(30,144,255,0.1)", border: "1px solid rgba(30,144,255,0.2)", borderRadius: "8px", padding: "1px 6px" }}>📅 Meeting</span>
                        )}
                        {email.needs_response && (
                          <span style={{ fontSize: "0.65rem", color: "#ffb020", background: "rgba(255,176,32,0.1)", border: "1px solid rgba(255,176,32,0.2)", borderRadius: "8px", padding: "1px 6px" }}>↩ Reply</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Reading pane - toggle visibility on mobile */}
        <div
          className={`${!selected ? "hidden md:flex" : "flex"} flex-1 glass rounded-2xl flex-col overflow-hidden min-w-0`}
        >
          {selected ? (
            <div className="flex flex-col h-full">
              
              {/* Back button for mobile */}
              <div className="md:hidden p-3 border-b border-[var(--border)]">
                <button 
                  onClick={() => setSelected(null)}
                  className="bg-transparent border-none text-[var(--accent)] flex items-center gap-1.5 text-sm font-semibold p-0"
                >
                  <ChevronRight size={18} className="rotate-180" />
                  Back to List
                </button>
              </div>

              {/* Email header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border)",
                  flexShrink: 0,
                }}
              >
                <h2
                  style={{
                    fontSize: "clamp(1.1rem, 3vw, 1.3rem)",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: "12px",
                    lineHeight: 1.3,
                  }}
                >
                  {selected.subject}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--sea-700), var(--sea-500))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      color: "#fff",
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    {(selected.sender || "?").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {selected.sender?.split("<")[0].trim() || selected.sender}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {selected.sender_email}
                    </div>
                  </div>
                  <div className="hide-mobile" style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <PriorityBadge priority={selected.priority} />
                    <CategoryBadge category={selected.category} />
                  </div>
                </div>
              </div>

              {/* View Toggle */}
              <div style={{ padding: "8px 20px", background: "rgba(0,0,0,0.1)", borderBottom: "1px solid var(--border)", display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleToggleView("summary")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: viewMode === "summary" ? "var(--accent)" : "transparent",
                    color: viewMode === "summary" ? "#fff" : "var(--text-secondary)",
                    border: "none",
                    transition: "all 0.2s"
                  }}
                >
                  AI Summary
                </button>
                <button
                  onClick={() => handleToggleView("original")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: viewMode === "original" ? "rgba(255,255,255,0.1)" : "transparent",
                    color: viewMode === "original" ? "#fff" : "var(--text-secondary)",
                    border: "none",
                    transition: "all 0.2s"
                  }}
                >
                  Original
                </button>
              </div>

              {/* Content Area */}
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  overflow: "hidden",
                  minHeight: 0,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    background: viewMode === "original" ? "white" : "transparent",
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  {viewMode === "summary" ? (
                    <div style={{ padding: "24px 16px", maxWidth: "800px", margin: "0 auto", animation: "fade-in 0.4s ease-out" }}>
                      {/* Summary Section */}
                      {selected.summary ? (
                        <div style={{ marginBottom: "32px" }}>
                          <h3 style={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>AI Summary</h3>
                          <div className="glass mobile-p-4" style={{ padding: "24px", borderRadius: "16px", fontSize: "1rem", lineHeight: 1.6, color: "var(--text-primary)", border: "1px solid rgba(0,212,255,0.2)" }}>
                            {selected.summary}
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                          <Zap size={40} opacity={0.2} style={{ marginBottom: "16px" }} />
                          <p>AI analysis not available.</p>
                        </div>
                      )}

                      {/* Action Items */}
                      {selected.action_items && selected.action_items.length > 0 && (
                        <div style={{ marginBottom: "32px" }}>
                          <h3 style={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Action Items</h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {selected.action_items.map((item, idx) => (
                              <div key={idx} className="glass" style={{ padding: "14px 16px", borderRadius: "12px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
                                <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid var(--accent)", flexShrink: 0, marginTop: "2px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color: "var(--accent)" }}>{idx + 1}</div>
                                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                                  {typeof item === "string" ? item : typeof item === "object" && item !== null && "text" in item ? (item as any).text : JSON.stringify(item)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ height: "100%", background: "white", position: "relative" }}>
                      {loadingDetail ? (
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", background: "rgba(255,255,255,0.9)", zIndex: 10 }}>
                          <RefreshCw size={32} style={{ animation: "spin 1s linear infinite", color: "var(--sea-500)" }} />
                          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Loading original...</p>
                        </div>
                      ) : selected.body_html ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: selected.body_html }}
                          style={{ padding: "16px" }}
                        />
                      ) : (
                        <div
                          style={{
                            padding: "24px 16px",
                            color: "#333",
                            whiteSpace: "pre-wrap",
                            fontFamily: "inherit",
                            fontSize: "0.95rem",
                            lineHeight: 1.7,
                            maxWidth: "800px",
                            margin: "0 auto"
                          }}
                        >
                          {selected.body || selected.snippet}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                color: "var(--text-muted)",
                gap: "16px",
              }}
            >
              <Mail size={52} opacity={0.15} />
              <p style={{ fontSize: "0.95rem" }}>Select an email to read</p>
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
