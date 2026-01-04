import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MagneticButton({ children, className = '', onClick }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * 0.2;
    const deltaY = (e.clientY - centerY) * 0.2;
    
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

export function GlowButton({ children, className = '', onClick }: MagneticButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative group ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-primary/30 blur-xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
      
      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.5), hsl(var(--primary)))',
          backgroundSize: '200% 100%',
        }}
        initial={{ opacity: 0 }}
        whileHover={{ 
          opacity: 0.3,
          backgroundPosition: ['0% 50%', '100% 50%'],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.button>
  );
}
