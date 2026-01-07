import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useBrandSettings, BrandSettings } from '@/hooks/useBrandSettings';
import { 
  Palette, 
  Image, 
  Globe, 
  Mail, 
  Phone, 
  FileText,
  Loader2,
  Eye,
  RefreshCw,
} from 'lucide-react';

export function BrandingSettings() {
  const { brandSettings, isLoading, isSaving, saveBrandSettings } = useBrandSettings();
  const [formData, setFormData] = useState<Partial<BrandSettings>>({});
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setFormData(brandSettings);
    }
  }, [brandSettings, isLoading]);

  const handleChange = (field: keyof BrandSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await saveBrandSettings(formData);
  };

  const handlePreview = () => {
    // Apply colors temporarily for preview
    const root = document.documentElement;
    if (formData.primary_color) {
      root.style.setProperty('--primary', formData.primary_color);
    }
    if (formData.secondary_color) {
      root.style.setProperty('--secondary', formData.secondary_color);
    }
    if (formData.accent_color) {
      root.style.setProperty('--accent', formData.accent_color);
    }
    setPreviewMode(true);
  };

  const handleReset = () => {
    // Reset to saved values
    const root = document.documentElement;
    root.style.setProperty('--primary', brandSettings.primary_color);
    root.style.setProperty('--secondary', brandSettings.secondary_color);
    root.style.setProperty('--accent', brandSettings.accent_color);
    setFormData(brandSettings);
    setPreviewMode(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Brand Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Brand Identity
          </CardTitle>
          <CardDescription>
            Upload your logo and customize your brand name to white-label the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name || ''}
                onChange={(e) => handleChange('company_name', e.target.value)}
                placeholder="Your Company Name"
              />
              <p className="text-xs text-muted-foreground">
                This will appear in the header and browser title
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url || ''}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">
                Recommended size: 200x50px (PNG or SVG)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="favicon_url">Favicon URL</Label>
              <Input
                id="favicon_url"
                value={formData.favicon_url || ''}
                onChange={(e) => handleChange('favicon_url', e.target.value)}
                placeholder="https://example.com/favicon.ico"
              />
              <p className="text-xs text-muted-foreground">
                Browser tab icon (ICO or PNG, 32x32px)
              </p>
            </div>
          </div>

          {formData.logo_url && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Logo Preview</p>
              <img 
                src={formData.logo_url} 
                alt="Logo preview" 
                className="h-12 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Brand Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Brand Colors
          </CardTitle>
          <CardDescription>
            Customize the color scheme to match your brand identity. Use HSL format (e.g., "142 76% 36%").
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2">
                <div 
                  className="w-10 h-10 rounded-lg border border-border flex-shrink-0"
                  style={{ backgroundColor: `hsl(${formData.primary_color || '142 76% 36%'})` }}
                />
                <Input
                  id="primary_color"
                  value={formData.primary_color || ''}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  placeholder="142 76% 36%"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Main brand color (buttons, links)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex gap-2">
                <div 
                  className="w-10 h-10 rounded-lg border border-border flex-shrink-0"
                  style={{ backgroundColor: `hsl(${formData.secondary_color || '215 28% 17%'})` }}
                />
                <Input
                  id="secondary_color"
                  value={formData.secondary_color || ''}
                  onChange={(e) => handleChange('secondary_color', e.target.value)}
                  placeholder="215 28% 17%"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Sidebar and secondary elements
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent_color">Accent Color</Label>
              <div className="flex gap-2">
                <div 
                  className="w-10 h-10 rounded-lg border border-border flex-shrink-0"
                  style={{ backgroundColor: `hsl(${formData.accent_color || '142 71% 45%'})` }}
                />
                <Input
                  id="accent_color"
                  value={formData.accent_color || ''}
                  onChange={(e) => handleChange('accent_color', e.target.value)}
                  placeholder="142 71% 45%"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Highlights and accents
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview Colors
            </Button>
            {previewMode && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Preview
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Contact & Support
          </CardTitle>
          <CardDescription>
            Set your support contact details that will be shown to your clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="support_email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Support Email
              </Label>
              <Input
                id="support_email"
                type="email"
                value={formData.support_email || ''}
                onChange={(e) => handleChange('support_email', e.target.value)}
                placeholder="support@yourcompany.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support_phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Support Phone
              </Label>
              <Input
                id="support_phone"
                value={formData.support_phone || ''}
                onChange={(e) => handleChange('support_phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom_domain" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Custom Domain
              </Label>
              <Input
                id="custom_domain"
                value={formData.custom_domain || ''}
                onChange={(e) => handleChange('custom_domain', e.target.value)}
                placeholder="app.yourcompany.com"
              />
              <p className="text-xs text-muted-foreground">
                Contact support to set up your custom domain
              </p>
            </div>
          </div>
          
          <Separator />

          <div className="space-y-2">
            <Label htmlFor="footer_text" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Custom Footer Text
            </Label>
            <Textarea
              id="footer_text"
              value={formData.footer_text || ''}
              onChange={(e) => handleChange('footer_text', e.target.value)}
              placeholder="© 2025 Your Company. All rights reserved."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-gradient-primary hover:opacity-90"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Brand Settings'
          )}
        </Button>
      </div>
    </div>
  );
}
