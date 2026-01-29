import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AIModelBadgeProps {
  name: string;
  label: string;
  icon: LucideIcon;
  index: number;
  gradient: string;
}

export function AIModelBadge({ name, label, icon: Icon, index, gradient }: AIModelBadgeProps) {
  return (
    <motion.div
      className="relative group cursor-pointer"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: 0.6 + index * 0.12, 
        type: "spring", 
        stiffness: 200,
        damping: 20
      }}
      whileHover={{ 
        scale: 1.08, 
        y: -4,
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated gradient border */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary via-emerald-400 to-primary opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 animate-gradient-x" />
      
      {/* Glow effect */}
      <div className="absolute -inset-2 rounded-2xl bg-primary/20 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />
      
      {/* Main badge */}
      <div className={`relative flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-br ${gradient} border border-primary/20 group-hover:border-primary/50 backdrop-blur-xl transition-all duration-300 overflow-hidden`}>
        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out" />
        </div>
        
        {/* Icon with glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/40 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-300">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
          </div>
        </div>
        
        {/* Text content */}
        <div className="flex flex-col">
          <span className="text-sm sm:text-base font-bold text-foreground tracking-tight">{name}</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        </div>
        
        {/* Active indicator dot */}
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      </div>
    </motion.div>
  );
}

export function AIModelBadgesSection() {
  return null; // Placeholder - badges are rendered inline
}
