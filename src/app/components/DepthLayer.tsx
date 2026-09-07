import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface DepthLayerProps {
  children: ReactNode;
  depth?: number;
  className?: string;
}

export function DepthLayer({ children, depth = 0, className = '' }: DepthLayerProps) {
  // depth: 0 (background) to 10 (foreground)
  // Higher depth = closer to viewer = more parallax movement.
  // IMPORTANT: transform creates a stacking context, so depth must also be
  // reflected in z-index. Without this, later layers can paint over interactive
  // controls (especially the mobile header/menu) even when the header itself has
  // a high z-index.
  const translateZ = depth * 20;

  return (
    <motion.div
      className={className}
      style={{
        position: 'relative',
        zIndex: depth,
        transform: `translateZ(${translateZ}px)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  );
}
