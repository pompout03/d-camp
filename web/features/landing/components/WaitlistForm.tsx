"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://decamp-m.onrender.com";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

/* ─── deterministic particle data (avoids hydration mismatch) ─────────────── */
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: ((i * 67 + 13) % 100) - 50,   // –50 → 50 range
  y: 200 + ((i * 41) % 220),        // distance upward
  dur: 2.2 + ((i * 23) % 18) / 10, // 2.2 – 4.0s
  delay: ((i * 37) % 25) / 10,     // 0 – 2.5s
  size: 4 + ((i * 11) % 5),        // 4 – 8px
  colour: i % 3 === 0 ? "rgb(34,211,238)" : i % 3 === 1 ? "rgb(96,165,250)" : "rgb(167,139,250)",
}));

/* ─── Pill perks ──────────────────────────────────────────────────────────── */
const PERKS = [
  { icon: <Lock className="h-3 w-3" />, label: "Priority access" },
  { icon: <Zap className="h-3 w-3" />, label: "Founding-member price" },
  { icon: <Check className="h-3 w-3" />, label: "Zero spam" },
];

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════════*/
export default function WaitlistForm({
  variant = "hero",
  onClose,
}: {
  variant?: "hero" | "banner";
  onClose?: () => void;
}) {
  /* — form state — */
  const [email, setEmail] = useState("");
  const [emailsPerDay, setEmailsPerDay] = useState("");
  const [userType, setUserType] = useState("");
  const [feedback, setFeedback] = useState("");
  const [notify, setNotify] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [signupCount, setSignupCount] = useState<number | null>(null);

  // Fetch real waitlist count from the backend
  useEffect(() => {
    fetch(`${API_BASE}/api/waitlist/`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: unknown[]) => setSignupCount(Array.isArray(data) ? data.length : null))
      .catch(() => {}); // silently fail — count is non-critical
  }, []);

  const isCompact = variant === "banner";

  /* — card tilt — */
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const rotateX = useSpring(useTransform(cardY, [-300, 300], [4, -4]), {
    stiffness: 140,
    damping: 28,
  });
  const rotateY = useSpring(useTransform(cardX, [-300, 300], [-4, 4]), {
    stiffness: 140,
    damping: 28,
  });

  /* — magnetic CTA — */
  const btnRef = useRef<HTMLButtonElement>(null);
  const bx = useMotionValue(0);
  const by = useMotionValue(0);
  const bs = useMotionValue(1);
  const sbx = useSpring(bx, { stiffness: 180, damping: 18 });
  const sby = useSpring(by, { stiffness: 180, damping: 18 });
  const sbs = useSpring(bs, { stiffness: 220, damping: 20 });

  /* — mouse backlight — */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const backlight = useMotionTemplate`radial-gradient(640px circle at ${mx}px ${my}px, rgba(34,211,238,0.11), transparent 70%)`;

  function onCardMove(e: ReactMouseEvent<HTMLDivElement>) {
    if (isCompact) return;
    const r = e.currentTarget.getBoundingClientRect();
    cardX.set(e.clientX - r.left - r.width / 2);
    cardY.set(e.clientY - r.top - r.height / 2);
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }

  function onBtnMove(e: ReactMouseEvent) {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    bx.set((e.clientX - r.left - r.width / 2) * 0.28);
    by.set((e.clientY - r.top - r.height / 2) * 0.28);
    bs.set(1.035);
  }

  function onInputMove(e: ReactMouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  /* — submit — */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/waitlist/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          feedback: feedback.trim() || undefined,
          emails_per_day: emailsPerDay || undefined,
          user_type: userType || undefined,
          notify,
        }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      setTimeout(() => {
        if (res.ok) {
          setStatus(data.status === "duplicate" ? "duplicate" : "success");
          setMessage(data.message || "You're on the list! We'll be in touch.");
          setEmail(""); setFeedback(""); setEmailsPerDay(""); setUserType("");
        } else {
          setStatus("error");
          setMessage(
            data.detail?.[0]?.msg || data.detail || data.message || "Something went wrong."
          );
        }
      }, 1000);
    } catch {
      setTimeout(() => {
        setStatus("error");
        setMessage("Connection failed. Please try again.");
      }, 900);
    }
  };

  /* ── shared class strings ── */
  const inputBase =
    "w-full rounded-2xl border bg-white/[0.055] text-[0.925rem] " +
    "text-white placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] " +
    "transition-all duration-300 " +
    "focus:outline-none focus:bg-white/[0.09] " +
    "focus:shadow-[0_0_0_2px_rgba(34,211,238,0.4),0_0_32px_rgba(34,211,238,0.15)] " +
    "hover:border-white/20 hover:bg-white/[0.075] " +
    "disabled:opacity-40 disabled:cursor-not-allowed " +
    "border-white/[0.11]";

  const labelBase =
    "block text-[10px] font-bold uppercase tracking-[0.22em] text-white/50 mb-2.5";

  /* ═══════════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════════════*/
  return (
    <div className={`relative mx-auto w-full ${isCompact ? "max-w-4xl" : "max-w-[510px]"}`}>

      {/* ── Loading overlay ── */}
      <AnimatePresence>
        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-[2.25rem] overflow-hidden"
            style={{ backdropFilter: "blur(14px)", background: "rgba(4,10,22,0.75)" }}
          >
            {/* Sweep shimmer */}
            <motion.div
              className="absolute pointer-events-none w-1/3 h-full skew-x-[-18deg]"
              style={{ background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.07), transparent)" }}
              animate={{ x: ["-180%", "280%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 rounded-full"
                style={{ border: "2px solid rgba(34,211,238,0.15)", borderTopColor: "rgba(34,211,238,0.9)" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </motion.div>
              </div>
            </div>
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400"
            >
              Securing your spot
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main AnimatePresence: form ↔ success ── */}
      <AnimatePresence mode="wait">

        {/* ════════════ SUCCESS ════════════ */}
        {status === "success" || status === "duplicate" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95, y: 16, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
            transition={{ type: "spring", damping: 24, stiffness: 140 }}
          >
            <div
              className="relative overflow-hidden rounded-[2.25rem] p-10 text-center"
              style={{
                background: "linear-gradient(160deg, rgba(10,20,40,0.88) 0%, rgba(4,10,22,0.95) 100%)",
                border: "1px solid rgba(34,211,238,0.22)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 0 70px rgba(34,211,238,0.16), 0 35px 80px rgba(1,6,18,0.8)",
                backdropFilter: "blur(22px)",
              }}
            >
              {/* Top shimmer line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.55), transparent)" }} />
              {/* Corner aura */}
              <div className="absolute -right-10 -top-16 w-44 h-44 rounded-full pointer-events-none"
                style={{ background: "rgba(34,211,238,0.14)", filter: "blur(60px)" }} />

              {onClose && (
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 p-2 rounded-full border border-white/10 bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -200 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", damping: 14, stiffness: 190 }}
                className="relative mx-auto mb-7 w-20 h-20"
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(59,130,246,0.2))",
                    border: "1px solid rgba(34,211,238,0.35)",
                    boxShadow: "0 0 36px rgba(34,211,238,0.22)",
                  }}
                >
                  <CheckCircle2 className="w-9 h-9 text-cyan-400" strokeWidth={1.5} />
                </div>
                {/* Pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.7], opacity: [0.45, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full"
                  style={{ border: "1px solid rgba(34,211,238,0.4)" }}
                />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-3xl font-semibold tracking-tight text-white mb-3"
              >
                {status === "duplicate" ? "Already registered." : "You're in. 🎉"}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-sm leading-relaxed text-white/55 mx-auto max-w-[270px] mb-9"
              >
                {message || "Watch your inbox — we'll reach out as soon as early access opens."}
              </motion.p>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.58 }}
                onClick={() => setStatus("idle")}
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.97 }}
                className="text-[11px] font-bold uppercase tracking-widest text-cyan-300/60 hover:text-cyan-200 transition-colors duration-200"
              >
                ← Add another email
              </motion.button>

              {/* Particle burst */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.25rem]">
                {PARTICLES.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 80, x: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], y: -p.y, x: p.x, scale: [0, 1, 0] }}
                    transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeOut" }}
                    className="absolute bottom-12 left-1/2 rounded-full"
                    style={{ width: p.size, height: p.size, background: p.colour }}
                  />
                ))}
              </div>

              {/* Bottom shimmer */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/5 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.4), transparent)" }} />
            </div>
          </motion.div>

        ) : (
        /* ════════════ FORM ════════════ */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              rotateX: isCompact ? 0 : rotateX,
              rotateY: isCompact ? 0 : rotateY,
              perspective: 1200,
            }}
            onMouseMove={onCardMove}
            onMouseLeave={() => { cardX.set(0); cardY.set(0); }}
          >
            {/* ── Outer aura glow ── */}
            <motion.div
              className="absolute inset-0 rounded-[2.4rem] pointer-events-none -z-10"
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.18) 0%, transparent 70%)",
                filter: "blur(24px)",
                transform: "scale(1.08)",
              }}
            />

            {/* ── Card shell ── */}
            <div
              className="relative overflow-hidden rounded-[2.25rem]"
              style={{
                background: "linear-gradient(168deg, rgba(12,22,44,0.82) 0%, rgba(4,10,24,0.94) 55%, rgba(2,6,16,0.98) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 0 0 1px rgba(34,211,238,0.18) inset, 0 0 80px rgba(34,211,238,0.13), 0 40px 100px rgba(1,5,18,0.82)",
                backdropFilter: "blur(24px)",
              }}
            >
              {/* Inner border highlight */}
              <div className="absolute inset-[1px] rounded-[calc(2.25rem-1px)] pointer-events-none"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }} />

              {/* Top shimmer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent)" }} />

              {/* Animated top-right blob */}
              <motion.div
                animate={{ x: [0, 12, -6, 0], y: [0, -8, 8, 0], scale: [1, 1.1, 0.92, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute -right-16 -top-20 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: "rgba(34,211,238,0.10)", filter: "blur(72px)" }}
              />

              {/* Animated bottom-left blob */}
              <motion.div
                animate={{ x: [0, -10, 10, 0], y: [0, 12, -6, 0], scale: [1, 0.88, 1.12, 1] }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                className="absolute -left-20 -bottom-24 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: "rgba(96,165,250,0.08)", filter: "blur(80px)" }}
              />

              {/* Mouse backlight */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-[2.25rem]"
                style={{ background: backlight }}
              />

              {/* Noise grain overlay */}
              <div
                className="absolute inset-0 pointer-events-none rounded-[2.25rem] mix-blend-overlay opacity-[0.035]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundSize: "180px 180px" }}
              />

              {/* Close */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 z-50 p-2 rounded-full border border-white/10 bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* ═══ CONTENT ═══ */}
              <div className={`relative z-10 ${isCompact ? "p-7" : "px-8 pt-9 pb-8 sm:px-10"}`}>

                {/* ── Header ── */}
                {!isCompact ? (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8 space-y-5"
                  >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-300/20 bg-cyan-400/[0.07] text-cyan-200 text-[10px] font-semibold uppercase tracking-[0.22em]">
                      <Sparkles className="w-3 h-3" />
                      Private Beta · Limited Spots
                    </div>

                    {/* Headline — emotional & aspirational */}
                    <div className="space-y-2">
                      <h2 className="text-[2.1rem] sm:text-[2.4rem] font-semibold leading-[1.06] tracking-[-0.045em] text-white">
                        Your inbox should feel like
                        <br />
                        <span
                          className="text-transparent bg-clip-text"
                          style={{
                            backgroundImage: "linear-gradient(100deg, rgb(34,211,238) 0%, rgb(147,197,253) 48%, rgb(196,181,253) 100%)",
                          }}
                        >
                          a clear morning.
                        </span>
                      </h2>
                      <p className="text-[0.95rem] leading-[1.7] text-white/52 max-w-[400px]">
                        Join early access to an AI email workflow that silences the noise and surfaces only what matters.
                      </p>
                    </div>

                    {/* Social proof counter — FOMO */}
                    <div className="flex items-center gap-3">
                      {signupCount !== null && signupCount > 0 && (
                        <p className="text-[11px] text-white/45 font-medium">
                          <span className="text-white/75 font-semibold">{signupCount.toLocaleString()}+</span>{" "}
                          people already on the list
                        </p>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 space-y-2"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-300/20 bg-cyan-400/[0.07] text-cyan-200 text-[10px] font-semibold uppercase tracking-[0.2em]">
                      <Sparkles className="w-3 h-3" />Early Access
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white">Reserve your spot.</h2>
                    <p className="text-sm text-white/50">Be first in when doors open.</p>
                  </motion.div>
                )}

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Email — primary field, most prominent */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-2.5"
                  >
                    <label className={labelBase}>Work Email</label>
                    <div className="relative group/input" onMouseMove={onInputMove}>
                      {/* Glow halo on focus */}
                      <div
                        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-400"
                        style={{ background: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(34,211,238,0.13), transparent 52%)" }}
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 group-focus-within/input:text-cyan-400 transition-colors duration-300 pointer-events-none" />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        disabled={status === "loading"}
                        placeholder="hello@yourcompany.com"
                        className={`${inputBase} py-4 pl-11 pr-4 text-base`}
                      />
                      {/* Animated underline when focused */}
                      <motion.div
                        className="absolute bottom-0 left-4 right-4 h-px rounded-full"
                        animate={{ scaleX: emailFocused ? 1 : 0, opacity: emailFocused ? 1 : 0 }}
                        style={{ background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)",  originX: 0.5 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>

                  {/* Volume + Role — secondary row */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-2 gap-3.5"
                  >
                    {/* Volume */}
                    <div className="space-y-2.5">
                      <label className={labelBase}>Volume</label>
                      <div className="relative group/input" onMouseMove={onInputMove}>
                        <div
                          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-400"
                          style={{ background: "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(34,211,238,0.1), transparent 60%)" }}
                        />
                        <select
                          value={emailsPerDay}
                          onChange={(e) => setEmailsPerDay(e.target.value)}
                          disabled={status === "loading"}
                          className={`${inputBase} appearance-none cursor-pointer py-4 pl-4 pr-9 text-sm`}
                        >
                          <option value="" className="bg-[#070f20]">Emails / day</option>
                          <option value="0-10" className="bg-[#070f20]">0 – 10</option>
                          <option value="10-30" className="bg-[#070f20]">10 – 30</option>
                          <option value="30-100" className="bg-[#070f20]">30 – 100</option>
                          <option value="100+" className="bg-[#070f20]">100+</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                      </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-2.5">
                      <label className={labelBase}>Role</label>
                      <div className="relative group/input" onMouseMove={onInputMove}>
                        <div
                          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-400"
                          style={{ background: "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(34,211,238,0.1), transparent 60%)" }}
                        />
                        <select
                          value={userType}
                          onChange={(e) => setUserType(e.target.value)}
                          disabled={status === "loading"}
                          className={`${inputBase} appearance-none cursor-pointer py-4 pl-4 pr-9 text-sm`}
                        >
                          <option value="" className="bg-[#070f20]">You are a...</option>
                          <option value="Student" className="bg-[#070f20]">Student</option>
                          <option value="Professional" className="bg-[#070f20]">Professional</option>
                          <option value="Founder" className="bg-[#070f20]">Founder</option>
                          <option value="Executive" className="bg-[#070f20]">Executive</option>
                        </select>
                        <Users className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Feedback — optional */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-2.5"
                  >
                    <label className={labelBase}>
                      Pain Point <span className="normal-case tracking-normal font-normal text-white/30">— optional</span>
                    </label>
                    <div className="relative group/input" onMouseMove={onInputMove}>
                      <div
                        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-400"
                        style={{ background: "radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), rgba(34,211,238,0.1), transparent 56%)" }}
                      />
                      <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-white/25 group-focus-within/input:text-cyan-400 transition-colors duration-300 pointer-events-none" />
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="What makes email feel exhausting right now?"
                        rows={3}
                        disabled={status === "loading"}
                        className={`${inputBase} py-4 pl-11 pr-4 resize-none min-h-[96px] text-sm`}
                      />
                    </div>
                  </motion.div>

                  {/* Notify checkbox — polished */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="flex items-start gap-3.5 px-4 py-3.5 rounded-2xl border border-white/[0.09] bg-white/[0.04] cursor-pointer hover:bg-white/[0.065] hover:border-white/15 transition-all duration-300"
                    onClick={() => setNotify((v) => !v)}
                  >
                    {/* Custom checkbox */}
                    <motion.div
                      animate={notify ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className="mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-md border transition-all duration-200"
                      style={notify
                        ? { background: "rgb(6,182,212)", borderColor: "rgb(6,182,212)", boxShadow: "0 0 12px rgba(6,182,212,0.4)" }
                        : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)" }
                      }
                    >
                      <AnimatePresence>
                        {notify && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <div className="select-none">
                      <p className="text-[0.85rem] font-medium text-white/80 leading-none mb-1">Notify me when doors open</p>
                      <p className="text-[11px] text-white/35 leading-snug">Early invites, product news and onboarding tips. Cancel any time.</p>
                    </div>
                  </motion.div>

                  {/* Error */}
                  <AnimatePresence>
                    {status === "error" && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-center text-[11px] font-semibold tracking-wide text-red-400"
                      >
                        {message}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* CTA — magnetic, premium */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="pt-1"
                  >
                    <motion.button
                      ref={btnRef}
                      type="submit"
                      disabled={status === "loading" || !email}
                      style={{ x: sbx, y: sby, scale: sbs }}
                      onMouseMove={onBtnMove}
                      onMouseLeave={() => { bx.set(0); by.set(0); bs.set(1); }}
                      whileTap={{ scale: 0.97 }}
                      className="group/btn relative w-full py-4 rounded-2xl text-[0.9rem] font-semibold tracking-[0.06em] text-white overflow-hidden disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {/* Base gradient */}
                      <div className="absolute inset-0"
                        style={{ background: "linear-gradient(130deg, rgb(6,182,212) 0%, rgb(37,99,235) 52%, rgb(79,70,229) 100%)" }} />
                      {/* Hover gradient */}
                      <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-400"
                        style={{ background: "linear-gradient(130deg, rgb(34,211,238) 0%, rgb(59,130,246) 52%, rgb(99,102,241) 100%)" }} />
                      {/* Shadow glow */}
                      <div className="absolute inset-0 rounded-2xl"
                        style={{ boxShadow: "0 16px 42px -10px rgba(34,211,238,0.5), inset 0 1px 0 rgba(255,255,255,0.25)" }} />
                      {/* Scanning shine */}
                      <motion.div
                        className="absolute h-full w-1/4 skew-x-[-22deg] pointer-events-none"
                        style={{ background: "rgba(255,255,255,0.14)", filter: "blur(12px)" }}
                        animate={{ x: ["-140%", "250%"] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.8 }}
                      />
                      {/* Top specular */}
                      <div className="absolute inset-x-8 top-0 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)" }} />

                      <span className="relative z-10 flex items-center justify-center gap-2.5">
                        {status === "loading" ? (
                          <>Processing <Loader2 className="w-4 h-4 animate-spin" /></>
                        ) : (
                          <>
                            Reserve My Spot
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-250" />
                          </>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>

                  {/* Bottom trust strip */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-5 pt-1"
                  >
                    {PERKS.map((p) => (
                      <div key={p.label} className="flex items-center gap-1.5 text-white/30 text-[10px] font-medium">
                        <span className="text-cyan-400/60">{p.icon}</span>
                        {p.label}
                      </div>
                    ))}
                  </motion.div>
                </form>
              </div>

              {/* Bottom shimmer */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/5 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.35), transparent)" }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
