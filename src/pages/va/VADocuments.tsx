import { useState } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Image, Search, Eye, CheckCircle2, AlertCircle, User, Download, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function VADocuments() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch documents for VA's assigned clients
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['va-documents', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get VA assignments
      const { data: assignments } = await supabase
        .from('va_assignments')
        .select('client_user_id')
        .eq('va_user_id', user.id);

      if (!assignments?.length) return [];

      const clientIds = assignments.map(a => a.client_user_id);

      // Get client profiles for names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', clientIds);

      // Get documents
      const { data: docs } = await supabase
        .from('client_documents')
        .select('*')
        .in('user_id', clientIds)
        .order('uploaded_at', { ascending: false });

      return (docs || []).map(doc => {
        const profile = profiles?.find(p => p.user_id === doc.user_id);
        return {
          ...doc,
          client: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown',
          size: `${(doc.size_bytes / 1024 / 1024).toFixed(1)} MB`
        };
      });
    },
    enabled: !!user
  });

  const handleVerify = async (docId: string) => {
    const { error } = await supabase
      .from('client_documents')
      .update({ status: 'verified', verified_at: new Date().toISOString() })
      .eq('id', docId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to verify document', variant: 'destructive' });
    } else {
      toast({ title: 'Document Verified', description: 'The document has been verified successfully.' });
      queryClient.invalidateQueries({ queryKey: ['va-documents'] });
    }
  };

  const handleReject = async (docId: string) => {
    const { error } = await supabase
      .from('client_documents')
      .update({ status: 'rejected' })
      .eq('id', docId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to reject document', variant: 'destructive' });
    } else {
      toast({ title: 'Document Rejected', description: 'The document has been rejected. Client will be notified.', variant: 'destructive' });
      queryClient.invalidateQueries({ queryKey: ['va-documents'] });
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.client.toLowerCase().includes(search.toLowerCase()) ||
      doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingDocs = documents.filter(d => d.status === 'pending' || d.status === 'pending_review');
  const verifiedDocs = documents.filter(d => d.status === 'verified');
  const rejectedDocs = documents.filter(d => d.status === 'rejected');

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Documents</h1>
          <p className="text-muted-foreground mt-1">Review and verify client uploaded documents</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-warning">{pendingDocs.length}</div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">{verifiedDocs.length}</div>
              <p className="text-sm text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-destructive">{rejectedDocs.length}</div>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-info">{documents.length}</div>
              <p className="text-sm text-muted-foreground">Total Documents</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by client or document name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* No documents state */}
        {documents.length === 0 && (
          <Card className="p-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Documents Yet</h3>
            <p className="text-muted-foreground">
              Documents will appear here when clients upload them.
            </p>
          </Card>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {doc.file_type?.includes('pdf') ? (
                        <FileText className="w-10 h-10 text-primary p-2 bg-primary/10 rounded-lg" />
                      ) : (
                        <Image className="w-10 h-10 text-primary p-2 bg-primary/10 rounded-lg" />
                      )}
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{doc.client}</span>
                          <span>•</span>
                          <span>{doc.document_type}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        doc.status === 'verified' ? 'bg-success/10 text-success border-success/20' :
                        doc.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        'bg-warning/10 text-warning border-warning/20'
                      }>
                        {doc.status === 'verified' ? 'Verified' : 
                         doc.status === 'rejected' ? 'Rejected' : 'Pending'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                        {(doc.status === 'pending' || doc.status === 'pending_review') && (
                          <>
                            <Button size="sm" variant="ghost" className="text-success" onClick={() => handleVerify(doc.id)}>
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleReject(doc.id)}>
                              <AlertCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleBasedLayout>
  );
}
