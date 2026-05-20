import { motion } from "motion/react";
import { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "glass";
  className?: string;
}

export function AnimatedButton({
  children,
  onClick,
  variant = "primary",
  className = "",
}: AnimatedButtonProps) {
  const variants = {
    primary: {
      base: "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
      hover: {
        scale: 1.05,
        background: "linear-gradient(to right, rgb(37, 99, 235), rgb(147, 51, 234))",
        boxShadow: "0 10px 40px rgba(79, 70, 229, 0.4)",
      },
    },
    secondary: {
      base: "bg-white/10 text-white border border-white/20",
      hover: {
        scale: 1.05,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderColor: "rgba(255, 255, 255, 0.4)",
      },
    },
    glass: {
      base: "text-white border border-white/10",
      hover: {
        scale: 1.05,
        background: "rgba(255, 255, 255, 0.15)",
        borderColor: "rgba(255, 255, 255, 0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)",
      },
    },
  };

  const currentVariant = variants[variant];

  return (
    <motion.button
      onClick={onClick}
      className={`relative px-8 py-3 rounded-full font-semibold uppercase tracking-wider overflow-hidden backdrop-blur-md ${currentVariant.base} ${className}`}
      style={
        variant === "glass"
          ? {
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
            }
          : {}
      }
      whileHover={currentVariant.hover}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated background shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
        }}
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        }}
      />

      {/* Ripple effect on hover */}
      <motion.span
        className="absolute inset-0 rounded-full pointer-events-none"
        initial={{ scale: 0, opacity: 0.5 }}
        whileHover={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
        }}
      />

      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
