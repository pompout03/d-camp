"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Inbox, 
  Calendar, 
  Settings, 
  BarChart3
} from "lucide-react";

const MOBILE_NAV_ITEMS = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Digest", href: "/dashboard/digest", icon: BarChart3 },
  { name: "Inbox", href: "/dashboard/inbox", icon: Inbox },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 flex z-[100] glass-bright md:!hidden"
      style={{
        height: "64px",
        background: "rgba(2, 6, 23, 0.85)",
        backdropFilter: "blur(16px) saturate(180%)",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 12px",
      }}
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              color: isActive ? "var(--primary)" : "var(--text-muted)",
              transition: "all 0.2s ease",
              width: "20%",
              textDecoration: "none",
            }}
          >
            <div style={{
              padding: "4px 16px",
              borderRadius: "16px",
              background: isActive ? "rgba(6, 182, 212, 0.15)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease"
            }}>
              <Icon size={20} color={isActive ? "var(--primary)" : "currentColor"} />
            </div>
            <span style={{ 
              fontSize: "0.65rem", 
              fontWeight: isActive ? 600 : 400, 
              color: isActive ? "white" : "inherit" 
            }}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
