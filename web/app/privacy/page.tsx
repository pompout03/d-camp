import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/features/landing/components/Footer";
import AnimatedHeading from "@/features/landing/components/AnimatedHeading";

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ minHeight: "70vh", paddingTop: 120, paddingBottom: 80 }}>
        <AnimatedHeading as="h1" style={{ fontSize: "3rem", fontWeight: 800, marginBottom: 24, letterSpacing: "-0.02em" }}>
          Privacy <span className="gradient-text">Policy</span>
        </AnimatedHeading>
        <div className="glass" style={{ padding: 40, borderRadius: 20 }}>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 16 }}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: 32, marginBottom: 16, color: "var(--text-primary)" }}>Our Commitment</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 24 }}>
            At Decamp, we take your privacy seriously. This is a placeholder for our full Privacy Policy. We do not sell your data, and we use read-only permissions for your connected accounts solely to provide AI summarization and prioritization features. Your data is not used to train global AI models.
          </p>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: 32, marginBottom: 16, color: "var(--text-primary)" }}>Data Collection and Usage</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 24 }}>
            - We only sync the most recent subset of emails for active analysis.<br/>
            - You can permanently delete your data and revoke access at any time.<br/>
            - Connected accounts rely on zero-trust, secure OAuth tokens without storing your passwords.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
