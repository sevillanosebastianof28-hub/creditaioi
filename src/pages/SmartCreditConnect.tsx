import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSmartCredit } from '@/hooks/useSmartCredit';
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  FileText,
  Clock,
  Upload,
  FileJson,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const bureausAvailable = ['Experian', 'Equifax', 'TransUnion'];

export default function SmartCreditConnect() {
  const { role, user } = useAuth();
  const { toast } = useToast();
  const { 
    isProcessing, 
    connectionStatus, 
    importRawReport,
    disconnect, 
    checkStatus 
  } = useSmartCredit();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refresh status when component mounts
  useEffect(() => {
    if (user) {
      checkStatus();
    }
  }, [user]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.json')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JSON file from SmartCredit.",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // Validate it's a SmartCredit format
      if (!jsonData.personal_info || !jsonData.credit_accounts) {
        toast({
          title: "Invalid Format",
          description: "This doesn't appear to be a valid SmartCredit report. Please ensure it contains personal_info and credit_accounts.",
          variant: "destructive",
        });
        return;
      }

      // Import the raw report
      await importRawReport(jsonData);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error parsing JSON file:', error);
      toast({
        title: "Parse Error",
        description: "Could not parse the JSON file. Please ensure it's valid JSON.",
        variant: "destructive",
      });
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  // VA can only view, not initiate connection
  const canInitiateConnection = role === 'client' || role === 'agency_owner';
  const isConnected = connectionStatus.status === 'connected';

  return (
    <RoleBasedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">SmartCredit Report Import</h1>
          <p className="text-muted-foreground mt-1">
            Upload your SmartCredit JSON report to sync your 3-bureau credit data for analysis and dispute generation.
          </p>
        </div>

        {/* Connection Status Card */}
        <Card className={cn(
          'card-elevated',
          isConnected ? 'border-success/30 bg-success/5' : 
          'border-muted/30 bg-muted/5'
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
                    <FileJson className="w-6 h-6 text-muted-foreground" />
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

        {/* Import JSON Section */}
        {canInitiateConnection && (
          <Card className="card-elevated border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-primary" />
                Upload SmartCredit Report
              </CardTitle>
              <CardDescription>
                Export your credit report from SmartCredit as JSON and upload it here to import your real credit data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div 
                onClick={handleDropZoneClick}
                className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-12 h-12 mx-auto text-primary mb-4 animate-spin" />
                    <p className="text-sm font-medium text-primary">Processing Report...</p>
                  </>
                ) : (
                  <>
                    <FileJson className="w-12 h-12 mx-auto text-primary mb-4" />
                    <p className="text-sm font-medium text-foreground mb-2">
                      Drop your SmartCredit JSON file here
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      or click to browse (report_full_raw.json)
                    </p>
                    <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10" disabled={isProcessing}>
                      <Upload className="w-4 h-4 mr-2" />
                      Select JSON File
                    </Button>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                The JSON file should contain personal_info, summary, and credit_accounts data from SmartCredit
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
                Please ask your agency owner or the client to import their SmartCredit report.
              </p>
            </CardContent>
          </Card>
        )}

        {/* How it Works */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>How to Export from SmartCredit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold mb-1">Log into SmartCredit</h4>
                <p className="text-sm text-muted-foreground">
                  Visit smartcredit.com and sign in to your account
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-1">Export Report</h4>
                <p className="text-sm text-muted-foreground">
                  Download your full credit report as a JSON file
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-1">Upload Here</h4>
                <p className="text-sm text-muted-foreground">
                  Drag and drop or click to upload the JSON file
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">4</span>
                </div>
                <h4 className="font-semibold mb-1">View & Dispute</h4>
                <p className="text-sm text-muted-foreground">
                  See your scores, accounts, and start disputes
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Don't have a SmartCredit account?{' '}
                <a
                  href="https://www.smartcredit.com"
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
