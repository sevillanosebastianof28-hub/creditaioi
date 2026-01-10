import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LogoUploader } from './LogoUploader';
import { LogIn, Image, Type } from 'lucide-react';
import { BrandSettings } from '@/hooks/useBrandSettings';

interface LoginPageSettingsProps {
  formData: Partial<BrandSettings>;
  onChange: (field: keyof BrandSettings, value: string) => void;
}

export function LoginPageSettings({ formData, onChange }: LoginPageSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="w-5 h-5 text-primary" />
          Login Page Customization
        </CardTitle>
        <CardDescription>
          Customize the login experience for your clients. Add your branding to make the platform feel like your own.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <LogoUploader
          label="Login Background Image"
          value={formData.login_background_url}
          onChange={(url) => onChange('login_background_url', url)}
          description="Hero image shown on login page. Recommended: 1920x1080px"
          type="logo"
        />

        <div className="space-y-2">
          <Label htmlFor="login_tagline" className="flex items-center gap-2">
            <Type className="w-4 h-4 text-muted-foreground" />
            Login Tagline
          </Label>
          <Textarea
            id="login_tagline"
            value={formData.login_tagline || ''}
            onChange={(e) => onChange('login_tagline', e.target.value)}
            placeholder="Transform your credit score with AI-powered insights"
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Displayed below your logo on the login page
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="terms_url">Terms of Service URL</Label>
            <Input
              id="terms_url"
              type="url"
              value={formData.terms_url || ''}
              onChange={(e) => onChange('terms_url', e.target.value)}
              placeholder="https://yoursite.com/terms"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="privacy_url">Privacy Policy URL</Label>
            <Input
              id="privacy_url"
              type="url"
              value={formData.privacy_url || ''}
              onChange={(e) => onChange('privacy_url', e.target.value)}
              placeholder="https://yoursite.com/privacy"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
