"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Inbox, 
  Calendar, 
  Settings, 
  LogOut,
  Zap,
  BarChart3
} from "lucide-react";
import { useAccount } from "@/features/dashboard/context/AccountContext";
import { apiFetch, API_BASE_URL } from "@/lib/api";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Weekly Digest", href: "/dashboard/digest", icon: BarChart3 },
  { name: "Inbox", href: "/dashboard/inbox", icon: Inbox },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({ user, onLogout }: { user: any, onLogout: () => void }) {
  const pathname = usePathname();
  const { accounts, activeAccountId, setActiveAccountId } = useAccount();

  const activeAccount = accounts.find(a => a.id === activeAccountId);

  return (
    <aside 
      className="glass hidden md:!flex md:!flex-col md:!fixed md:top-0 md:left-0 md:w-64 h-screen"
      style={{
        width: "16rem",
        height: "100vh",
        top: 0,
        left: 0,
        flexDirection: "column",
        borderRight: "1px solid var(--glass-border)",
        zIndex: 40,
        background: "rgba(2, 6, 23, 0.7)"
      }}
    >
      {/* Brand */}
      <div style={{ padding: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: 32,
          height: 32,
          background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--navy-900)"
        }}>
          <Zap size={20} fill="currentColor" />
        </div>
        <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Decamp
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 16px",
                borderRadius: "8px",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: isActive ? "rgba(6, 182, 212, 0.1)" : "transparent",
                border: isActive ? "1px solid rgba(6, 182, 212, 0.2)" : "1px solid transparent",
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: 500,
                transition: "all 0.2s ease"
              }}
            >
              <Icon size={18} color={isActive ? "var(--primary)" : "currentColor"} />
              {item.name}
            </Link>
          );
        })}
      </nav>



      {/* User Profile & Logout */}
      <div style={{ padding: "20px 16px", borderTop: "1px solid var(--glass-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          {user?.picture_url ? (
            <img 
              src={user.picture_url} 
              alt={user.name} 
              style={{ width: "36px", height: "36px", borderRadius: "50%" }} 
            />
          ) : (
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--sea-800)" }} />
          )}
          <div style={{ overflow: "hidden" }}>
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name || "User"}
            </p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Pro Plan
            </p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "8px",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "8px",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
