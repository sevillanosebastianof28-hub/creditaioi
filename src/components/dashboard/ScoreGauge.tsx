import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  previousScore?: number;
  bureau: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreGauge({ score, previousScore, bureau, size = 'md' }: ScoreGaugeProps) {
  const change = previousScore ? score - previousScore : 0;
  const percentage = ((score - 300) / (850 - 300)) * 100;

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-success';
    if (score >= 700) return 'text-primary';
    if (score >= 650) return 'text-info';
    if (score >= 600) return 'text-warning';
    return 'text-destructive';
  };

  const getGradient = (score: number) => {
    if (score >= 750) return 'from-success to-success/70';
    if (score >= 700) return 'from-primary to-primary/70';
    if (score >= 650) return 'from-info to-info/70';
    if (score >= 600) return 'from-warning to-warning/70';
    return 'from-destructive to-destructive/70';
  };

  const sizes = {
    sm: { wrapper: 'w-24 h-24', text: 'text-xl', label: 'text-xs' },
    md: { wrapper: 'w-32 h-32', text: 'text-3xl', label: 'text-sm' },
    lg: { wrapper: 'w-40 h-40', text: 'text-4xl', label: 'text-base' },
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('relative', sizes[size].wrapper)}>
        {/* Background Ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.83} 283`}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={cn('stop-color-current', getScoreColor(score))} />
              <stop offset="100%" className={cn('stop-color-current', getScoreColor(score))} style={{ stopOpacity: 0.7 }} />
            </linearGradient>
          </defs>
        </svg>

        {/* Score Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', sizes[size].text, getScoreColor(score))}>
            {score}
          </span>
          {change !== 0 && (
            <span
              className={cn(
                'text-xs font-medium',
                change > 0 ? 'text-success' : 'text-destructive'
              )}
            >
              {change > 0 ? '+' : ''}
              {change}
            </span>
          )}
        </div>
      </div>
      <span className={cn('font-medium text-muted-foreground capitalize', sizes[size].label)}>
        {bureau}
      </span>
    </div>
  );
}
