"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { Zap, ArrowLeft, Shield, Star, Users } from "lucide-react";
import WaitlistForm from "@/features/landing/components/WaitlistForm";

export default function WaitlistPage() {
  const [mounted, setMounted] = useState(false);

  // Mouse backlight effect
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const backlight = useMotionTemplate`radial-gradient(1000px circle at ${mx}px ${my}px, rgba(34,211,238,0.07), transparent 70%)`;

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleMouseMove(e: React.MouseEvent) {
    mx.set(e.clientX);
    my.set(e.clientY);
  }

  if (!mounted) return null;

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full bg-[#030816] text-white selection:bg-cyan-500/30 overflow-x-hidden relative"
    >
      {/* ── Background Elements ── */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ background: backlight }}
        />
        {/* Aurora Blurs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* ── Top Navigation ── */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <Link 
          href="/" 
          className="flex items-center gap-3 group transition-transform hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-shadow group-hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Decamp
          </span>
        </Link>

        <Link 
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </nav>

      {/* ── Main Content Area ── */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-8 pb-32 max-w-4xl mx-auto text-center">
        
        {/* Small badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-8"
        >
          <div className="flex -space-x-2">
             {[1,2,3].map(i => (
               <div key={i} className="w-5 h-5 rounded-full border border-[#030816] bg-slate-800 flex items-center justify-center text-[8px] font-bold">
                 {String.fromCharCode(64 + i)}
               </div>
             ))}
          </div>
          <span className="text-xs font-semibold text-white/60 tracking-wide uppercase">
            Join 1,200+ on the priority list
          </span>
        </motion.div>

        {/* Waitlist Form Centerpiece */}
        <div className="w-full">
           <WaitlistForm variant="hero" />
        </div>

        {/* ── Trust Indicators ── */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full"
        >
          <div className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-2">
              <Shield size={20} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">Privacy First</h3>
            <p className="text-xs leading-relaxed text-white/40 max-w-[200px]">
              We respect your data. Your email is secured with enterprise-grade encryption.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2">
              <Star size={20} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">Early Access</h3>
            <p className="text-xs leading-relaxed text-white/40 max-w-[200px]">
              Priority members get a lifetime founding-member discount when we launch.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
              <Users size={20} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">Beta Invite</h3>
            <p className="text-xs leading-relaxed text-white/40 max-w-[200px]">
              Invites are sent in rolling batches based on your waitlist position.
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.05] bg-black/20 backdrop-blur-md py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-white/30">
            &copy; 2026 Decamp. Built for high-performance minds.
          </p>
          <div className="flex gap-8">
            <Link href="/terms" className="text-xs font-semibold uppercase tracking-widest text-white/30 hover:text-cyan-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-xs font-semibold uppercase tracking-widest text-white/30 hover:text-cyan-400 transition-colors">Privacy</Link>
            <Link href="/contact" className="text-xs font-semibold uppercase tracking-widest text-white/30 hover:text-cyan-400 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
