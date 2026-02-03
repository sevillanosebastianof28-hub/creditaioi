import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe,
  Link2,
  Copy,
  ExternalLink,
  Check,
  AlertCircle,
  Rocket,
  Eye,
} from 'lucide-react';
import { BrandSettings } from '@/hooks/useBrandSettings';
import { toast } from 'sonner';

interface SubdomainSettingsProps {
  formData: Partial<BrandSettings>;
  onChange: (field: keyof BrandSettings, value: BrandSettings[keyof BrandSettings]) => void;
  onPublish?: () => Promise<void>;
}

export function SubdomainSettings({ formData, onChange, onPublish }: SubdomainSettingsProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const subdomain = formData.subdomain || '';
  const isPublished = formData.is_published || false;
  
  // Generate the full white-label URL
  const getWhiteLabelUrl = () => {
    // In production, this would be your actual domain
    const baseDomain = window.location.hostname.includes('credit-ai.online') 
      ? 'credit-ai.online' 
      : window.location.hostname.includes('localhost')
        ? 'localhost:8080'
        : 'credit-ai.online';
    
    if (window.location.hostname.includes('localhost')) {
      return `${window.location.origin}?subdomain=${subdomain}`;
    }
    
    return `https://${subdomain}.${baseDomain}`;
  };
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(getWhiteLabelUrl());
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handlePublish = async () => {
    if (!subdomain) {
      toast.error('Please set a subdomain first');
      return;
    }
    
    setIsPublishing(true);
    try {
      // Update the form data first
      onChange('is_published', true);
      onChange('published_at', new Date().toISOString());
      
      console.log('Publishing portal with subdomain:', subdomain);
      
      // Then save to database
      if (onPublish) {
        const result = await onPublish();
        console.log('Publish result:', result);
        if (result !== false) {
          toast.success('White-label portal published successfully!');
        }
      } else {
        toast.error('Save function not available');
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish portal');
    } finally {
      setIsPublishing(false);
    }
  };
  
  const handleUnpublish = async () => {
    onChange('is_published', false);
    
    // Save the unpublished state to database
    if (onPublish) {
      try {
        await onPublish();
        toast.success('White-label portal unpublished');
      } catch (error) {
        console.error('Unpublish error:', error);
        toast.error('Failed to unpublish portal');
      }
    } else {
      toast.success('White-label portal unpublished');
    }
  };
  
  const validateSubdomain = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    onChange('subdomain', sanitized);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            White-Label Portal URL
          </span>
          {isPublished ? (
            <Badge className="bg-green-500">
              <Check className="w-3 h-3 mr-1" />
              Live
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="w-3 h-3 mr-1" />
              Draft
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Set up a unique subdomain for your clients. They will access your white-labeled platform at this URL, completely separate from the main platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subdomain Input */}
        <div className="space-y-3">
          <Label htmlFor="subdomain">Your Subdomain</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="subdomain"
                value={subdomain}
                onChange={(e) => validateSubdomain(e.target.value)}
                placeholder="your-company"
                className="pr-32"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                .credit-ai.online
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Only lowercase letters, numbers, and hyphens allowed. This will be your clients' access point.
          </p>
        </div>
        
        {subdomain && (
          <>
            <Separator />
            
            {/* Live URL Display */}
            <div className="space-y-3">
              <Label>Client Portal URL</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <code className="text-sm flex-1 truncate">
                  {getWhiteLabelUrl()}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(getWhiteLabelUrl(), '_blank')}
                  className="shrink-0"
                  disabled={!isPublished}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Preview Mode Info */}
            <Alert>
              <Eye className="w-4 h-4" />
              <AlertDescription>
                <strong>Preview Mode:</strong> You can test your white-label portal by adding <code className="bg-muted px-1 rounded">?subdomain={subdomain}</code> to any URL in this platform.
              </AlertDescription>
            </Alert>
            
            <Separator />
            
            {/* Publish Actions */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Portal Status</p>
                <p className="text-sm text-muted-foreground">
                  {isPublished 
                    ? 'Your clients can access the white-labeled portal' 
                    : 'Publish to make the portal accessible to clients'}
                </p>
              </div>
              
              {isPublished ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(getWhiteLabelUrl(), '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Live
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleUnpublish}
                  >
                    Unpublish
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing || !subdomain}
                  className="bg-gradient-primary"
                >
                  {isPublishing ? (
                    <>Publishing...</>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Publish Portal
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
        
        <Separator />
        
        {/* Custom Domain Option */}
        <div className="space-y-3">
          <Label>Custom Domain (Optional)</Label>
          <Input
            value={formData.custom_domain || ''}
            onChange={(e) => onChange('custom_domain', e.target.value)}
            placeholder="clients.yourcompany.com"
          />
          <p className="text-xs text-muted-foreground">
            Want to use your own domain? Enter it here and point your DNS to our servers. Contact support for setup instructions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
