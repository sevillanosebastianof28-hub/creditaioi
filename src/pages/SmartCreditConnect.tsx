import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSmartCredit } from '@/hooks/useSmartCredit';
import {
  Link2,
  Shield,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Lock,
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
    initConnection, 
    syncReport, 
    importRawReport,
    disconnect, 
    checkStatus 
  } = useSmartCredit();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refresh status when component mounts
  useEffect(() => {
    if (user) {
      checkStatus();
    }
  }, [user]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await initConnection();
      setEmail('');
      setPassword('');
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleSync = async () => {
    try {
      await syncReport();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

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
  const isPending = connectionStatus.status === 'pending';

  return (
    <RoleBasedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">SmartCredit Connection</h1>
          <p className="text-muted-foreground mt-1">
            Connect your SmartCredit account or import your credit report JSON to sync your 3-bureau credit reports.
          </p>
        </div>

        {/* Connection Status Card */}
        <Card className={cn(
          'card-elevated',
          isConnected ? 'border-success/30 bg-success/5' : 
          isPending ? 'border-warning/30 bg-warning/5' : 
          'border-warning/30 bg-warning/5'
        )}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  isConnected ? 'bg-success/10' : 
                  isPending ? 'bg-warning/10' : 
                  'bg-warning/10'
                )}>
                  {isConnected ? (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  ) : isPending ? (
                    <Loader2 className="w-6 h-6 text-warning animate-spin" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-warning" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {isConnected ? 'Connected' : isPending ? 'Connecting...' : 'Not Connected'}
                  </h3>
                  {connectionStatus.connectedAt && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected: {new Date(connectionStatus.connectedAt).toLocaleDateString()}
                    </p>
                  )}
                  {connectionStatus.lastSyncAt && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last synced: {new Date(connectionStatus.lastSyncAt).toLocaleString()}
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSync}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Sync Now
                  </Button>
                  <Button variant="ghost" onClick={handleDisconnect} disabled={isProcessing}>
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Import JSON Section - Primary Method */}
        {canInitiateConnection && (
          <Card className="card-elevated border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-primary" />
                Import SmartCredit JSON Report
                <Badge className="ml-2 bg-primary/20 text-primary border-0">Recommended</Badge>
              </CardTitle>
              <CardDescription>
                Upload your SmartCredit JSON export file to instantly sync real credit data.
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
                      <p className="text-xs text-muted-foreground">Connected</p>
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

        {/* Connect Form (OAuth Alternative) */}
        {!isConnected && canInitiateConnection && (
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                Connect SmartCredit Account
                <Badge variant="outline" className="ml-2">Alternative</Badge>
              </CardTitle>
              <CardDescription>
                Or connect directly with your SmartCredit credentials for automatic syncing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sc-email">SmartCredit Email</Label>
                  <Input
                    id="sc-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sc-password">SmartCredit Password</Label>
                  <Input
                    id="sc-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Your data is secure</p>
                    <p>We use bank-level encryption and never store your SmartCredit password. 
                    Your credentials are only used to establish a secure connection.</p>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={isProcessing || isPending}
                >
                  {isProcessing || isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Connect Securely
                    </>
                  )}
                </Button>
              </form>

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
        )}

        {/* VA View Only Message */}
        {!canInitiateConnection && (
          <Card className="card-elevated">
            <CardContent className="py-8 text-center">
              <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">View Only Access</h3>
              <p className="text-muted-foreground">
                As a VA, you can view synced credit data but cannot initiate SmartCredit connections.
                Please ask your agency owner or the client to connect their SmartCredit account.
              </p>
            </CardContent>
          </Card>
        )}

        {/* How it Works */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold mb-1">Upload JSON</h4>
                <p className="text-sm text-muted-foreground">
                  Import your SmartCredit JSON export file with all 3 bureaus
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-1">Auto-Parse</h4>
                <p className="text-sm text-muted-foreground">
                  Real credit data is extracted and structured automatically
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-1">View & Dispute</h4>
                <p className="text-sm text-muted-foreground">
                  See your scores, accounts, and disputable items instantly
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
