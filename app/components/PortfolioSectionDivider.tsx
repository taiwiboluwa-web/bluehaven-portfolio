import { motion } from "motion/react";

interface PortfolioSectionDividerProps {
  title: string;
  subtitle?: string;
  id?: string;
}

export function PortfolioSectionDivider({ title, subtitle, id }: PortfolioSectionDividerProps) {
  return (
    <section
      id={id}
      className="py-10 md:py-16 px-4 md:px-[10%] relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15,15,15,0.9) 0%, rgba(20,20,20,0.95) 50%, rgba(15,15,15,0.9) 100%)",
      }}
    >
      {/* Liquid morphing background effect */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(147,51,234,0.3) 0%, rgba(0,0,0,0) 50%)",
        }}
        animate={{
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, rotateX: 20 }}
        whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto text-center relative z-10"
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px",
        }}
      >
        <div className="inline-block">
          <motion.h2
            className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4 uppercase"
            animate={{
              textShadow: [
                "0 0 15px rgba(255,255,255,0.2)",
                "0 0 30px rgba(255,255,255,0.4)",
                "0 0 15px rgba(255,255,255,0.2)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #999999 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p
              className="text-sm md:text-lg text-gray-400 tracking-wider uppercase px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
          )}
          <motion.div
            className="h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mt-4 md:mt-6"
            initial={{ width: 0 }}
            whileInView={{ width: "8rem" }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            animate={{
              boxShadow: [
                "0 0 10px rgba(255,255,255,0.4)",
                "0 0 20px rgba(255,255,255,0.8)",
                "0 0 10px rgba(255,255,255,0.4)",
              ],
            }}
            style={{
              transition: "box-shadow 2s ease-in-out infinite",
            }}
          />
        </div>
      </motion.div>

      {/* Decorative liquid particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/40"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + Math.random() * 40}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </section>
  );
}