import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

interface AIStatusIndicatorProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  progress?: number;
}

export function AIStatusIndicator({ status, message, progress }: AIStatusIndicatorProps) {
  if (status === 'idle') return null;

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-primary/10 border-primary/20 text-primary';
      case 'success':
        return 'bg-success/10 border-success/20 text-success';
      case 'error':
        return 'bg-destructive/10 border-destructive/20 text-destructive';
      default:
        return 'bg-muted border-muted-foreground/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${getColor()}`}
    >
      {getIcon()}
      <span>{message}</span>
      {progress !== undefined && status === 'loading' && (
        <div className="ml-2 w-24 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </motion.div>
  );
}
