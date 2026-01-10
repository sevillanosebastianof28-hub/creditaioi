import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LogoUploader } from './LogoUploader';
import { Mail, FileText } from 'lucide-react';
import { BrandSettings } from '@/hooks/useBrandSettings';

interface EmailBrandingSettingsProps {
  formData: Partial<BrandSettings>;
  onChange: (field: keyof BrandSettings, value: string) => void;
}

export function EmailBrandingSettings({ formData, onChange }: EmailBrandingSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Email Branding
        </CardTitle>
        <CardDescription>
          Customize email templates sent to your clients. All automated emails will use these settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <LogoUploader
          label="Email Header Logo"
          value={formData.email_header_logo_url}
          onChange={(url) => onChange('email_header_logo_url', url)}
          description="Logo shown at the top of email templates. Recommended: 400x100px"
          type="logo"
        />

        <div className="space-y-2">
          <Label htmlFor="email_footer_text" className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Email Footer Text
          </Label>
          <Textarea
            id="email_footer_text"
            value={formData.email_footer_text || ''}
            onChange={(e) => onChange('email_footer_text', e.target.value)}
            placeholder={`© ${new Date().getFullYear()} Your Company Name. All rights reserved.\n123 Business Street, City, State 12345`}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            This text appears at the bottom of all emails. Include your company address for CAN-SPAM compliance.
          </p>
        </div>

        {/* Email Preview */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-4 py-2 border-b border-border">
            <span className="text-sm font-medium">Email Preview</span>
          </div>
          <div className="p-6 bg-background">
            <div className="max-w-md mx-auto space-y-4">
              {/* Header */}
              <div className="text-center pb-4 border-b border-border">
                {formData.email_header_logo_url ? (
                  <img 
                    src={formData.email_header_logo_url} 
                    alt="Email Logo" 
                    className="h-10 mx-auto object-contain"
                  />
                ) : formData.logo_url ? (
                  <img 
                    src={formData.logo_url} 
                    alt="Email Logo" 
                    className="h-10 mx-auto object-contain"
                  />
                ) : (
                  <div className="h-10 w-32 mx-auto bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                    Your Logo
                  </div>
                )}
              </div>

              {/* Content placeholder */}
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border text-center text-xs text-muted-foreground whitespace-pre-line">
                {formData.email_footer_text || `© ${new Date().getFullYear()} Your Company. All rights reserved.`}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
