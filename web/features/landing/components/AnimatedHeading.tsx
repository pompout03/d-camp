"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedHeadingProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export default function AnimatedHeading({ children, className = "", style = {}, delay = 0, as = "h2" }: AnimatedHeadingProps) {
  const Component = motion[as as keyof typeof motion] as any;

  return (
    <div className="relative inline-block overflow-hidden" style={{ width: "100%" }}>
      <Component
        className={className}
        style={style}
        initial={{ y: "110%", opacity: 0, rotateZ: 2 }}
        whileInView={{ y: 0, opacity: 1, rotateZ: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ 
          duration: 0.9, 
          delay, 
          ease: [0.16, 1, 0.3, 1] 
        }}
      >
        {children}
      </Component>
    </div>
  );
}
