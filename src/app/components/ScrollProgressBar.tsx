import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 35,
    restDelta: 0.001,
  });

  return (
    <>
      {/* Top progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left z-[9999]"
        style={{ scaleX }}
      />

      {/* Bottom accent glow */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 origin-left z-[9998] blur-sm"
        style={{
          scaleX,
          background: "linear-gradient(to right, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5), rgba(236, 72, 153, 0.5))",
        }}
      />
    </>
  );
}
