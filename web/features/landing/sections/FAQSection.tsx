"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import AnimatedHeading from "../components/AnimatedHeading";

const faqs = [
  {
    q: "Is Decamp safe to use with my data?",
    a: "Yes. Decamp uses enterprise-grade security with read-only permissions. We never store your password, and your data is only read to generate AI summaries — it is not stored beyond what you sync, and never used to train AI models.",
  },
  {
    q: "Which messages does Decamp analyze?",
    a: "By default, Decamp fetches your latest 30 inbox messages per sync. You can trigger a sync any time. Only synced data is stored locally in your account's database — older unsynced items remain only in your original provider.",
  },
  {
    q: "How accurate is the AI prioritization?",
    a: "Decamp's AI-powered analysis automatically sorts your emails into priority tiers based on urgency and context. You can always override a priority label manually from the reading pane.",
  },
  {
    q: "Which accounts does Decamp support?",
    a: "Decamp supports primary consumer and professional accounts across major providers as long as the necessary access permissions are granted.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "You can delete your account at any time. All stored messages, chat history, and tokens are permanently deleted within 24 hours. You can also revoke Decamp's access from your account settings at any time.",
  },
  {
    q: "Can the AI assistant actually schedule meetings?",
    a: "Yes. The AI assistant can create calendar events directly in your account. It will check for conflicts first and ask for your confirmation before creating anything. You remain in full control.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="glass"
      style={{
        borderRadius: 14,
        overflow: "hidden",
        transition: "all 0.3s ease",
        border: open ? "1px solid var(--border-bright)" : "1px solid var(--border)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="mobile-p-4"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--text-primary)",
          textAlign: "left",
          gap: 16,
        }}
        aria-expanded={open}
      >
        <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>{q}</span>
        <ChevronDown
          size={18}
          color="var(--text-muted)"
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </button>

      {open && (
        <div
          className="mobile-p-4"
          style={{
            padding: "0 24px 20px",
            fontSize: "0.88rem",
            color: "var(--text-secondary)",
            lineHeight: 1.75,
            borderTop: "1px solid var(--border)",
            paddingTop: 16,
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQSection() {
  return (
    <section id="faq" className="section" style={{ position: "relative" }}>
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="badge" style={{ margin: "0 auto 16px", display: "inline-flex" }}>
            FAQ
          </div>
          <AnimatedHeading
            as="h2"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            Got questions?{" "}
            <span className="gradient-text">We've got answers.</span>
          </AnimatedHeading>
        </div>

        {/* FAQ items */}
        <div 
          className="mobile-gap-4" 
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {faqs.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
