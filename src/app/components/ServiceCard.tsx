import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string | React.ReactNode;
  delay: number;
  isFullWidth?: boolean;
}

export function ServiceCard({ icon, title, description, delay, isFullWidth }: ServiceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      onClick={() => setIsOpen(!isOpen)}
      whileHover={{
        scale: 1.02,
        y: -8,
        transition: { duration: 0.4, ease: "easeInOut" },
      }}
      className={`p-6 md:p-8 border transition-all cursor-pointer group text-left flex flex-col rounded-2xl relative overflow-hidden ${
        isFullWidth
          ? "bg-white/10 backdrop-blur-lg border-white/20 hover:border-white/40 hover:bg-white/15 md:col-span-2 lg:col-span-1"
          : "bg-white/5 backdrop-blur-md border-white/10 hover:border-white/30 hover:bg-white/10"
      }`}
      style={{
        boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
      }}
    >
      {/* Liquid morph hover effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated shimmer effect */}
      <motion.div
        className="absolute -inset-full opacity-0 group-hover:opacity-100"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        }}
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      />

      <div className="flex justify-between items-start mb-4 md:mb-5 relative z-10">
        <motion.div
          whileHover={{ scale: 1.2, rotate: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {icon}
        </motion.div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
        </motion.div>
      </div>
      <h3 className={`text-lg md:text-xl font-bold text-white uppercase tracking-wide relative z-10 ${
        isFullWidth ? "bg-gradient-to-r from-gray-400 via-gray-200 to-white bg-clip-text text-transparent" : ""
      }`}>
        {title}
      </h3>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden relative z-10"
          >
            <p className="text-sm md:text-base text-gray-400 leading-relaxed mt-3 md:mt-4">
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
