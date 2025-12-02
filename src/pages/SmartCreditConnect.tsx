import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock connection status
const mockConnectionStatus = {
  connected: false,
  lastSync: null as string | null,
  bureausAvailable: ['Experian', 'Equifax', 'TransUnion'],
};

export default function SmartCreditConnect() {
  const { role } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(mockConnectionStatus);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnectionStatus({
      connected: true,
      lastSync: new Date().toISOString(),
      bureausAvailable: ['Experian', 'Equifax', 'TransUnion'],
    });
    
    toast({
      title: 'SmartCredit Connected!',
      description: 'Your credit reports are now syncing. This may take a few minutes.',
    });
    
    setIsConnecting(false);
    setEmail('');
    setPassword('');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setConnectionStatus(prev => ({
      ...prev,
      lastSync: new Date().toISOString(),
    }));
    
    toast({
      title: 'Sync Complete',
      description: 'Your credit reports have been updated.',
    });
    
    setIsSyncing(false);
  };

  const handleDisconnect = () => {
    setConnectionStatus({
      connected: false,
      lastSync: null,
      bureausAvailable: [],
    });
    
    toast({
      title: 'Disconnected',
      description: 'SmartCredit has been disconnected from your account.',
    });
  };

  // VA can only view, not initiate connection
  const canInitiateConnection = role === 'client' || role === 'agency_owner';

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
          connectionStatus.connected ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'
        )}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  connectionStatus.connected ? 'bg-success/10' : 'bg-warning/10'
                )}>
                  {connectionStatus.connected ? (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-warning" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {connectionStatus.connected ? 'Connected' : 'Not Connected'}
                  </h3>
                  {connectionStatus.lastSync && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last synced: {new Date(connectionStatus.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              {connectionStatus.connected && canInitiateConnection && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSync}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Sync Now
                  </Button>
                  <Button variant="ghost" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Connect Form or Status */}
        {!connectionStatus.connected ? (
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
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
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
            {connectionStatus.bureausAvailable.map((bureau) => (
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
