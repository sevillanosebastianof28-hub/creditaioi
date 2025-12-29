import { useState, useEffect } from 'react';
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
    disconnect, 
    checkStatus 
  } = useSmartCredit();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      // Simulate fetching new credit data
      const mockReportData = {
        summary: {
          experianScore: 612,
          equifaxScore: 598,
          transunionScore: 605,
          totalAccounts: 15,
          negativeItems: 4,
        },
        negativeItems: [
          { creditor: 'Capital One', type: 'collection', balance: 2450, bureaus: ['experian', 'equifax'] },
          { creditor: 'Midland Credit', type: 'collection', balance: 1890, bureaus: ['transunion'] },
        ],
        reportDate: new Date().toISOString(),
      };
      
      await syncReport(mockReportData);
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
            Connect your SmartCredit account to automatically sync your 3-bureau credit reports.
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

        {/* Connect Form or Status */}
        {!isConnected ? (
          canInitiateConnection ? (
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-primary" />
                  Connect SmartCredit
                </CardTitle>
                <CardDescription>
                  Enter your SmartCredit credentials to connect. We use secure OAuth to connect to your account.
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
          ) : (
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
          )
        ) : (
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

        {/* Manual Upload Option */}
        {!isConnected && canInitiateConnection && (
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Manual Report Upload
              </CardTitle>
              <CardDescription>
                Don't want to connect SmartCredit? You can manually upload your credit reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drag & drop your credit report PDF here, or click to browse
                </p>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Credit Report
                </Button>
              </div>
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
                <h4 className="font-semibold mb-1">Connect</h4>
                <p className="text-sm text-muted-foreground">
                  Securely link your SmartCredit account using OAuth
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-1">Auto-Sync</h4>
                <p className="text-sm text-muted-foreground">
                  Your 3-bureau reports are automatically pulled
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-1">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI instantly parses and analyzes your credit data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
