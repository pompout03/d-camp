"use client";

import { Bell, Search } from "lucide-react";

export default function Topbar({ user }: { user: any }) {
  return (
    <header
      className="glass px-4 md:px-8"
      style={{
        height: "72px",
        position: "sticky",
        top: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--glass-border)",
        background: "rgba(2, 6, 23, 0.5)",
        zIndex: 30,
        backdropFilter: "blur(12px)"
      }}
    >
      {/* Search Bar */}
      <div style={{ display: "flex", alignItems: "center", position: "relative", width: "300px" }}>
        <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: "12px" }} />
        <input 
          type="text" 
          placeholder="Search emails, commands..."
          style={{
            width: "100%",
            padding: "10px 10px 10px 40px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--glass-border)",
            borderRadius: "8px",
            color: "var(--text-primary)",
            fontSize: "0.9rem",
            outline: "none",
            transition: "border-color 0.2s ease"
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <button 
          style={{ 
            background: "transparent", 
            border: "none", 
            color: "var(--text-secondary)",
            cursor: "pointer",
            position: "relative"
          }}
        >
          <Bell size={20} />
          <span 
            style={{ 
              position: "absolute", 
              top: "-2px", 
              right: "-2px", 
              width: "8px", 
              height: "8px", 
              background: "var(--primary)",
              borderRadius: "50%"
            }}
          />
        </button>
        
        {user?.picture_url ? (
          <img 
            src={user.picture_url} 
            alt="Profile" 
            style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid var(--accent)" }} 
          />
        ) : (
          <div style={{ 
            width: "32px", 
            height: "32px", 
            borderRadius: "50%", 
            background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "var(--navy-900)"
          }}>
            {user?.name?.charAt(0) || "U"}
          </div>
        )}
      </div>
    </header>
  );
}
