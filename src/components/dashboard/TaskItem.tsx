import { VATask } from '@/types/credit';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  MessageSquare,
  Brain,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface TaskItemProps {
  task: VATask;
  onComplete?: () => void;
}

export function TaskItem({ task, onComplete }: TaskItemProps) {
  const typeIcons = {
    review_dispute: FileText,
    generate_letters: Brain,
    follow_up: MessageSquare,
    document_request: Upload,
    analysis: Sparkles,
  };

  const priorityColors = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-info/10 text-info',
    high: 'bg-warning/10 text-warning',
    urgent: 'bg-destructive/10 text-destructive',
  };

  const statusColors = {
    pending: 'text-muted-foreground',
    in_progress: 'text-info',
    completed: 'text-success',
    blocked: 'text-destructive',
  };

  const Icon = typeIcons[task.type];

  return (
    <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors">
          <Icon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-semibold text-foreground truncate">{task.title}</h4>
            <Badge variant="outline" className={cn('text-xs', priorityColors[task.priority])}>
              {task.priority}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>

          {task.aiSuggestion && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-accent/50 mb-3">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-accent-foreground">{task.aiSuggestion}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium">{task.clientName}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Due {task.dueDate}
              </span>
            </div>

            {task.status === 'pending' && (
              <Button size="sm" variant="outline" onClick={onComplete} className="h-8">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Complete
              </Button>
            )}

            {task.status === 'in_progress' && (
              <span className={cn('flex items-center gap-1 text-xs', statusColors[task.status])}>
                <AlertCircle className="w-3 h-3" />
                In Progress
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
