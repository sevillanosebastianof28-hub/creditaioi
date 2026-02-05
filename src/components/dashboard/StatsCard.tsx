import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantStyles = {
  default: {
    iconBg: 'bg-secondary',
    iconText: 'text-foreground',
    gradient: 'from-secondary/20 to-secondary/5',
    border: 'border-border/50',
    glow: '',
  },
  primary: {
    iconBg: 'bg-primary/15',
    iconText: 'text-primary',
    gradient: 'from-primary/10 to-primary/5',
    border: 'border-primary/20',
    glow: 'shadow-primary/5',
  },
  success: {
    iconBg: 'bg-success/15',
    iconText: 'text-success',
    gradient: 'from-success/10 to-success/5',
    border: 'border-success/20',
    glow: 'shadow-success/5',
  },
  warning: {
    iconBg: 'bg-warning/15',
    iconText: 'text-warning',
    gradient: 'from-warning/10 to-warning/5',
    border: 'border-warning/20',
    glow: 'shadow-warning/5',
  },
};

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = 'default',
}: StatsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 group",
        "hover:shadow-xl",
        styles.border,
        styles.glow && `hover:${styles.glow}`
      )}
    >
      {/* Gradient overlay */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", styles.gradient)} />
      
      {/* Decorative element */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold tracking-tight text-foreground">
              {value}
            </p>
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-2 mt-1">
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                isPositive && "bg-success/15 text-success",
                isNegative && "bg-destructive/15 text-destructive",
                !isPositive && !isNegative && "bg-muted text-muted-foreground"
              )}>
                {isPositive && <ArrowUp className="w-3 h-3" />}
                {isNegative && <ArrowDown className="w-3 h-3" />}
                <span>{isPositive && '+'}{change}%</span>
              </div>
              {changeLabel && (
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400 }}
          className={cn(
            "p-4 rounded-2xl transition-all duration-300",
            styles.iconBg,
            styles.iconText
          )}
        >
          {icon}
        </motion.div>
            </div>
    </motion.div>
  );
}
