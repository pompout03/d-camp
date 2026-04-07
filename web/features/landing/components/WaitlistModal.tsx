"use client";

import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import WaitlistForm from "./WaitlistForm";

export default function WaitlistModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Magnetic widget effect
  const wx = useMotionValue(0);
  const wy = useMotionValue(0);
  const swx = useSpring(wx, { stiffness: 260, damping: 22 });
  const swy = useSpring(wy, { stiffness: 260, damping: 22 });

  function handleWidgetMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    wx.set((e.clientX - rect.left - rect.width / 2) * 0.35);
    wy.set((e.clientY - rect.top - rect.height / 2) * 0.35);
  }

  return (
    <>
      {/* ── Floating Widget ── */}
      <motion.button
        style={{ x: swx, y: swy }}
        onMouseMove={handleWidgetMove}
        onMouseLeave={() => { wx.set(0); wy.set(0); }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-7 right-7 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-full
          bg-[#0a1628]/80 backdrop-blur-xl cursor-pointer group
          border border-cyan-500/40 shadow-[0_0_24px_rgba(6,182,212,0.25),0_8px_32px_rgba(0,0,0,0.5)]
          hover:border-cyan-400/70 hover:shadow-[0_0_40px_rgba(6,182,212,0.4),0_12px_40px_rgba(0,0,0,0.6)]
          transition-all duration-300 overflow-hidden"
      >
        {/* Hover gradient sweep */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, transparent 60%)' }} />

        {/* Icon */}
        <div className="relative z-10 w-7 h-7 flex items-center justify-center rounded-full
          bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]">
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Plus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </motion.div>
        </div>

        {/* Label */}
        <div className="relative z-10 flex flex-col items-start leading-tight pr-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Join Waitlist</span>
          <span className="text-[9px] text-slate-400 font-medium">Limited spots</span>
        </div>

        {/* Live dot */}
        <span className="relative z-10 flex h-2 w-2 ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
        </span>
      </motion.button>

      {/* ── Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="modal-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
            />

            {/* Form Container */}
            <motion.div
              initial={{ scale: 0.92, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-[460px]"
            >
              <WaitlistForm
                variant="hero"
                onClose={() => setIsOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes text-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-text-shimmer {
          background-size: 200% auto;
          animation: text-shimmer 4s linear infinite;
        }
      `}} />
    </>
  );
}
