import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface DepthLayerProps {
  children: ReactNode;
  depth?: number;
  className?: string;
}

export function DepthLayer({ children, depth = 0, className = '' }: DepthLayerProps) {
  // depth: 0 (background) to 10 (foreground)
  // Higher depth = closer to viewer = more parallax movement
  const translateZ = depth * 20;

  return (
    <motion.div
      className={className}
      style={{
        transform: `translateZ(${translateZ}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}
