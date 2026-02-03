import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface DNSStatusProps {
  subdomain: string;
}

export function DNSStatus({ subdomain }: DNSStatusProps) {
  const [status, setStatus] = useState<'checking' | 'configured' | 'not-configured'>('checking');
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    const checkDNSConfiguration = async () => {
      // Skip check for localhost
      if (window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1') {
        setIsLocalhost(true);
        setStatus('not-configured');
        return;
      }

      try {
        // Try to fetch the subdomain URL
        const testUrl = `https://credit-ai.online?subdomain=${subdomain}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(testUrl, {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok || response.status === 404) {
          // DNS is configured (we got a response, even if 404)
          setStatus('configured');
        } else {
          setStatus('not-configured');
        }
      } catch (error) {
        // Network error likely means DNS not configured
        setStatus('not-configured');
      }
    };

    if (subdomain) {
      checkDNSConfiguration();
    }
  }, [subdomain]);

  if (isLocalhost) {
    return (
      <Alert>
        <AlertDescription className="flex items-center gap-2">
          <Badge variant="secondary">Development Mode</Badge>
          <span className="text-sm">
            DNS configuration is only needed for production deployment
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'checking') {
    return (
      <Alert>
        <Loader2 className="w-4 h-4 animate-spin" />
        <AlertDescription>
          Checking DNS configuration...
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'configured') {
    return (
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <div className="space-y-1">
            <div className="font-medium">DNS is properly configured! ✅</div>
            <div className="text-sm">
              Your white-label portal is accessible at: <code className="bg-green-100 dark:bg-green-900 px-1 rounded">https://credit-ai.online?subdomain={subdomain}</code>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <XCircle className="w-4 h-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
        <div className="space-y-2">
          <div className="font-medium">DNS not yet configured for production</div>
          <div className="text-sm space-y-1">
            <div>✅ You can still preview your portal using the "Preview Portal Now" button above</div>
            <div>✅ Production URL: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">https://credit-ai.online?subdomain={subdomain}</code></div>
            <div className="text-xs text-muted-foreground mt-2">
              Note: DNS setup is a one-time configuration by the platform administrator. Once configured, all user subdomains work automatically.
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
