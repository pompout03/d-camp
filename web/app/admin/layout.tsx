"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Zap, 
  Shield, 
  Activity, 
  Server,
  ChevronRight,
  Monitor,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

const ADMIN_NAV = [
  { name: "Command Center", href: "/admin", icon: LayoutDashboard },
  { name: "Waitlist Hub", href: "/admin/waitlist", icon: Users },
  { name: "System Health", href: "/admin/health", icon: Activity },
  { name: "API Config", href: "/admin/config", icon: Server },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

/* ─── Admin Sidebar Component ───────────────────────────────────────────── */
function AdminSidebar({ user, onLogout }: { user: any, onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <aside 
      className="glass-bright"
      style={{
        width: "260px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(6, 182, 212, 0.2)",
        zIndex: 50,
        background: "rgba(2, 6, 23, 0.9)",
        boxShadow: "10px 0 30px rgba(0,0,0,0.5)"
      }}
    >
      <div style={{ padding: "32px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: 36,
          height: 36,
          background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)"
        }}>
          <Shield size={22} fill="currentColor" fillOpacity={0.2} />
        </div>
        <div>
          <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", letterSpacing: "0.02em", display: "block", lineHeight: 1 }}>
            DECAMP
          </span>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4, display: "block" }}>
            Admin Core
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {ADMIN_NAV.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <motion.div
                whileHover={{ x: 4 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                  background: isActive ? "rgba(6, 182, 212, 0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(6, 182, 212, 0.25)" : "1px solid transparent",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 1 }}>
                  <Icon size={18} color={isActive ? "var(--primary)" : "currentColor"} />
                  {item.name}
                </div>
                {isActive && (
                  <motion.div layoutId="active-nav" style={{ width: "4px", height: "16px", background: "var(--primary)", borderRadius: "2px", boxShadow: "0 0 10px var(--primary)" }} />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "24px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
         <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", padding: "0 8px" }}>
           <div style={{ position: "relative" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>
                {user?.name?.charAt(0) || "A"}
              </div>
              <div style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, background: "#10b981", borderRadius: "50%", border: "2px solid rgba(2, 6, 23, 1)", boxShadow: "0 0 10px #10b981" }} />
           </div>
           <div style={{ overflow: "hidden" }}>
             <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
               {user?.name || "Admin"}
             </p>
             <p style={{ margin: 0, fontSize: "0.65rem", color: "var(--primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
               Root Authority
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
             padding: "10px",
             background: "rgba(239, 68, 68, 0.08)",
             color: "#ef4444",
             border: "1px solid rgba(239, 68, 68, 0.2)",
             borderRadius: "10px",
             fontSize: "0.8rem",
             fontWeight: 700,
             cursor: "pointer",
             transition: "all 0.2s ease"
           }}
         >
           <LogOut size={15} />
           Terminate Session
         </button>
      </div>
    </aside>
  );
}

/* ─── Admin Layout ──────────────────────────────────────────────────────── */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/auth/me")
      .then(async (res) => {
        if (!res.ok) {
          router.push("/");
          return;
        }
        const data = await res.json();
        setUser(data);
      })
      .catch(() => {
        router.push("/");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#020617" }}>
         <div style={{ textAlign: "center" }}>
            <Loader2 className="spin" size={40} color="var(--primary)" />
            <p style={{ marginTop: 20, color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.1em" }}>INITIALIZING COMMAND CORE...</p>
         </div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST"
      });
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#020617", color: "#fff", overflowX: "hidden" }}>
      {/* Background Decor */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", left: "20%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)", filter: "blur(100px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "30vw", height: "30vw", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>
      
      {/* Sidebar */}
      <AdminSidebar user={user} onLogout={handleLogout} />

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: "260px", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
        <main style={{ flex: 1, padding: "40px", position: "relative" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
      
      <style jsx global>{`
        .glass-bright {
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
        }
        .spin {
          animation: spin 1.5s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Loader2({ className, size, color }: { className?: string, size?: number, color?: string }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
