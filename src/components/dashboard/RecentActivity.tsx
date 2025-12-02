import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  Mail, 
  Upload, 
  TrendingUp, 
  DollarSign,
  AlertTriangle
} from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'deletion',
    title: 'Item Deleted',
    description: 'Medical collection removed from Jennifer Williams',
    time: '2 minutes ago',
    icon: CheckCircle,
    color: 'text-success bg-success/10',
  },
  {
    id: 2,
    type: 'letter',
    title: 'Letters Sent',
    description: 'Round 3 disputes sent for Marcus Johnson',
    time: '15 minutes ago',
    icon: Mail,
    color: 'text-info bg-info/10',
  },
  {
    id: 3,
    type: 'upload',
    title: 'Report Uploaded',
    description: 'New credit report from Ashley Thompson',
    time: '1 hour ago',
    icon: Upload,
    color: 'text-primary bg-primary/10',
  },
  {
    id: 4,
    type: 'score',
    title: 'Score Increase',
    description: 'David Martinez +33 points on Equifax',
    time: '2 hours ago',
    icon: TrendingUp,
    color: 'text-success bg-success/10',
  },
  {
    id: 5,
    type: 'payment',
    title: 'Payment Received',
    description: '$199.00 from David Martinez',
    time: '3 hours ago',
    icon: DollarSign,
    color: 'text-primary bg-primary/10',
  },
  {
    id: 6,
    type: 'alert',
    title: 'Response Required',
    description: 'Equifax needs additional verification',
    time: '4 hours ago',
    icon: AlertTriangle,
    color: 'text-warning bg-warning/10',
  },
];

export function RecentActivity() {
  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className={cn(
            'flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer',
            'animate-slide-up'
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className={cn('p-2 rounded-lg', activity.color)}>
            <activity.icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{activity.title}</p>
            <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
        </div>
      ))}
    </div>
  );
}
