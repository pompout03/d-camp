"use client";

import { Quote } from "lucide-react";
import AnimatedHeading from "../components/AnimatedHeading";

const testimonials = [
  {
    role: "Working Professional, Accra",
    text: "I have over 1,000 unread emails. I don't even know where to start when I open my inbox.",
  },
  {
    role: "Lecturer, University",
    text: "The worst part is missing meeting invitations. They get buried and I only find them after the meeting has passed.",
  },
  {
    role: "Student, Accra",
    text: "I spend too much time reading emails that don't need my attention, and then I miss the ones that do.",
  },
];



export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="section"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Orb */}
      <div
        className="orb"
        style={{
          width: 500,
          height: 500,
          background: "rgba(0, 100, 160, 0.10)",
          bottom: "0%",
          left: "-10%",
        }}
      />

      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div className="badge" style={{ margin: "0 auto 16px", display: "inline-flex" }}>
            What We Heard
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
            Real feedback from{" "}
            <span className="gradient-text">real conversations</span>
          </AnimatedHeading>
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--text-secondary)",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            During our customer discovery, we spoke with students, working
            professionals, and lecturers. Here is what they told us.
          </p>
        </div>

        {/* Masonry-style grid */}
        <div
          className="grid-stack-mobile"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="glass feature-card"
              style={{ position: "relative" }}
            >
              {/* Quote icon */}
              <Quote
                size={28}
                color="rgba(0,212,255,0.15)"
                style={{ marginBottom: 12 }}
              />

              {/* Text */}
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  marginBottom: 20,
                  fontStyle: "italic",
                }}
              >
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Attribution */}
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                — {t.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
