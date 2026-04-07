"use client";

import { Sparkles } from "lucide-react";
import AnimatedHeading from "../components/AnimatedHeading";

export default function CTABannerSection() {
  return (
    <section
      className="section"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Orbs */}
      <div
        className="orb"
        style={{
          width: 700,
          height: 400,
          background: "rgba(0, 150, 199, 0.16)",
          top: "-50%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div
          className="glass-bright mobile-p-4"
          style={{
            borderRadius: 28,
            padding: "72px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow:
              "0 40px 100px rgba(0,0,0,0.5), 0 0 80px rgba(0,212,255,0.08)",
          }}
        >
          {/* Inner grid */}
          <div className="grid-overlay" style={{ opacity: 0.5 }} />

          {/* Content */}
          <div
            className="badge"
            style={{ display: "inline-flex", marginBottom: 24 }}
          >
            <Sparkles size={12} />
            Start Reclaiming Your Time
          </div>

          <AnimatedHeading
            as="h2"
            delay={0.1}
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 20,
              position: "relative",
              zIndex: 1,
            }}
          >
            Your inbox shouldn't{" "}
            <span className="gradient-text">run your life.</span>
          </AnimatedHeading>

          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: 520,
              margin: "0 auto 40px",
              lineHeight: 1.7,
              position: "relative",
              zIndex: 1,
            }}
          >
            We are building Decamp for people who are tired of being controlled
            by their inbox. Join our early access list and help us shape the
            product. Free to join. No commitment.
          </p>

          {/* Waitlist CTA removed as per user request */}

          {/* Decorative email cards */}
          {[
            { label: "URGENT", sub: "Board meeting in 1hr", top: "15%", left: "-2%", rotate: "-4deg" },
            { label: "DONE", sub: "Invoice auto-filed", top: "60%", right: "-2%", rotate: "3deg" },
          ].map((card, i) => (
            <div
              key={i}
              className="glass hide-mobile"
              style={{
                position: "absolute",
                top: card.top,
                left: (card as any).left,
                right: (card as any).right,
                transform: `rotate(${card.rotate})`,
                padding: "10px 14px",
                fontSize: "0.75rem",
                minWidth: 160,
                opacity: 0.7,
              }}
            >
              <div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 2 }}>
                {card.label}
              </div>
              <div style={{ color: "var(--text-secondary)" }}>{card.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
