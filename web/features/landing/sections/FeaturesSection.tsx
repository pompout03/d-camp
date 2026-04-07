"use client";

import {
  Mail,
  Brain,
  Calendar,
  MessageSquare,
  Bell,
  Search,
  ArrowUpRight,
} from "lucide-react";
import AnimatedHeading from "../components/AnimatedHeading";

const features = [
  {
    icon: <Mail size={24} color="#00d4ff" />,
    title: "Advanced Email Sync",
    description:
      "Connect your primary inbox with one click. Decamp fetches your latest messages securely using read-only authentication — no passwords stored, ever.",
    tags: ["Secure API", "Private Login", "Auto-refresh"],
  },
  {
    icon: <Brain size={24} color="#00e5c3" />,
    title: "AI Prioritization",
    description:
      "Every email is analyzed by state-of-the-art AI and sorted into Immediate, Needs Response, and Can Wait tiers automatically.",
    tags: ["Advanced AI", "3-Tier System", "Instant"],
  },
  {
    icon: <Calendar size={24} color="#1e90ff" />,
    title: "Calendar Intelligence",
    description:
      "Meeting invites detected in messages are auto-added to your calendar with conflict checking. Never miss a meeting again.",
    tags: ["Conflict Check", "1-Click Add", "Reminders"],
  },
  {
    icon: <MessageSquare size={24} color="#7b5ea7" />,
    title: "AI Chatbot Agent",
    description:
      "Ask anything about your inbox. \"What needs my attention today?\" or \"Draft a reply to John\" — streamed in real-time via SSE.",
    tags: ["Real-time SSE", "Context-aware", "Draft replies"],
  },
  {
    icon: <Bell size={24} color="#ffb020" />,
    title: "Meeting Reminders",
    description:
      "A smart banner appears when a meeting is under 60 minutes away. Browser notifications ping you 5 minutes before it starts.",
    tags: ["Push Notifications", "60-min window", "Always-on"],
  },
  {
    icon: <Search size={24} color="#ff5765" />,
    title: "Smart Categorization",
    description:
      "Emails are automatically tagged: Work, Finance, Personal, Forms, Newsletters, and more. Filter by any category instantly.",
    tags: ["7 Categories", "Full-text Search", "Filters"],
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="section" style={{ position: "relative" }}>
      {/* Background orbs */}
      <div
        className="orb"
        style={{
          width: 500,
          height: 500,
          background: "rgba(0, 96, 160, 0.10)",
          top: "10%",
          right: "-15%",
        }}
      />

      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div className="badge" style={{ margin: "0 auto 16px", display: "inline-flex" }}>
            Features
          </div>
          <AnimatedHeading
            as="h2"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Everything your inbox{" "}
            <span className="gradient-text">should have been</span>
          </AnimatedHeading>
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--text-secondary)",
              maxWidth: 540,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Six powerful features working together to transform how you deal with email — no workflow changes required.
          </p>
        </div>

        {/* Feature grid */}
        <div
          className="grid-stack-mobile"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass feature-card"
              style={{ cursor: "default" }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "rgba(0, 212, 255, 0.07)",
                  border: "1px solid rgba(0, 212, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <h3
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {feature.title}
                </h3>
                <ArrowUpRight
                  size={16}
                  color="var(--text-muted)"
                  style={{ flexShrink: 0 }}
                />
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.65,
                  marginBottom: 20,
                }}
              >
                {feature.description}
              </p>

              {/* Tags */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {feature.tags.map((tag, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 20,
                      background: "rgba(0, 180, 216, 0.08)",
                      border: "1px solid rgba(0, 180, 216, 0.18)",
                      color: "var(--sea-300)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
