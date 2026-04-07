"use client";

import { Check, Zap, ArrowRight } from "lucide-react";
import AnimatedHeading from "../components/AnimatedHeading";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for individuals who want to tame their inbox.",
    color: "var(--sea-400)",
    features: [
      "30 emails analyzed per sync",
      "3-tier AI prioritization",
      "Meeting detection & calendar add",
      "Today's agenda view",
      "Basic AI chatbot (10 queries/day)",
      "Calendar integration",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "For power users who need unlimited AI analysis.",
    color: "#00d4ff",
    features: [
      "Unlimited emails per sync",
      "Advanced AI prioritization",
      "Thread summarization",
      "Unlimited AI chatbot queries",
      "Draft reply generation",
      "Browser push notifications",
      "Conversation history (90 days)",
      "Priority support",
    ],
    cta: "Coming Soon",
    popular: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "per month",
    description: "Shared inbox intelligence for small teams.",
    color: "#00e5c3",
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "Shared AI chatbot context",
      "Team activity dashboard",
      "Custom categories & labels",
      "API access",
      "Dedicated onboarding",
      "SLA support",
    ],
    cta: "Coming Soon",
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="section"
      style={{
        position: "relative",
        background:
          "linear-gradient(180deg, transparent 0%, rgba(0, 40, 80, 0.12) 50%, transparent 100%)",
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div className="badge" style={{ margin: "0 auto 16px", display: "inline-flex" }}>
            Pricing
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
            Simple pricing,{" "}
            <span className="gradient-text">powerful results</span>
          </AnimatedHeading>
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--text-secondary)",
              maxWidth: 440,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Start free. Upgrade when you need more. No hidden fees, no confusing tiers.
          </p>
        </div>

        {/* Plans */}
        <div
          className="grid-stack-mobile"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          {plans.map((plan, i) => (
            <div
              key={i}
              className={plan.popular ? "glass-bright plan-popular" : "glass"}
              style={{
                padding: "36px 32px",
                borderRadius: 20,
                position: "relative",
                transition: "transform 0.3s ease",
              }}
            >
              <style>{`
                @media (min-width: 769px) {
                  .plan-popular { transform: scale(1.03); }
                }
              `}</style>
              {plan.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background:
                      "linear-gradient(135deg, var(--sea-500), var(--accent))",
                    color: "#fff",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "5px 18px",
                    borderRadius: 20,
                    whiteSpace: "nowrap",
                    boxShadow: "0 0 20px rgba(0,212,255,0.4)",
                  }}
                >
                  ✦ Most Popular
                </div>
              )}

              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: plan.color,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {plan.name}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: "3rem",
                    fontWeight: 900,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {plan.price}
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  /{plan.period}
                </span>
              </div>

              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  marginBottom: 28,
                  lineHeight: 1.6,
                }}
              >
                {plan.description}
              </p>

              <a
                href="#"
                className={plan.popular ? "btn-primary" : "btn-secondary"}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 28,
                  fontSize: "0.9rem",
                }}
              >
                {plan.popular && <Zap size={15} />}
                {plan.cta}
                <ArrowRight size={14} />
              </a>

              <div
                style={{
                  height: 1,
                  background: "var(--border)",
                  marginBottom: 24,
                }}
              />

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {plan.features.map((feat, j) => (
                  <li key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Check
                      size={15}
                      color={plan.color}
                      style={{ marginTop: 2, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 36,
            fontSize: "0.83rem",
            color: "var(--text-muted)",
          }}
        >
          All plans include enterprise-grade security · Cancel anytime · No contracts
        </p>
        <p
          style={{
            textAlign: "center",
            marginTop: 12,
            fontSize: "0.83rem",
            color: "var(--text-muted)",
          }}
        >
          Paid plans launch after beta. Early waitlist members get 2 months free on Pro.
        </p>
      </div>
    </section>
  );
}
