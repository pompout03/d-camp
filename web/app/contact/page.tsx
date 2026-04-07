import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/features/landing/components/Footer";
import AnimatedHeading from "@/features/landing/components/AnimatedHeading";
import { Mail, MessageSquare, Twitter } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ minHeight: "70vh", paddingTop: 120, paddingBottom: 80 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <AnimatedHeading as="h1" style={{ fontSize: "3.5rem", fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Get in <span className="gradient-text">Touch</span>
          </AnimatedHeading>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>
            Have questions about Decamp? We're here to help. Reach out to us through any of these channels.
          </p>
        </div>

        <div className="grid-stack-mobile" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
          <div className="glass" style={{ padding: 32, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(0, 212, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Mail size={24} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 12 }}>Email Us</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 20 }}>
              For support, feedback, or general inquiries.
            </p>
            <a href="mailto:support@decamp.ai" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>support@decamp.ai</a>
          </div>

          <div className="glass" style={{ padding: 32, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(0, 229, 195, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Twitter size={24} color="var(--teal)" />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 12 }}>Twitter / X</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 20 }}>
              Follow us for updates and quick questions.
            </p>
            <a href="https://twitter.com/decampai" target="_blank" rel="noopener noreferrer" style={{ color: "var(--teal)", fontWeight: 600, textDecoration: "none" }}>@decampai</a>
          </div>

          <div className="glass" style={{ padding: 32, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(123, 94, 167, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <MessageSquare size={24} color="var(--purple)" />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 12 }}>Community</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 20 }}>
              Join our beta users community for direct feedback.
            </p>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Coming Soon</span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
