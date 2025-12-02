import { useState } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Eye, MessageSquare, FileText, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockClients = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@email.com',
    score: { current: 645, change: +15 },
    status: 'active',
    disputes: { active: 3, completed: 5 },
    lastActivity: '2024-05-20',
    round: 2,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@email.com',
    score: { current: 580, change: +22 },
    status: 'active',
    disputes: { active: 5, completed: 2 },
    lastActivity: '2024-05-19',
    round: 1,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@email.com',
    score: { current: 710, change: +8 },
    status: 'pending_docs',
    disputes: { active: 1, completed: 12 },
    lastActivity: '2024-05-18',
    round: 4,
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah@email.com',
    score: { current: 620, change: -5 },
    status: 'active',
    disputes: { active: 4, completed: 3 },
    lastActivity: '2024-05-20',
    round: 2,
  },
];

export default function VAClients() {
  const [search, setSearch] = useState('');

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Clients</h1>
            <p className="text-muted-foreground mt-1">Manage your assigned clients</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {mockClients.length} Assigned
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
                      <div className="flex items-center gap-2 mt-1">
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
                      <p className="text-2xl font-bold">{client.score.current}</p>
                      <p className={`text-xs ${client.score.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {client.score.change >= 0 ? '+' : ''}{client.score.change} pts
                      </p>
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
