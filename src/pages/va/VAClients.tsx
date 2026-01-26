import { useState } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Eye, MessageSquare, FileText, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function VAClients() {
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  // Fetch assigned clients for this VA
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['va-clients', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get VA assignments for this VA
      const { data: assignments } = await supabase
        .from('va_assignments')
        .select('client_user_id')
        .eq('va_user_id', user.id);

      if (!assignments?.length) return [];

      const clientIds = assignments.map(a => a.client_user_id);

      // Get client profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', clientIds);

      // Get score history
      const { data: scores } = await supabase
        .from('score_history')
        .select('*')
        .in('user_id', clientIds)
        .order('recorded_at', { ascending: false });

      // Get dispute counts
      const { data: disputes } = await supabase
        .from('dispute_items')
        .select('client_id, outcome')
        .in('client_id', clientIds);

      // Get rounds
      const { data: rounds } = await supabase
        .from('dispute_rounds')
        .select('client_id, round_number')
        .in('client_id', clientIds)
        .order('round_number', { ascending: false });

      return (profiles || []).map(client => {
        const latestScore = scores?.find(s => s.user_id === client.user_id);
        const clientDisputes = disputes?.filter(d => d.client_id === client.user_id) || [];
        const activeDisputes = clientDisputes.filter(d => ['pending', 'in_progress'].includes(d.outcome)).length;
        const completedDisputes = clientDisputes.filter(d => ['deleted', 'verified', 'updated'].includes(d.outcome)).length;
        const latestRound = rounds?.find(r => r.client_id === client.user_id);
        const avgScore = latestScore ? Math.round(((latestScore.experian || 0) + (latestScore.equifax || 0) + (latestScore.transunion || 0)) / 3) : null;

        return {
          id: client.user_id,
          name: `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unknown',
          email: client.email || '',
          score: { current: avgScore || 0, change: 0 },
          status: activeDisputes > 0 ? 'active' : 'pending_docs',
          disputes: { active: activeDisputes, completed: completedDisputes },
          lastActivity: client.updated_at,
          round: latestRound?.round_number || 1,
        };
      });
    },
    enabled: !!user
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Clients</h1>
            <p className="text-muted-foreground mt-1">Manage your assigned clients</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {clients.length} Assigned
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* No clients state */}
        {clients.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Clients Assigned</h3>
            <p className="text-muted-foreground">
              You don't have any clients assigned yet. Contact your agency owner for assignments.
            </p>
          </Card>
        )}

        {/* Clients List */}
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="card-elevated hover:border-primary/30 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{client.name}</h3>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant={client.status === 'active' ? 'default' : 'outline'}>
                          {client.status === 'active' ? 'Active' : 'Pending Docs'}
                        </Badge>
                        <Badge variant="secondary">Round {client.round}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Score */}
                    <div className="text-center">
                      <p className="text-2xl font-bold">{client.score.current || '—'}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>

                    {/* Disputes */}
                    <div className="text-center">
                      <p className="text-lg font-semibold">{client.disputes.active}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>

                    {/* Last Activity */}
                    <div className="text-center hidden md:block">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(client.lastActivity).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Last Activity</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/va-dashboard/clients/${client.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </RoleBasedLayout>
  );
}
