import { motion } from "motion/react";

interface InfiniteCarouselProps {
  items: string[];
  duration?: number;
  direction?: "left" | "right";
}

export function InfiniteCarousel({
  items,
  duration = 30,
  direction = "left"
}: InfiniteCarouselProps) {
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="relative w-full overflow-hidden py-8">
      {/* Animated shimmer overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
        }}
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="flex gap-8"
        animate={{
          x: direction === "left" ? ["0%", "-33.333%"] : ["-33.333%", "0%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: duration,
            ease: "linear",
          },
        }}
        style={{ width: "fit-content" }}
      >
        {duplicatedItems.map((item, index) => (
          <motion.div
            key={index}
            className="flex-shrink-0 px-8 py-4 rounded-2xl backdrop-blur-md border border-white/10 relative overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.05)",
            }}
            whileHover={{
              scale: 1.05,
              background: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.3)",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.08)",
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {/* Liquid shimmer effect on each item */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 50%)",
              }}
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <span className="text-white/80 font-medium whitespace-nowrap relative z-10">
              {item}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Gradient fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none"
        style={{
          background: "linear-gradient(to right, #0f0f0f, transparent)"
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none"
        style={{
          background: "linear-gradient(to left, #0f0f0f, transparent)"
        }}
      />
    </div>
  );
}
