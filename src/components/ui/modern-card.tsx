import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'glass' | 'glow';
  hover?: boolean;
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant = 'default', hover = true, ...props }, ref) => {
    const variants = {
      default: "bg-card border border-border/50",
      gradient: "bg-gradient-to-br from-card via-card to-muted/30 border border-border/50",
      glass: "bg-card/60 backdrop-blur-xl border border-border/30",
      glow: "bg-card border border-primary/20 shadow-lg shadow-primary/5",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl text-card-foreground transition-all duration-300",
          variants[variant],
          hover && "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-0.5",
          className
        )}
        {...props}
      />
    );
  }
);
ModernCard.displayName = "ModernCard";

interface ModernCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  badge?: React.ReactNode;
}

const ModernCardHeader = React.forwardRef<HTMLDivElement, ModernCardHeaderProps>(
  ({ className, icon: Icon, iconColor = "text-primary", iconBgColor = "bg-primary/10", badge, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn("p-2.5 rounded-xl", iconBgColor)}>
              <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
          )}
          <div>{children}</div>
        </div>
        {badge}
      </div>
    </div>
  )
);
ModernCardHeader.displayName = "ModernCardHeader";

const ModernCardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
ModernCardTitle.displayName = "ModernCardTitle";

const ModernCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground mt-1", className)} {...props} />
  )
);
ModernCardDescription.displayName = "ModernCardDescription";

const ModernCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
ModernCardContent.displayName = "ModernCardContent";

const ModernCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
ModernCardFooter.displayName = "ModernCardFooter";

// Animated Stats Card
interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  color?: 'primary' | 'success' | 'warning' | 'info' | 'destructive';
}

const colorMap = {
  primary: {
    gradient: 'from-primary/20 to-primary/5',
    text: 'text-primary',
    border: 'border-primary/20',
    bg: 'bg-primary/10',
  },
  success: {
    gradient: 'from-success/20 to-success/5',
    text: 'text-success',
    border: 'border-success/20',
    bg: 'bg-success/10',
  },
  warning: {
    gradient: 'from-warning/20 to-warning/5',
    text: 'text-warning',
    border: 'border-warning/20',
    bg: 'bg-warning/10',
  },
  info: {
    gradient: 'from-info/20 to-info/5',
    text: 'text-info',
    border: 'border-info/20',
    bg: 'bg-info/10',
  },
  destructive: {
    gradient: 'from-destructive/20 to-destructive/5',
    text: 'text-destructive',
    border: 'border-destructive/20',
    bg: 'bg-destructive/10',
  },
};

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ label, value, icon: Icon, trend, color = 'primary', className, ...props }, ref) => {
    const colors = colorMap[color];
    
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300",
          colors.border,
          "hover:shadow-lg hover:shadow-primary/5",
          className
        )}
        {...(props as any)}
      >
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", colors.gradient)} />
        <div className="relative flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <div className="flex items-baseline gap-2">
              <p className={cn("text-3xl font-bold", colors.text)}>{value}</p>
              {trend && (
                <span className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded-full",
                  trend.isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className={cn("p-3 rounded-xl", colors.bg)}>
            <Icon className={cn("w-6 h-6", colors.text)} />
          </div>
        </div>
      </motion.div>
    );
  }
);
StatsCard.displayName = "StatsCard";

// Feature Card with Icon
interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'destructive';
  action?: React.ReactNode;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ title, description, icon: Icon, color = 'primary', action, className, ...props }, ref) => {
    const colors = colorMap[color];
    
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30",
          className
        )}
        {...(props as any)}
      >
        <div className="flex items-start gap-4">
          <div className={cn("p-2.5 rounded-xl shrink-0", colors.bg)}>
            <Icon className={cn("w-5 h-5", colors.text)} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          </div>
          {action}
        </div>
      </motion.div>
    );
  }
);
FeatureCard.displayName = "FeatureCard";

export {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardDescription,
  ModernCardContent,
  ModernCardFooter,
  StatsCard,
  FeatureCard,
};
