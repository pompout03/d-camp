"use client";

export interface NavLink {
  label: string;
  href: string;
}

export default function NavbarDesktop({ navLinks }: { navLinks: NavLink[] }) {
  return (
    <nav
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
      className="hide-mobile"
    >
      {navLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          style={{
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: 500,
            padding: "8px 16px",
            borderRadius: 8,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLAnchorElement).style.color = "var(--accent)";
            (e.target as HTMLAnchorElement).style.background =
              "rgba(0,212,255,0.07)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLAnchorElement).style.color =
              "var(--text-secondary)";
            (e.target as HTMLAnchorElement).style.background =
              "transparent";
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
