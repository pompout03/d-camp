"use client";

import {
  Zap,
  Twitter,
  Github,
  Linkedin,
  Mail,
  Shield,
  Lock,
} from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Product: [
    { name: "Features", href: "/#features" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Pricing", href: "/#pricing" },
    { name: "FAQ", href: "/#faq" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
  Support: [
    { name: "Contact", href: "/contact" },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        paddingTop: 64,
        paddingBottom: 40,
        position: "relative",
      }}
    >
      <div className="container">
        {/* Top row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: 64,
            marginBottom: 56,
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg, #0096c7 0%, #00d4ff 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 16px rgba(0,212,255,0.35)",
                }}
              >
                <Zap size={18} color="#fff" fill="#fff" />
              </div>
              <span
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  background:
                    "linear-gradient(135deg, #e8f8ff 0%, #00d4ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Decamp
              </span>
            </Link>
            <p
              style={{
                fontSize: "0.88rem",
                color: "var(--text-muted)",
                lineHeight: 1.7,
                marginBottom: 24,
                maxWidth: 240,
              }}
            >
              Your AI-powered email chief of staff. Driven by state-of-the-art
              intelligence.
            </p>

            {/* Trust badges */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: <Shield size={13} />, text: "Secure, read-only access" },
                { icon: <Lock size={13} />, text: "Encrypted connection" },
                { icon: <Mail size={13} />, text: "GDPR compliant" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <span style={{ color: "var(--sea-400)" }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              {[
                { icon: <Twitter size={16} />, label: "Twitter" },
                { icon: <Github size={16} />, label: "GitHub" },
                { icon: <Linkedin size={16} />, label: "LinkedIn" },
              ].map((soc, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={soc.label}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = "var(--accent-dim)";
                    el.style.borderColor = "var(--accent)";
                    el.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = "rgba(255,255,255,0.04)";
                    el.style.borderColor = "var(--border)";
                    el.style.color = "var(--text-muted)";
                  }}
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 32,
            }}
            className="footer-links"
          >
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-primary)",
                    marginBottom: 16,
                  }}
                >
                  {category}
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                          textDecoration: "none",
                          transition: "color 0.2s ease",
                        }}
                        onMouseEnter={(e) =>
                          ((e.target as HTMLAnchorElement).style.color =
                            "var(--sea-300)")
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLAnchorElement).style.color =
                            "var(--text-muted)")
                        }
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Decamp. All rights reserved. Built with ♥ for
            busy humans.
          </p>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--low)",
                boxShadow: "0 0 8px rgba(0,230,118,0.6)",
              }}
            />
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 768px) {
          .footer-links { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
