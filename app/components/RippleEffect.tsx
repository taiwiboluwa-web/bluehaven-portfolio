import { motion, AnimatePresence } from "motion/react";
import { useState, MouseEvent } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function RippleEffect() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9997] overflow-hidden"
      onClick={handleClick}
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full border-2 border-white/30"
            initial={{
              x: ripple.x,
              y: ripple.y,
              width: 0,
              height: 0,
              opacity: 1,
            }}
            animate={{
              width: 100,
              height: 100,
              x: ripple.x - 50,
              y: ripple.y - 50,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
