"use client";

import { LogIn, RefreshCcw, Layout, ArrowRight } from "lucide-react";
import AnimatedHeading from "../components/AnimatedHeading";

const steps = [
  {
    number: "01",
    icon: <LogIn size={28} color="#00d4ff" />,
    title: "Secure Connection",
    description:
      "Sign in with your preferred account. Decamp requests read-only access and calendar permissions via secure, encrypted handshakes — no passwords, no risk.",
    detail: "Takes under 30 seconds",
    color: "#00d4ff",
  },
  {
    number: "02",
    icon: <RefreshCcw size={28} color="#00e5c3" />,
    title: "AI Syncs & Analyzes",
    description:
      "Our advanced AI model reads your last 30 emails in parallel, scoring each one for priority, urgency, sentiment, meeting detection, and required actions.",
    detail: "~30 emails in ~2 minutes",
    color: "#00e5c3",
  },
  {
    number: "03",
    icon: <Layout size={28} color="#7b5ea7" />,
    title: "Command Your Inbox",
    description:
      "Your dashboard shows triaged emails, today's calendar, and an AI chatbot ready to answer questions, draft replies, or schedule meetings for you.",
    detail: "Fully interactive & real-time",
    color: "#7b5ea7",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="section"
      style={{
        position: "relative",
        background:
          "linear-gradient(180deg, transparent 0%, rgba(0, 60, 100, 0.15) 50%, transparent 100%)",
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div className="badge" style={{ margin: "0 auto 16px", display: "inline-flex" }}>
            How It Works
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
            From chaos to clarity in{" "}
            <span className="gradient-text">3 steps</span>
          </AnimatedHeading>
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--text-secondary)",
              maxWidth: 480,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            No complex setup. No manual configuration. Just sign in and let
            Decamp do the heavy lifting.
          </p>
        </div>

        {/* Steps */}
        <div
          className="grid-stack-mobile"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 32,
            position: "relative",
          }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              style={{ position: "relative", display: "flex", flexDirection: "column", gap: 0 }}
            >
              {/* Connector arrow between steps */}
              {i < steps.length - 1 && (
                <div
                  className="step-arrow"
                  style={{
                    position: "absolute",
                    right: "-16px",
                    top: "60px",
                    zIndex: 10,
                    color: "var(--text-muted)",
                  }}
                >
                  <ArrowRight size={20} color="var(--border-bright)" />
                </div>
              )}

              <div className="glass feature-card" style={{ flex: 1 }}>
                {/* Step number */}
                <div
                  style={{
                    fontSize: "3.5rem",
                    fontWeight: 900,
                    lineHeight: 1,
                    color: `${step.color}22`,
                    letterSpacing: "-0.05em",
                    marginBottom: 16,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: `${step.color}14`,
                    border: `1px solid ${step.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                    boxShadow: `0 0 20px ${step.color}20`,
                  }}
                >
                  {step.icon}
                </div>

                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    marginBottom: 12,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                    marginBottom: 20,
                  }}
                >
                  {step.description}
                </p>

                {/* Detail pill */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 12px",
                    borderRadius: 20,
                    background: `${step.color}0f`,
                    border: `1px solid ${step.color}28`,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: step.color,
                  }}
                >
                  ✓ {step.detail}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: 64 }}>
          <a href="#" className="btn-primary" style={{ fontSize: "1rem", padding: "15px 40px" }}>
            Start in 30 Seconds
            <ArrowRight size={16} />
          </a>
          <p
            style={{
              marginTop: 14,
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}
          >
            No credit card required · Account needed
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .step-arrow { display: none; }
        }
      `}</style>
    </section>
  );
}
