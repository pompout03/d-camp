"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/features/dashboard/components/Sidebar";
import Topbar from "@/features/dashboard/components/Topbar";
import MobileNav from "@/features/dashboard/components/MobileNav";
import ChatWidget from "@/features/dashboard/components/ChatWidget";
import { AccountProvider, Account } from "@/features/dashboard/context/AccountContext";
import { apiFetch } from "@/lib/api";

interface UserResponse {
  id: string;
  google_id: string;
  email: string;
  name: string;
  picture_url: string | null;
  created_at: string;
  last_login: string;
  accounts: Account[];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user profile on layout mount
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "url('/mesh-bg.svg') center/cover" }}>
        <p className="gradient-text" style={{ fontSize: "1.2rem", fontWeight: 700 }}>Preparing Workspace...</p>
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
    <AccountProvider initialAccounts={user.accounts || []} initialUser={user}>
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--navy-900)" }}>
        {/* Mesh Background for dashboard */}
        <div className="mesh-bg" />
        
        {/* Sidebar - Hidden on mobile */}
        <Sidebar user={user} onLogout={handleLogout} />

        {/* Main Content Wrapper - Margin adjusted for mobile */}
        <div 
          className="flex-1 flex flex-col pb-[70px] md:pb-0 w-full md:w-auto dashboard-content md:ml-64"
          style={{ 
            minWidth: 0,
            transition: "margin 0.3s ease",
            position: "relative",
            zIndex: 1
          }} 
        >
          {/* Topbar */}
          <Topbar user={user} />
          
          {/* Page Content */}
          <main style={{ flex: 1, padding: "clamp(16px, 4vw, 32px)", overflowY: "auto", position: "relative", zIndex: 10 }}>
            {children}
          </main>
          <ChatWidget />
        </div>

        {/* Bottom Nav - Visible on mobile */}
        <MobileNav />
      </div>
    </AccountProvider>
  );
}
