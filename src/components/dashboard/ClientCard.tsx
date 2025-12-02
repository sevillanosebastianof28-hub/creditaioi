import { Client } from '@/types/credit';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, Calendar, FileText } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  const avgScore = Math.round(
    client.currentScores.reduce((acc, s) => acc + s.score, 0) / client.currentScores.length
  );

  const avgPreviousScore = client.currentScores[0]?.previousScore
    ? Math.round(
        client.currentScores.reduce((acc, s) => acc + (s.previousScore || s.score), 0) /
          client.currentScores.length
      )
    : null;

  const scoreChange = avgPreviousScore ? avgScore - avgPreviousScore : 0;

  const statusColors = {
    lead: 'bg-info/10 text-info border-info/20',
    active: 'bg-success/10 text-success border-success/20',
    paused: 'bg-warning/10 text-warning border-warning/20',
    completed: 'bg-primary/10 text-primary border-primary/20',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <div
      onClick={onClick}
      className="card-elevated p-5 cursor-pointer hover:border-primary/40 transition-all duration-300 group"
    >
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12 border-2 border-border group-hover:border-primary/40 transition-colors">
          <AvatarFallback className="bg-secondary text-foreground font-semibold">
            {client.firstName[0]}
            {client.lastName[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {client.firstName} {client.lastName}
            </h3>
            <Badge variant="outline" className={cn('text-xs', statusColors[client.status])}>
              {client.status}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-3">{client.email}</p>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 rounded-md bg-primary/10">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-sm font-semibold">
                  {avgScore}
                  {scoreChange > 0 && (
                    <span className="text-success text-xs ml-1">+{scoreChange}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="p-1.5 rounded-md bg-success/10">
                <FileText className="w-3.5 h-3.5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Deleted</p>
                <p className="text-sm font-semibold">
                  {client.itemsDeleted}/{client.totalItemsDisputed}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="p-1.5 rounded-md bg-info/10">
                <Calendar className="w-3.5 h-3.5 text-info" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Round</p>
                <p className="text-sm font-semibold">{client.currentRound}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
