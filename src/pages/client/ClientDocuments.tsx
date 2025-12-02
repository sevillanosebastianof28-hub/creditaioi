import { useState } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, Shield, Trash2, Download, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockDocuments = [
  { id: '1', name: 'Drivers_License.jpg', type: 'ID Verification', uploadDate: '2024-05-01', status: 'verified', size: '1.2 MB' },
  { id: '2', name: 'Utility_Bill.pdf', type: 'Proof of Address', uploadDate: '2024-05-01', status: 'verified', size: '0.8 MB' },
  { id: '3', name: 'SSN_Card.jpg', type: 'SSN Proof', uploadDate: '2024-05-02', status: 'verified', size: '0.5 MB' },
  { id: '4', name: 'Credit_Report_May.pdf', type: 'Credit Report', uploadDate: '2024-05-15', status: 'pending', size: '2.1 MB' },
];

const requiredDocs = [
  { type: 'ID Verification', description: 'Valid government-issued ID', required: true },
  { type: 'Proof of Address', description: 'Utility bill or bank statement', required: true },
  { type: 'SSN Proof', description: 'Social Security card or W2', required: true },
  { type: 'Credit Report', description: 'Latest 3-bureau credit report', required: false },
];

export default function ClientDocuments() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      toast({
        title: 'Document Uploaded',
        description: 'Your document has been uploaded and is pending review.',
      });
    }, 1500);
  };

  const verifiedDocs = mockDocuments.filter(d => d.status === 'verified');

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Documents</h1>
            <p className="text-muted-foreground mt-1">Upload and manage your verification documents</p>
          </div>
          <Button onClick={handleUpload} disabled={uploading} className="bg-gradient-primary">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>

        {/* Verification Status */}
        <Card className="card-elevated border-success/30 bg-success/5">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Identity Verified</h3>
                <p className="text-sm text-muted-foreground">
                  {verifiedDocs.length} of {requiredDocs.filter(d => d.required).length} required documents verified
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Documents Checklist */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requiredDocs.map((doc) => {
                const uploaded = mockDocuments.find(d => d.type === doc.type);
                const isVerified = uploaded?.status === 'verified';
                return (
                  <div key={doc.type} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      {isVerified ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : uploaded ? (
                        <AlertCircle className="w-5 h-5 text-warning" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">{doc.type}</p>
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.required && <Badge variant="outline">Required</Badge>}
                      {isVerified && <Badge className="bg-success/10 text-success border-success/20">Verified</Badge>}
                      {uploaded && !isVerified && <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Documents */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    {doc.name.endsWith('.pdf') ? (
                      <FileText className="w-10 h-10 text-primary p-2 bg-primary/10 rounded-lg" />
                    ) : (
                      <Image className="w-10 h-10 text-primary p-2 bg-primary/10 rounded-lg" />
                    )}
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">{doc.type} • {doc.size} • {new Date(doc.uploadDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={doc.status === 'verified' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
                      {doc.status === 'verified' ? 'Verified' : 'Pending'}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
