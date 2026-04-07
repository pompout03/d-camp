"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const WaitlistWidget: React.FC = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    router.push("/waitlist");
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes widget-entry {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes widget-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        .waitlist-widget {
          animation: widget-entry 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .widget-float-container {
          animation: widget-float 4s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>

      <div
        className="fixed bottom-[32px] right-[32px] z-[9999] waitlist-widget"
        style={{ cursor: "pointer" }}
        onClick={handleClick}
      >
        <div className="widget-float-container">
          <div
            className="flex items-center justify-center px-[28px] py-[14px] rounded-[100px] border border-[rgba(255,255,255,0.15)] transition-all duration-150 active:scale-[0.96] hover:scale-[1.05]"
            style={{
              background: "linear-gradient(135deg, #7B6FD4 0%, #1a1a2e 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "#ffffff",
                whiteSpace: "nowrap",
                letterSpacing: "-0.01em",
              }}
            >
              Get Early Access
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default WaitlistWidget;
