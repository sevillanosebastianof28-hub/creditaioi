import { useState } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Image, Search, Eye, CheckCircle2, AlertCircle, User, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockDocuments = [
  {
    id: '1',
    client: 'John Doe',
    name: 'Drivers_License.jpg',
    type: 'ID Verification',
    uploadDate: '2024-05-20',
    status: 'pending_review',
    size: '1.2 MB',
  },
  {
    id: '2',
    client: 'John Doe',
    name: 'Utility_Bill.pdf',
    type: 'Proof of Address',
    uploadDate: '2024-05-20',
    status: 'verified',
    size: '0.8 MB',
  },
  {
    id: '3',
    client: 'Jane Smith',
    name: 'SSN_Card.jpg',
    type: 'SSN Proof',
    uploadDate: '2024-05-19',
    status: 'pending_review',
    size: '0.5 MB',
  },
  {
    id: '4',
    client: 'Mike Johnson',
    name: 'Credit_Report_May.pdf',
    type: 'Credit Report',
    uploadDate: '2024-05-18',
    status: 'verified',
    size: '2.1 MB',
  },
  {
    id: '5',
    client: 'Sarah Williams',
    name: 'Bank_Statement.pdf',
    type: 'Proof of Address',
    uploadDate: '2024-05-17',
    status: 'rejected',
    size: '1.5 MB',
  },
];

export default function VADocuments() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleVerify = (docId: string) => {
    toast({
      title: 'Document Verified',
      description: 'The document has been verified successfully.',
    });
  };

  const handleReject = (docId: string) => {
    toast({
      title: 'Document Rejected',
      description: 'The document has been rejected. Client will be notified.',
      variant: 'destructive',
    });
  };

  const filteredDocs = mockDocuments.filter(doc => {
    const matchesSearch = doc.client.toLowerCase().includes(search.toLowerCase()) ||
      doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingDocs = mockDocuments.filter(d => d.status === 'pending_review');

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
              <div className="text-2xl font-bold text-success">
                {mockDocuments.filter(d => d.status === 'verified').length}
              </div>
              <p className="text-sm text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-destructive">
                {mockDocuments.filter(d => d.status === 'rejected').length}
              </div>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-info">{mockDocuments.length}</div>
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
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents */}
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
                    {doc.name.endsWith('.pdf') ? (
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
                        <span>{doc.type}</span>
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
                      {doc.status === 'pending_review' && (
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
      </div>
    </RoleBasedLayout>
  );
}
