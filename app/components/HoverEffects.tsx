import { motion } from "motion/react";
import { ReactNode } from "react";

interface HoverTiltProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function HoverTilt({ children, className = "", maxTilt = 15 }: HoverTiltProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        scale: 1.05,
        rotateX: 5,
        rotateY: 5,
        transition: { duration: 0.3 },
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      {children}
    </motion.div>
  );
}

interface HoverGlowProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function HoverGlow({
  children,
  className = "",
  glowColor = "rgba(59, 130, 246, 0.5)",
}: HoverGlowProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        boxShadow: `0 0 30px ${glowColor}, 0 0 60px ${glowColor}`,
        scale: 1.02,
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  liftAmount?: number;
}

export function HoverLift({
  children,
  className = "",
  liftAmount = 10,
}: HoverLiftProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -liftAmount,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
    >
      {children}
    </motion.div>
  );
}
