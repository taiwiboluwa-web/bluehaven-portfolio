import { motion } from 'motion/react';

export function LiquidBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Animated liquid blobs */}
      <motion.div
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(147,51,234,0.4) 0%, rgba(59,130,246,0.2) 50%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 200, 0],
          y: [0, 150, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(251,146,60,0.2) 50%, transparent 70%)",
          filter: "blur(70px)",
        }}
        animate={{
          x: [0, -150, 0],
          y: [0, 200, 0],
          scale: [1, 1.4, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-0 left-1/3 w-[550px] h-[550px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(14,165,233,0.2) 50%, transparent 70%)",
          filter: "blur(65px)",
        }}
        animate={{
          x: [0, 180, 0],
          y: [0, -120, 0],
          scale: [1, 1.35, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(139,92,246,0.2) 50%, transparent 70%)",
          filter: "blur(55px)",
        }}
        animate={{
          x: [0, -120, 0],
          y: [0, 160, 0],
          scale: [1, 1.25, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Morphing liquid shapes */}
      <motion.div
        className="absolute top-1/2 left-1/4 w-[400px] h-[400px] opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(34,197,94,0.3) 0%, rgba(16,185,129,0.15) 50%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{
          borderRadius: [
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "30% 60% 70% 40% / 50% 60% 30% 60%",
            "60% 40% 30% 70% / 60% 30% 70% 40%",
          ],
          x: [0, 100, 0],
          y: [0, -80, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-3/4 right-1/3 w-[350px] h-[350px] opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(245,158,11,0.15) 50%, transparent 70%)",
          filter: "blur(45px)",
        }}
        animate={{
          borderRadius: [
            "40% 60% 60% 40% / 60% 30% 70% 40%",
            "60% 40% 40% 60% / 40% 60% 40% 60%",
            "40% 60% 60% 40% / 60% 30% 70% 40%",
          ],
          x: [0, -90, 0],
          y: [0, 70, 0],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating particles with liquid trails */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: "blur(1px)",
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Liquid wave effect at bottom */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-40 opacity-10"
        style={{
          background: "linear-gradient(to top, rgba(147,51,234,0.3), transparent)",
          filter: "blur(30px)",
        }}
        animate={{
          scaleY: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
