import { useState, useEffect, useRef } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, Shield, Trash2, Download, CheckCircle2, AlertCircle, Loader2, Sparkles, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  document_type: string;
  size_bytes: number;
  status: string;
  uploaded_at: string;
}

const requiredDocs = [
  { type: 'ID Verification', description: 'Valid government-issued ID', required: true },
  { type: 'Proof of Address', description: 'Utility bill or bank statement', required: true },
  { type: 'SSN Proof', description: 'Social Security card or W2', required: true },
  { type: 'Credit Report', description: 'Latest 3-bureau credit report', required: false },
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function ClientDocuments() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ID Verification');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('client-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save to database
      const { data: docData, error: dbError } = await supabase
        .from('client_documents')
        .insert({
          user_id: user.id,
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          document_type: selectedType,
          size_bytes: file.size,
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: 'Document Uploaded',
        description: 'Your document has been uploaded. Running AI verification...',
      });

      fetchDocuments();

      // Trigger OCR verification for ID documents
      if (selectedType === 'ID Verification' || selectedType === 'SSN Proof') {
        await runOCRVerification(docData.id, filePath, file);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({
        title: 'Upload Failed',
        description: err.message || 'Failed to upload document',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const runOCRVerification = async (docId: string, filePath: string, file: File) => {
    setProcessing(docId);
    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const { data, error } = await supabase.functions.invoke('ocr-document-parser', {
        body: {
          imageBase64: base64,
          mimeType: file.type,
          documentType: selectedType
        }
      });

      if (error) throw error;

      // Update document status based on OCR result
      const isVerified = data?.verified || data?.extractedData;
      await supabase
        .from('client_documents')
        .update({ 
          status: isVerified ? 'verified' : 'pending'
        })
        .eq('id', docId);

      toast({
        title: isVerified ? 'Document Verified' : 'Verification Pending',
        description: isVerified 
          ? 'AI has verified your document successfully.'
          : 'Your document is pending manual review.',
      });

      fetchDocuments();
    } catch (err: any) {
      console.error('OCR error:', err);
      toast({
        title: 'Verification Pending',
        description: 'Automatic verification failed. Document will be reviewed manually.',
        variant: 'default'
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleVerifyDocument = async (doc: Document) => {
    if (processing) return;
    
    setProcessing(doc.id);
    try {
      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('client-documents')
        .download(doc.file_path);

      if (downloadError) throw downloadError;

      // Convert to base64
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const { data, error } = await supabase.functions.invoke('ocr-document-parser', {
        body: {
          imageBase64: base64,
          mimeType: doc.file_type,
          documentType: doc.document_type
        }
      });

      if (error) throw error;

      const isVerified = data?.verified || data?.extractedData;
      await supabase
        .from('client_documents')
        .update({ 
          status: isVerified ? 'verified' : 'pending'
        })
        .eq('id', doc.id);

      toast({
        title: isVerified ? 'Document Verified' : 'Verification Failed',
        description: isVerified 
          ? 'AI has verified your document successfully.'
          : 'Could not verify document. Please upload a clearer image.',
      });

      fetchDocuments();
    } catch (err: any) {
      toast({
        title: 'Verification Error',
        description: err.message || 'Failed to verify document',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!user) return;

    try {
      await supabase.storage
        .from('client-documents')
        .remove([doc.file_path]);

      const { error } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      toast({
        title: 'Document Deleted',
        description: 'The document has been removed.',
      });

      fetchDocuments();
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err.message || 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('client-documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({
        title: 'Download Failed',
        description: err.message || 'Failed to download document',
        variant: 'destructive'
      });
    }
  };

  const verifiedDocs = documents.filter(d => d.status === 'verified');

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Documents</h1>
            <p className="text-muted-foreground mt-1">Upload and manage your verification documents</p>
          </div>
          <div className="flex items-center gap-2">
            <select 
              className="px-3 py-2 border rounded-md bg-background text-foreground"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {requiredDocs.map(doc => (
                <option key={doc.type} value={doc.type}>{doc.type}</option>
              ))}
            </select>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading} 
              className="bg-gradient-primary"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </div>

        {/* Verification Status */}
        <Card className="card-elevated border-success/30 bg-success/5">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Identity Verification</h3>
                <p className="text-sm text-muted-foreground">
                  {verifiedDocs.length} of {requiredDocs.filter(d => d.required).length} required documents verified
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="w-4 h-4" />
                <span>AI-Powered Verification</span>
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
                const uploaded = documents.find(d => d.document_type === doc.type);
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No documents uploaded yet</p>
                <p className="text-sm">Upload your first document to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {doc.file_type.includes('pdf') ? (
                        <FileText className="w-10 h-10 text-primary p-2 bg-primary/10 rounded-lg" />
                      ) : (
                        <Image className="w-10 h-10 text-primary p-2 bg-primary/10 rounded-lg" />
                      )}
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.document_type} • {formatFileSize(doc.size_bytes)} • {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {processing === doc.id ? (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Verifying...
                        </Badge>
                      ) : (
                        <Badge className={doc.status === 'verified' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
                          {doc.status === 'verified' ? 'Verified' : 'Pending'}
                        </Badge>
                      )}
                      {doc.status === 'pending' && !processing && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleVerifyDocument(doc)}
                          title="Run AI Verification"
                        >
                          <Sparkles className="w-4 h-4 text-primary" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(doc)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
