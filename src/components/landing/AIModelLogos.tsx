import { motion } from 'framer-motion';

// Qwen Logo - Alibaba's model with stylized "Q" design
export function QwenLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="qwen-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#qwen-gradient)" />
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="system-ui">Q</text>
      <circle cx="28" cy="28" r="4" fill="white" opacity="0.9" />
    </svg>
  );
}

// DistilBERT Logo - Hugging Face inspired emoji face
export function DistilBERTLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hf-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD21E" />
          <stop offset="100%" stopColor="#FF9D00" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#hf-gradient)" />
      {/* Face */}
      <circle cx="14" cy="17" r="2.5" fill="#1F2937" />
      <circle cx="26" cy="17" r="2.5" fill="#1F2937" />
      {/* Smile */}
      <path d="M12 24 Q20 32 28 24" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Cheeks */}
      <ellipse cx="10" cy="22" rx="2" ry="1.5" fill="#FF6B6B" opacity="0.5" />
      <ellipse cx="30" cy="22" rx="2" ry="1.5" fill="#FF6B6B" opacity="0.5" />
    </svg>
  );
}

// MiniLM Logo - Microsoft inspired with M design
export function MiniLMLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="minilm-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0078D4" />
          <stop offset="100%" stopColor="#00BCF2" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="8" fill="url(#minilm-gradient)" />
      {/* Microsoft-style M */}
      <path d="M10 28V14L16 22L22 14V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M26 14H30V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// Claude Logo - Anthropic's minimalist design
export function ClaudeLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="claude-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#claude-gradient)" />
      {/* Stylized "C" with sparkle */}
      <path d="M26 14 C18 14 14 17 14 20 C14 23 18 26 26 26" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="28" cy="12" r="2" fill="white" />
      <path d="M30 10 L32 8 M28 8 L28 6 M32 12 L34 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface AIModelBadgeWithLogoProps {
  name: string;
  label: string;
  description?: string;
  Logo: React.ComponentType<{ className?: string }>;
  index: number;
  gradient: string;
}

export function AIModelBadgeWithLogo({ name, label, description, Logo, index, gradient }: AIModelBadgeWithLogoProps) {
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
      <div className={`relative flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-br ${gradient} border border-border/50 group-hover:border-primary/50 backdrop-blur-xl transition-all duration-300 overflow-hidden`}>
        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out" />
        </div>
        
        {/* Logo with glow */}
        <div className="relative">
          <div className="absolute inset-0 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300">
            <Logo className="w-10 h-10 sm:w-11 sm:h-11" />
          </div>
          <Logo className="relative w-10 h-10 sm:w-11 sm:h-11 drop-shadow-lg" />
        </div>
        
        {/* Text content */}
        <div className="flex flex-col">
          <span className="text-sm sm:text-base font-bold text-foreground tracking-tight">{name}</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{label}</span>
        </div>
        
        {/* Active indicator dot */}
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      </div>
    </motion.div>
  );
}

// Footer version with description
export function AIModelCardWithLogo({ name, label, description, Logo, index }: Omit<AIModelBadgeWithLogoProps, 'gradient'>) {
  return (
    <motion.div 
      className="group relative p-4 rounded-xl bg-gradient-to-br from-card via-card to-secondary/30 border border-border hover:border-primary/30 transition-all duration-300"
      whileHover={{ y: -4, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex flex-col items-center text-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 blur-md opacity-0 group-hover:opacity-50 transition-opacity">
            <Logo className="w-12 h-12" />
          </div>
          <Logo className="relative w-12 h-12 drop-shadow-lg" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{name}</p>
          <p className="text-[10px] uppercase tracking-wider text-primary font-medium">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
