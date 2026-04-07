"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, Sparkles, Loader2, AlertCircle } from "lucide-react";
import AnimatedHeading from "@/features/landing/components/AnimatedHeading";

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");


    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://decamp-m.onrender.com";
      const response = await fetch(`${apiUrl}/api/waitlist/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, feedback }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data.status === "duplicate" ? "duplicate" : "success");
        setMessage(data.message || "You're on the list! We'll be in touch.");
        setEmail("");
        setFeedback("");
      } else {
        setStatus("error");
        setMessage(data.detail?.[0]?.msg || data.detail || data.message || "Something went wrong.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to connect to the server.");
    }
  };

  return (
    <section id="waitlist" className="py-32 relative overflow-hidden bg-[#00050a] isolation-isolate">
      {/* Background glow effects */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-8"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Join The Movement
              </motion.div>
              
              <AnimatedHeading
                as="h2"
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.1,
                  color: "#fff",
                  marginBottom: "24px"
                }}
              >
                Ready to take back <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  control of your inbox?
                </span>
              </AnimatedHeading>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed"
              >
                We're currently in invite-only beta. Secure your spot on the waitlist 
                today and help us shape the future of email.
              </motion.p>
              {/* 
                This section was added as a comment because the provided content
                is markdown and not valid JSX to be rendered directly within a <p> tag.
                If this content is meant to be displayed, it needs to be converted
                to appropriate JSX elements (e.<h3>, <ul>, <p> etc.).
              */}
              {/*
### 4. Live Verification (Succeeded)
- **Waitlist Form**: Tested and confirmed working on the live site.
- **Sign-In Redirect**: Verified that the redirect loop is resolved. After the latest backend deployment on Render completed, the "Sign In" button successfully redirects to `https://decamp-m.vercel.app/dashboard`.

> [!NOTE]
> If you still see the old domain, please **clear your browser cache** or open the site in an **Incognito window**, as your browser may have cached the previous redirect.
              */}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", damping: 25 }}
                className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-[2rem] blur-xl opacity-50" />
              
              <div className="relative bg-[#020a14]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

                <AnimatePresence mode="wait">
                  {status === "success" || status === "duplicate" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center py-10 text-center"
                    >
                      <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mb-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,212,255,0.2)]">
                        <CheckCircle2 className="w-10 h-10 text-cyan-400" />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-3">
                        {status === "duplicate" ? "You're already in!" : "You're on the list."}
                      </h3>
                      <p className="text-neutral-400 text-lg max-w-md mx-auto mb-8">
                        Thank you for your interest. We'll send you an invite as soon as your spot opens up.
                      </p>
                      <button 
                          onClick={() => setStatus('idle')}
                          className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest"
                      >
                          Submit another email
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onSubmit={handleSubmit}
                      className="max-w-xl mx-auto"
                    >
                      <div className="space-y-5">
                        <div className="group relative">
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your primary email address"
                            className="w-full px-6 py-4.5 bg-black/50 border border-white/10 rounded-2xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500/50 focus:bg-black/80 transition-all font-medium text-lg leading-none shadow-inner"
                            disabled={status === "loading"}
                          />
                        </div>
                        
                        <div className="group relative">
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="What's your biggest email challenge right now? (Optional)"
                            rows={3}
                            className="w-full px-6 py-4.5 bg-black/50 border border-white/10 rounded-2xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500/50 focus:bg-black/80 transition-all text-base resize-none shadow-inner"
                            disabled={status === "loading"}
                          />
                        </div>

                        {status === "error" && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="flex items-center gap-3 text-red-400 text-sm bg-red-500/10 py-3 px-5 rounded-xl border border-red-500/20"
                            >
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              {message}
                            </motion.div>
                        )}

                        <button
                          type="submit"
                          disabled={status === "loading" || !email}
                          className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-[#00d4ff] to-[#0088cc] text-white font-bold text-lg px-8 py-4.5 flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 mt-4 shadow-[0_0_30px_rgba(0,212,255,0.25)] hover:shadow-[0_0_40px_rgba(0,212,255,0.4)]"
                        >
                          {status === "loading" ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Reserve Early Access
                              <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                          )}
                        </button>
                        
                        <p className="text-xs text-center text-neutral-500 mt-6 font-medium tracking-wide">
                            NO SPAM, EVER. UNSUBSCRIBE ANYTIME.
                        </p>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
        </div>
      </div>
    </section>
  );
}
