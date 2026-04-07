"use client";

import { useAccount } from "@/features/dashboard/context/AccountContext";
import { 
  User, 
  Mail, 
  Bell, 
  ShieldCheck, 
  ChevronRight, 
  Trash2, 
  Plus, 
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function SettingsPage() {
  const { user } = useAccount();
  const [gmailConnected, setGmailConnected] = useState(true);
  
  // Settings state
  const [urgentAlerts, setUrgentAlerts] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [prioritySenders, setPrioritySenders] = useState("");
  const [priorityKeywords, setPriorityKeywords] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiFetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setUrgentAlerts(data.high_priority_alerts);
          setDailySummary(data.daily_summary_email);
          setPrioritySenders(data.trusted_senders.join(", "));
          setPriorityKeywords(data.key_phrases.join(", "));
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggleGmail = async () => {
    const nextState = !gmailConnected;
    try {
      const res = await apiFetch(`/api/inbox/accounts/toggle?active=${nextState}`, {
        method: "PUT"
      });
      if (res.ok) {
        setGmailConnected(nextState);
        setStatus({ type: 'success', msg: `Gmail ${nextState ? 'connected' : 'disconnected'}` });
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (err) {
      setStatus({ type: 'error', msg: "Failed to toggle Gmail" });
    }
  };

  const saveSettings = async (updates: any) => {
    setSaving(true);
    setStatus(null);
    try {
      // Process list fields if they are present in updates
      const body = { ...updates };
      if (updates.trusted_senders !== undefined) {
        body.trusted_senders = updates.trusted_senders.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      if (updates.key_phrases !== undefined) {
        body.key_phrases = updates.key_phrases.split(",").map((s: string) => s.trim()).filter(Boolean);
      }

      const res = await apiFetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        setStatus({ type: 'success', msg: 'Settings updated successfully' });
        setTimeout(() => setStatus(null), 3000);
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUrgent = (val: boolean) => {
    setUrgentAlerts(val);
    saveSettings({ high_priority_alerts: val });
  };

  const handleToggleDaily = (val: boolean) => {
    setDailySummary(val);
    saveSettings({ daily_summary_email: val });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-[var(--text-secondary)]">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fade-in px-4 md:px-0">
      
      {/* Page Title */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 gradient-text">Settings</h1>
          <p className="text-[var(--text-secondary)] text-base md:text-lg">Configure your personal profile, connected accounts, and AI preference rules.</p>
        </div>
        {status && (
          <div className={`px-4 py-2 rounded-xl text-sm font-semibold border animate-fade-in ${
            status.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-500 border-red-500/20'
          }`}>
            {status.msg}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Section 1: Profile */}
        <section className="glass p-6 md:p-8 rounded-[24px]">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-[var(--accent)]">
              <User size={24} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] m-0">Profile</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative shrink-0">
              {user?.picture_url ? (
                <img 
                  src={user.picture_url} 
                  alt={user.name} 
                  className="w-20 h-20 rounded-full border-2 border-[var(--accent)] object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[var(--sea-800)] flex items-center justify-center text-3xl font-extrabold text-[var(--text-primary)]">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-[var(--teal)] rounded-full border-2 border-[var(--bg-deep)] flex items-center justify-center">
                <CheckCircle2 size={14} color="#000" />
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left overflow-hidden w-full">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)] m-0 truncate max-w-full">{user?.name || "User Name"}</h3>
                <span className="badge px-2.5 py-1 text-[10px] leading-none m-0">Pro Plan</span>
              </div>
              <p className="text-[var(--text-secondary)] text-sm m-0 truncate max-w-full">{user?.email || "user@example.com"}</p>
            </div>
            
            <button className="btn-secondary w-full sm:w-auto py-2.5 px-5 text-sm">Edit Profile</button>
          </div>
        </section>

        {/* Section 2: Connected Accounts */}
        <section className="glass p-6 md:p-8 rounded-[24px]">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-[var(--accent)]">
              <Mail size={24} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] m-0">Connected Accounts</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-white/5 rounded-2xl border border-[var(--border)] gap-6">
            <div className="flex items-center gap-4 w-full">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <p className="m-0 text-base font-semibold text-[var(--text-primary)]">Gmail Integration</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${gmailConnected ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                  <p className="m-0 text-sm text-[var(--text-secondary)]">{gmailConnected ? "Connected and Syncing" : "Disconnected"}</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleToggleGmail}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 border ${
                gmailConnected 
                  ? "bg-red-500/10 text-red-500 border-red-500/20" 
                  : "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
              }`}
            >
              {gmailConnected ? "Disconnect" : "Re-connect Account"}
            </button>
          </div>
        </section>

        {/* Section 3: Notification Preferences */}
        <section className="glass p-6 md:p-8 rounded-[24px]">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-[var(--accent)]">
              <Bell size={24} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] m-0">Notification Preferences</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="pr-4">
                <p className="m-0 font-semibold text-[var(--text-primary)]">Urgent Email Alerts</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Get notified immediately when high-priority items are detected.</p>
              </div>
              <Toggle checked={urgentAlerts} onChange={() => handleToggleUrgent(!urgentAlerts)} />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="pr-4">
                <p className="m-0 font-semibold text-[var(--text-primary)]">Daily Summary Email</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Receive a briefing of your handled items every morning at 8:00 AM.</p>
              </div>
              <Toggle checked={dailySummary} onChange={() => handleToggleDaily(!dailySummary)} />
            </div>
          </div>
        </section>

        {/* Section 4: Priority Rules */}
        <section className="glass p-6 md:p-8 rounded-[24px]">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-[var(--accent)]">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] m-0">Priority Rules</h2>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="w-full">
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">Trusted Senders (High Priority)</label>
              <textarea 
                value={prioritySenders}
                onChange={(e) => setPrioritySenders(e.target.value)}
                autoComplete="off"
                placeholder="Ex: important@client.com, legal@dept.org"
                className="w-full min-h-[100px] bg-white/5 border border-[var(--border)] rounded-xl p-4 text-white text-base focus:border-[var(--accent)] outline-none transition-all resize-none"
              />
              <p className="mt-2 text-xs text-[var(--text-muted)]">Separate multiple emails with commas.</p>
            </div>
            
            <div className="w-full">
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">Key Phrases (Search Keywords)</label>
              <textarea 
                value={priorityKeywords}
                onChange={(e) => setPriorityKeywords(e.target.value)}
                autoComplete="off"
                placeholder="Ex: payroll, signature needed, immediate action"
                className="w-full min-h-[100px] bg-white/5 border border-[var(--border)] rounded-xl p-4 text-white text-base focus:border-[var(--accent)] outline-none transition-all resize-none"
              />
              <p className="mt-2 text-xs text-[var(--text-muted)]">Mention words that should flag an email as urgent.</p>
            </div>
            
            <button 
              className="btn-primary w-full sm:w-auto mt-2 px-6 py-3" 
              disabled={saving}
              onClick={() => saveSettings({ trusted_senders: prioritySenders, key_phrases: priorityKeywords })}
            >
              {saving ? "Updating..." : "Update AI Priority Logic"}
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

// Simple internal Toggle component for settings
function Toggle({ checked, onChange }: { checked: boolean, onChange: () => void }) {
  return (
    <button 
      onClick={onChange}
      className={`relative w-12 h-6.5 rounded-full transition-colors duration-300 border-none cursor-pointer p-0 shrink-0 ${
        checked ? "bg-[var(--accent)]" : "bg-white/10"
      }`}
    >
      <div className={`absolute top-0.5 w-5.5 h-5.5 rounded-full bg-white shadow-md transition-all duration-300 ${
        checked ? "left-6" : "left-0.5"
      }`} />
    </button>
  );
}
