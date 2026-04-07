"use client";

import { Menu, X } from "lucide-react";
import type { NavLink } from "./NavbarDesktop";

interface NavbarMobileProps {
  navLinks: NavLink[];
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export default function NavbarMobile({ navLinks, menuOpen, setMenuOpen }: NavbarMobileProps) {
  return (
    <>
      <button
        className="show-mobile"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-primary)",
          cursor: "pointer",
          padding: 4,
        }}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: 72,
            left: 0,
            right: 0,
            background: "rgba(2, 12, 30, 0.98)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid var(--border)",
            padding: "16px 24px 24px",
            zIndex: 99,
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: 500,
                padding: "12px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
