import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  UserPlus,
  Users,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useVAAssignments } from '@/hooks/useVAAssignments';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
const Clients = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedVA, setSelectedVA] = useState<string>('');
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { assignments, vaStaff, assignVAToClient, removeAssignment, isLoading: loadingAssignments } = useVAAssignments();

  // Fetch clients from profiles table
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get clients with 'client' role in the same agency
      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.agency_id) return [];

      // Get all profiles in agency
      const { data: agencyProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('agency_id', profile.agency_id);

      // Get client roles
      const { data: clientRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client');

      const clientUserIds = new Set(clientRoles?.map(r => r.user_id));
      const clientProfiles = (agencyProfiles || []).filter(p => clientUserIds.has(p.user_id));

      // Get score history for each client
      const clientIds = clientProfiles.map(c => c.user_id);
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

      // Enrich clients with scores and disputes
      return clientProfiles.map(client => {
        const latestScore = scores?.find(s => s.user_id === client.user_id);
        const clientDisputes = disputes?.filter(d => d.client_id === client.user_id) || [];
        const deletedCount = clientDisputes.filter(d => d.outcome === 'deleted').length;
        const assignment = assignments.find(a => a.client_user_id === client.user_id);

        return {
          ...client,
          currentScore: latestScore ? Math.round(((latestScore.experian || 0) + (latestScore.equifax || 0) + (latestScore.transunion || 0)) / 3) : null,
          totalDisputes: clientDisputes.length,
          deletedItems: deletedCount,
          assignedVA: assignment?.va_profile ? `${assignment.va_profile.first_name} ${assignment.va_profile.last_name}` : null,
          assignmentId: assignment?.id,
          status: clientDisputes.length > 0 ? 'active' : 'lead'
        };
      });
    },
    enabled: !!user && role === 'agency_owner'
  });

  const filteredClients = clients.filter((client: any) => {
    const matchesSearch =
      `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase().includes(search.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    lead: 'bg-info/10 text-info border-info/20',
    active: 'bg-success/10 text-success border-success/20',
    paused: 'bg-warning/10 text-warning border-warning/20',
    completed: 'bg-primary/10 text-primary border-primary/20',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const handleAssignVA = async () => {
    if (!selectedClient || !selectedVA) return;
    
    const result = await assignVAToClient(selectedVA, selectedClient.user_id);
    if (result) {
      toast.success('VA assigned successfully');
      setAssignDialogOpen(false);
      setSelectedClient(null);
      setSelectedVA('');
    } else {
      toast.error('Failed to assign VA');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    await removeAssignment(assignmentId);
    toast.success('Assignment removed');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clients</h1>
            <p className="text-muted-foreground mt-1">
              Manage your credit repair clients and their progress.
            </p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </Card>

        {/* Clients Table */}
        <Card>
          {isLoading || loadingAssignments ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No clients found</p>
              <p className="text-sm">Add your first client to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Current Score</TableHead>
                  <TableHead className="text-center">Progress</TableHead>
                  <TableHead>Assigned VA</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client: any) => (
                  <TableRow
                    key={client.user_id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/clients/${client.user_id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-secondary text-foreground font-semibold text-sm">
                            {(client.first_name?.[0] || '?')}
                            {(client.last_name?.[0] || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {client.first_name || 'Unknown'} {client.last_name || ''}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {client.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('capitalize', statusColors[client.status] || statusColors.lead)}
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-semibold">{client.currentScore || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">
                        {client.deletedItems}/{client.totalDisputes} deleted
                      </span>
                    </TableCell>
                    <TableCell>
                      {client.assignedVA ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{client.assignedVA}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAssignment(client.assignmentId);
                            }}
                            className="h-6 text-xs text-destructive hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                            setAssignDialogOpen(true);
                          }}
                          className="h-7"
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Assign VA
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/clients/${client.user_id}`)}>
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>Generate Letters</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem>Edit Client</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Assign VA Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign VA to Client</DialogTitle>
              <DialogDescription>
                Select a VA to assign to {selectedClient?.first_name} {selectedClient?.last_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select value={selectedVA} onValueChange={setSelectedVA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a VA" />
                </SelectTrigger>
                <SelectContent>
                  {vaStaff.map((va) => (
                    <SelectItem key={va.user_id} value={va.user_id}>
                      {va.first_name} {va.last_name} ({va.assignedClients} clients)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignVA} disabled={!selectedVA} className="bg-gradient-primary">
                  Assign VA
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
