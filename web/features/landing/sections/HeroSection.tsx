"use client";

import {
  Play,
  Calendar,
  Bot,
  Sparkles,
  Shield,
  Clock,
} from "lucide-react";
import Link from "next/link";
import AnimatedHeading from "../components/AnimatedHeading";

const floatingEmails = [
  { label: "🔴 URGENT", text: "Q1 Board Presentation", from: "CEO", top: "15%", left: "4%", delay: 0 },
  { label: "🟡 REPLY", text: "Project Kickoff Details", from: "Team Lead", top: "58%", left: "2%", delay: 1.5 },
  { label: "🟢 LOW", text: "Weekly Newsletter", from: "Marketing", top: "82%", left: "6%", delay: 3 },
  { label: "📅 MEETING", text: "Design Review - 3 PM", from: "Sara", top: "12%", right: "4%", delay: 0.8 },
  { label: "🔴 URGENT", text: "Client Proposal Due Today", from: "Sales", top: "68%", right: "3%", delay: 2.2 },
];

function FloatingEmailCard({
  label,
  text,
  from,
  style,
  delay,
}: {
  label: string;
  text: string;
  from: string;
  style: React.CSSProperties;
  delay: number;
}) {
  return (
    <div
      className="glass float-anim"
      style={{
        position: "absolute",
        padding: "12px 16px",
        minWidth: 190,
        animationDelay: `${delay}s`,
        zIndex: 2,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          marginBottom: 4,
          color: "var(--accent)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "0.82rem",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 2,
        }}
      >
        {text}
      </div>
      <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
        from {from}
      </div>
    </div>
  );
}

export default function HeroSection() {

  return (
    <section
      className="mesh-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        paddingTop: 72,
      }}
    >
      {/* Grid overlay */}
      <div className="grid-overlay" />

      {/* Orbs */}
      <div
        className="orb"
        style={{
          width: 600,
          height: 600,
          background: "rgba(0, 150, 199, 0.12)",
          top: "-15%",
          left: "-10%",
        }}
      />
      <div
        className="orb"
        style={{
          width: 400,
          height: 400,
          background: "rgba(0, 212, 255, 0.08)",
          bottom: "-10%",
          right: "-5%",
        }}
      />


      {/* Main content */}
      <div
        className="container"
        style={{ position: "relative", zIndex: 5, textAlign: "center" }}
      >
        {/* Badge */}
        <div
          className="badge"
          style={{ margin: "0 auto 32px", display: "inline-flex" }}
        >
          <Sparkles size={12} />
          Smart Prioritization, Zero Effort
        </div>

        {/* Headline */}
        <AnimatedHeading
          as="h1"
          style={{
            fontSize: "clamp(2.6rem, 6vw, 5rem)",
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            marginBottom: 28,
            maxWidth: 860,
            margin: "0 auto 28px",
          }}
        >
          <span className="gradient-text-warm">Your AI Email</span>
          <br />
          <span className="gradient-text">Chief of Staff</span>
        </AnimatedHeading>

        {/* Subheadline */}
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "var(--text-secondary)",
            maxWidth: 620,
            margin: "0 auto 48px",
            lineHeight: 1.7,
            fontWeight: 400,
          }}
        >
          We are a team of students who got tired of drowning in emails. Decamp is
          our solution — an AI assistant that connects to your Email, sorts what
          matters, detects meetings, and tells you what needs your attention today.
          Currently in beta.
        </p>

        {/* Waitlist CTA re-added to lead to dedicated page */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 48, flexWrap: "wrap" }}>
          <Link
            href="/waitlist"
            className="btn-primary"
            style={{ fontSize: "1rem", padding: "14px 26px" }}
          >
            <Sparkles size={16} />
            Join the Waitlist
          </Link>
          <a
            href="#how-it-works"
            className="btn-secondary"
            style={{ fontSize: "1rem", padding: "14px 26px" }}
          >
            <Play size={16} />
            See How It Works
          </a>
        </div>

        {/* Trust line */}
        <div
          style={{
            display: "flex",
            gap: 32,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 80,
          }}
        >
          {[
            { icon: <Shield size={14} />, text: "Secure, read-only access" },
            { icon: <Clock size={14} />, text: "Fast inbox triage" },
            { icon: <Bot size={14} />, text: "No training on your data" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: "var(--text-muted)",
                fontSize: "0.83rem",
                fontWeight: 500,
              }}
            >
              <span style={{ color: "var(--sea-400)" }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>

        {/* Mock Dashboard Preview */}
        <div
          className="glass-bright"
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "4px",
            borderRadius: 20,
            boxShadow:
              "0 40px 120px rgba(0,0,0,0.6), 0 0 80px rgba(0,212,255,0.08)",
          }}
        >
          {/* Browser chrome */}
          <div
            style={{
              background: "rgba(5, 20, 40, 0.8)",
              borderRadius: "14px 14px 0 0",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              {["#ff5f57", "#ffbd2e", "#28ca41"].map((c, i) => (
                <div
                  key={i}
                  style={{ width: 8, height: 8, borderRadius: "50%", background: c }}
                />
              ))}
            </div>
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 6,
                padding: "3px 12px",
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                textAlign: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              app.decamp.ai/dashboard
            </div>
          </div>

          {/* Dashboard mockup */}
          <div
            className="grid-stack-mobile"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.5fr 1fr",
              minHeight: 340,
              borderRadius: "0 0 14px 14px",
              overflow: "hidden",
              background: "rgba(2, 10, 20, 0.7)",
            }}
          >
            {/* Left sidebar */}
            <div
              style={{
                borderRight: "1px solid var(--border)",
                padding: "20px 16px",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Inbox Tiers
              </div>
              {[
                { label: "🔴 Immediate", count: 4, active: false },
                { label: "🟡 Needs Response", count: 11, active: true },
                { label: "🟢 Can Wait", count: 19, active: false },
                { label: "📅 Meetings", count: 3, active: false },
              ].map((t, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    borderRadius: 8,
                    marginBottom: 2,
                    background: t.active ? "var(--accent-dim)" : "transparent",
                    border: t.active ? "1px solid rgba(0,212,255,0.2)" : "1px solid transparent",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", color: t.active ? "var(--accent)" : "var(--text-secondary)" }}>
                    {t.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 20,
                      background: t.active ? "var(--accent)" : "rgba(255,255,255,0.07)",
                      color: t.active ? "#000" : "var(--text-muted)",
                    }}
                  >
                    {t.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Email list */}
            <div style={{ padding: "16px", borderRight: "1px solid var(--border)" }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Needs Response · 11 emails
              </div>
              {[
                { from: "Prof. Mensah", subj: "Research Paper Deadline", badge: "Work", color: "var(--sea-400)" },
                { from: "Dr. Asante", subj: "Weekly Check-in Request", badge: "Meeting", color: "#1e90ff" },
                { from: "Finance Dept", subj: "Budget Approval Required", badge: "Finance", color: "var(--medium)" },
              ].map((email, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    marginBottom: 6,
                    background: i === 0 ? "rgba(0,148,195,0.12)" : "rgba(255,255,255,0.03)",
                    border: i === 0 ? "1px solid rgba(0,212,255,0.2)" : "1px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {email.from}
                    </span>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 20,
                        background: `${email.color}22`,
                        color: email.color,
                        border: `1px solid ${email.color}44`,
                      }}
                    >
                      {email.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{email.subj}</div>
                </div>
              ))}
            </div>

            {/* Right: Calendar */}
            <div style={{ padding: "16px" }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Today's Agenda
              </div>
              {[
                { time: "10:00", label: "Stand-up", color: "#1e90ff" },
                { time: "14:00", label: "Client Review", color: "var(--medium)" },
                { time: "16:30", label: "Design Sprint", color: "var(--teal)" },
              ].map((ev, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      height: 36,
                      borderRadius: 2,
                      background: ev.color,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{ev.time}</div>
                    <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-primary)" }}>{ev.label}</div>
                  </div>
                </div>
              ))}
              {/* AI chat preview */}
              <div
                style={{
                  marginTop: 16,
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "rgba(0,212,255,0.07)",
                  border: "1px solid rgba(0,212,255,0.15)",
                }}
              >
                <div style={{ fontSize: "0.65rem", color: "var(--accent)", fontWeight: 700, marginBottom: 3 }}>
                  ✦ AI Assistant
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                  You have 4 urgent emails & a meeting in 45 min.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "48px",
            marginTop: 56,
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "15+", label: "People Interviewed" },
            { value: "3", label: "User Groups" },
            { value: "Beta", label: "Currently in Beta" },
            { value: "Free", label: "To Join" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div className="stat-number">{s.value}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          .hero-floats { display: none; }
        }
        .hero-floats {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
      `}</style>
    </section>
  );
}
