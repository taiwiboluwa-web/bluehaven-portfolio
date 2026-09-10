import { motion } from "motion/react";
import { ReactNode } from "react";

interface GlassMorphCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  animated?: boolean;
}

export function GlassMorphCard({
  children,
  className = "",
  hoverEffect = true,
  animated = true
}: GlassMorphCardProps) {
  const cardVariants = {
    initial: animated ? { opacity: 0, y: 20 } : {},
    animate: animated ? { opacity: 1, y: 0 } : {},
    hover: hoverEffect ? {
      scale: 1.02,
      y: -5,
      borderColor: "rgba(255, 255, 255, 0.3)",
      boxShadow: "0 16px 50px rgba(0, 0, 0, 0.4), inset 0 0 40px rgba(255, 255, 255, 0.12)",
    } : {},
  };

  return (
    <motion.div
      className={`rounded-2xl backdrop-blur-xl border transition-all relative overflow-hidden ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        borderColor: "rgba(255, 255, 255, 0.15)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.05)",
      }}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{
        duration: 0.4,
        ease: "easeInOut",
      }}
    >
      {/* Liquid morphing background layer */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-60"
        style={{
          background: "radial-gradient(circle at 20% 30%, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 60%)",
        }}
        animate={{
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          padding: "1px",
          background: "linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.2) 50%, rgba(0,0,0,0) 100%)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
