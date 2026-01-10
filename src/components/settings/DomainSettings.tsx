import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, ExternalLink, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { BrandSettings } from '@/hooks/useBrandSettings';

interface DomainSettingsProps {
  formData: Partial<BrandSettings>;
  onChange: (field: keyof BrandSettings, value: string) => void;
}

export function DomainSettings({ formData, onChange }: DomainSettingsProps) {
  const hasDomain = !!formData.custom_domain;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Custom Domain
        </CardTitle>
        <CardDescription>
          Connect your own domain to provide a fully branded experience for your clients.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="custom_domain" className="flex items-center gap-2">
            Domain Name
            {hasDomain && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                <Clock className="w-3 h-3 mr-1" />
                Pending Setup
              </Badge>
            )}
          </Label>
          <Input
            id="custom_domain"
            value={formData.custom_domain || ''}
            onChange={(e) => onChange('custom_domain', e.target.value)}
            placeholder="app.yourcompany.com"
          />
          <p className="text-xs text-muted-foreground">
            Enter your subdomain (e.g., app.yourcompany.com or portal.yourcompany.com)
          </p>
        </div>

        {hasDomain && (
          <Alert className="border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong>Domain Setup Instructions:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Add a CNAME record pointing to <code className="bg-muted px-1 rounded">app.lovable.dev</code></li>
                <li>Add a TXT record for domain verification</li>
                <li>Wait for DNS propagation (up to 48 hours)</li>
                <li>Contact support to complete the SSL certificate setup</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}

        {/* DNS Records Reference */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Required DNS Records
          </h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-background rounded">
              <span className="font-mono text-xs">CNAME</span>
              <span className="text-muted-foreground">→ app.lovable.dev</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-background rounded">
              <span className="font-mono text-xs">TXT</span>
              <span className="text-muted-foreground">→ verification code (provided after save)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
