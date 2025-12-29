import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSmartCredit } from '@/hooks/useSmartCredit';
import { supabase } from '@/integrations/supabase/client';
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  FileText,
  Clock,
  Upload,
  FileImage,
  FileUp,
  Shield,
  CreditCard,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type CreditProvider = 'smartcredit' | 'identityiq' | 'privacyguard' | 'creditkarma';

interface ProviderInfo {
  id: CreditProvider;
  name: string;
  description: string;
  website: string;
  acceptedFormats: string[];
  icon: React.ReactNode;
  color: string;
}

const providers: ProviderInfo[] = [
  {
    id: 'smartcredit',
    name: 'SmartCredit',
    description: '3-bureau credit monitoring with daily updates',
    website: 'https://www.smartcredit.com',
    acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
    icon: <Shield className="w-5 h-5" />,
    color: 'text-blue-500',
  },
  {
    id: 'identityiq',
    name: 'IdentityIQ',
    description: 'Credit monitoring with identity protection',
    website: 'https://www.identityiq.com',
    acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
    icon: <Eye className="w-5 h-5" />,
    color: 'text-purple-500',
  },
  {
    id: 'privacyguard',
    name: 'PrivacyGuard',
    description: 'Credit reports with privacy monitoring',
    website: 'https://www.privacyguard.com',
    acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
    icon: <Shield className="w-5 h-5" />,
    color: 'text-green-500',
  },
  {
    id: 'creditkarma',
    name: 'Credit Karma',
    description: 'Free credit scores and reports',
    website: 'https://www.creditkarma.com',
    acceptedFormats: ['.png', '.jpg', '.jpeg'],
    icon: <CreditCard className="w-5 h-5" />,
    color: 'text-emerald-500',
  },
];

const bureausAvailable = ['Experian', 'Equifax', 'TransUnion'];

export default function SmartCreditConnect() {
  const { role, user } = useAuth();
  const { toast } = useToast();
  const { 
    isProcessing: isSmartCreditProcessing, 
    connectionStatus, 
    disconnect, 
    checkStatus 
  } = useSmartCredit();
  
  const [selectedProvider, setSelectedProvider] = useState<CreditProvider>('smartcredit');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentProvider = providers.find(p => p.id === selectedProvider)!;

  useEffect(() => {
    if (user) {
      checkStatus();
    }
  }, [user]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!currentProvider.acceptedFormats.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: `Please upload one of: ${currentProvider.acceptedFormats.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress('Uploading file...');

    try {
      // Upload file to storage
      const fileName = `${user.id}/${selectedProvider}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('credit-reports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setUploadProgress('Analyzing report with AI...');

      // Call the OCR edge function to parse the report
      const { data: parseResult, error: parseError } = await supabase.functions.invoke('ocr-document-parser', {
        body: {
          filePath: fileName,
          provider: selectedProvider,
          userId: user.id,
        }
      });

      if (parseError) throw parseError;

      setUploadProgress('Saving analysis results...');

      // Store the analysis result
      const { error: saveError } = await supabase
        .from('credit_report_analyses')
        .upsert({
          user_id: user.id,
          file_path: fileName,
          raw_text: parseResult.rawText,
          analysis_result: parseResult.analysis,
          summary: parseResult.summary,
          disputable_items: parseResult.disputableItems,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (saveError) throw saveError;

      toast({
        title: "Report Imported Successfully",
        description: `Your ${currentProvider.name} report has been analyzed and imported.`,
      });

      // Refresh status
      checkStatus();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error processing report:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Could not process the credit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      fileInputRef.current.files = dataTransfer.files;
      handleFileUpload({ target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const canInitiateConnection = role === 'client' || role === 'agency_owner';
  const isConnected = connectionStatus.status === 'connected';
  const isProcessing = isUploading || isSmartCreditProcessing;

  return (
    <RoleBasedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Credit Report Import</h1>
          <p className="text-muted-foreground mt-1">
            Upload your credit report from any supported provider. Our AI will analyze and extract all data for dispute generation.
          </p>
        </div>

        {/* Provider Selection */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Select Your Credit Monitoring Provider</CardTitle>
            <CardDescription>
              Choose where you get your credit reports from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedProvider} onValueChange={(v) => setSelectedProvider(v as CreditProvider)}>
              <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto gap-2 bg-transparent p-0">
                {providers.map((provider) => (
                  <TabsTrigger
                    key={provider.id}
                    value={provider.id}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 h-auto border rounded-lg data-[state=active]:border-primary data-[state=active]:bg-primary/5",
                      "hover:bg-muted/50 transition-colors"
                    )}
                  >
                    <span className={provider.color}>{provider.icon}</span>
                    <span className="text-sm font-medium">{provider.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Connection Status Card */}
        <Card className={cn(
          'card-elevated',
          isConnected ? 'border-success/30 bg-success/5' : 'border-muted/30 bg-muted/5'
        )}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  isConnected ? 'bg-success/10' : 'bg-muted/10'
                )}>
                  {isConnected ? (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  ) : (
                    <FileUp className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {isConnected ? 'Report Imported' : 'No Report Uploaded'}
                  </h3>
                  {connectionStatus.connectedAt && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Imported: {new Date(connectionStatus.connectedAt).toLocaleDateString()}
                    </p>
                  )}
                  {connectionStatus.lastSyncAt && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last updated: {new Date(connectionStatus.lastSyncAt).toLocaleString()}
                    </p>
                  )}
                  {connectionStatus.hasReport && (
                    <Badge variant="outline" className="mt-1 bg-success/10 text-success border-success/20">
                      <FileText className="w-3 h-3 mr-1" />
                      Report Data Available
                    </Badge>
                  )}
                </div>
              </div>
              {isConnected && canInitiateConnection && (
                <Button variant="ghost" onClick={handleDisconnect} disabled={isProcessing}>
                  Clear Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        {canInitiateConnection && (
          <Card className="card-elevated border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={currentProvider.color}>{currentProvider.icon}</span>
                Upload {currentProvider.name} Report
              </CardTitle>
              <CardDescription>
                {currentProvider.id === 'creditkarma' 
                  ? 'Take screenshots of your Credit Karma dashboard and upload them for AI analysis.'
                  : `Download your credit report from ${currentProvider.name} and upload it here. Our AI will extract all the data.`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept={currentProvider.acceptedFormats.join(',')}
                className="hidden"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
              <div 
                onClick={!isProcessing ? handleDropZoneClick : undefined}
                onDragOver={handleDragOver}
                onDrop={!isProcessing ? handleDrop : undefined}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  isProcessing 
                    ? "border-primary/50 bg-primary/5 cursor-wait" 
                    : "border-primary/30 cursor-pointer hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-12 h-12 mx-auto text-primary mb-4 animate-spin" />
                    <p className="text-sm font-medium text-primary">{uploadProgress || 'Processing...'}</p>
                  </>
                ) : (
                  <>
                    <FileImage className="w-12 h-12 mx-auto text-primary mb-4" />
                    <p className="text-sm font-medium text-foreground mb-2">
                      Drop your {currentProvider.name} report here
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Accepted formats: {currentProvider.acceptedFormats.join(', ')}
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Select File
                    </Button>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Maximum file size: 10MB. Your data is encrypted and secure.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Connected Bureaus */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bureausAvailable.map((bureau) => (
              <Card key={bureau} className="card-elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{bureau}</h4>
                      <p className="text-xs text-muted-foreground">Data Imported</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-full justify-center bg-success/10 text-success border-success/20">
                    <FileText className="w-3 h-3 mr-1" />
                    Report Available
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* VA View Only Message */}
        {!canInitiateConnection && (
          <Card className="card-elevated">
            <CardContent className="py-8 text-center">
              <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">View Only Access</h3>
              <p className="text-muted-foreground">
                As a VA, you can view imported credit data but cannot upload reports.
                Please ask your agency owner or the client to import their credit report.
              </p>
            </CardContent>
          </Card>
        )}

        {/* How it Works */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>How to Export from {currentProvider.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold mb-1">Log In</h4>
                <p className="text-sm text-muted-foreground">
                  Visit {currentProvider.website.replace('https://', '')} and sign in
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-1">
                  {currentProvider.id === 'creditkarma' ? 'Screenshot' : 'Download Report'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {currentProvider.id === 'creditkarma' 
                    ? 'Take screenshots of your full credit report'
                    : 'Download or print your full credit report as PDF'
                  }
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-1">Upload Here</h4>
                <p className="text-sm text-muted-foreground">
                  Drag and drop or click to upload the file
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">4</span>
                </div>
                <h4 className="font-semibold mb-1">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI extracts data and identifies disputes
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Don't have a {currentProvider.name} account?{' '}
                <a
                  href={currentProvider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Sign up here <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
