import { motion } from 'framer-motion';
import { CreditCard, Shield, TrendingUp, Sparkles, Brain, Zap } from 'lucide-react';

export function FloatingElements() {
  const floatingVariants = {
    animate: (i: number) => ({
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        y: {
          duration: 4 + i * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: 6 + i * 0.3,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    }),
  };

  const elements = [
    { Icon: CreditCard, position: 'top-[15%] left-[8%]', size: 'w-12 h-12 sm:w-16 sm:h-16', delay: 0 },
    { Icon: Shield, position: 'top-[25%] right-[10%]', size: 'w-10 h-10 sm:w-14 sm:h-14', delay: 1 },
    { Icon: TrendingUp, position: 'bottom-[30%] left-[5%]', size: 'w-10 h-10 sm:w-12 sm:h-12', delay: 2 },
    { Icon: Sparkles, position: 'bottom-[20%] right-[8%]', size: 'w-8 h-8 sm:w-10 sm:h-10', delay: 3 },
    { Icon: Brain, position: 'top-[40%] left-[3%]', size: 'w-8 h-8 sm:w-10 sm:h-10', delay: 4 },
    { Icon: Zap, position: 'top-[50%] right-[5%]', size: 'w-10 h-10 sm:w-12 sm:h-12', delay: 5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map(({ Icon, position, size, delay }, index) => (
        <motion.div
          key={index}
          className={`absolute ${position} hidden md:block`}
          custom={delay}
          variants={floatingVariants}
          animate="animate"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: delay * 0.2 }}
        >
          <div className={`${size} rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10`}>
            <Icon className="w-1/2 h-1/2 text-primary" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
