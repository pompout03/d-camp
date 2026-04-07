import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/features/landing/components/Footer";
import AnimatedHeading from "@/features/landing/components/AnimatedHeading";

export default function TermsOfService() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ minHeight: "70vh", paddingTop: 120, paddingBottom: 80 }}>
        <AnimatedHeading as="h1" style={{ fontSize: "3rem", fontWeight: 800, marginBottom: 24, letterSpacing: "-0.02em" }}>
          Terms of <span className="gradient-text">Service</span>
        </AnimatedHeading>
        <div className="glass" style={{ padding: 40, borderRadius: 20 }}>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 16 }}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: 32, marginBottom: 16, color: "var(--text-primary)" }}>1. Mission and Service</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 24 }}>
            Decamp is an AI Chief of Staff tool designed to help you prioritize your inbox. By using our service, you agree to these terms. This is a placeholder for our full Terms of Service.
          </p>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: 32, marginBottom: 16, color: "var(--text-primary)" }}>2. Account Responsibilities</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 24 }}>
            You are responsible for maintaining the security of your account. Decamp use secure OAuth tokens and does not store your passwords. You can revoke access at any time through your original account provider.
          </p>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: 32, marginBottom: 16, color: "var(--text-primary)" }}>3. Limitation of Liability</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 24 }}>
            Decamp is currently in beta. While we strive for absolute reliability, we are not responsible for any data loss, missed meetings, or mis-categorized emails. Users should always verify important information in their original email provider.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
