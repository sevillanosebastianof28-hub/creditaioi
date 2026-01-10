import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBrandSettings, BrandSettings } from '@/hooks/useBrandSettings';
import { ColorPicker } from './ColorPicker';
import { LogoUploader } from './LogoUploader';
import { BrandPreviewPanel } from './BrandPreviewPanel';
import { LoginPageSettings } from './LoginPageSettings';
import { EmailBrandingSettings } from './EmailBrandingSettings';
import { AdvancedBrandingSettings } from './AdvancedBrandingSettings';
import { DomainSettings } from './DomainSettings';
import { IntegrationSettings } from './IntegrationSettings';
import { FeatureToggleSettings } from './FeatureToggleSettings';
import { ClientPortalSettings } from './ClientPortalSettings';
import { NotificationSettings } from './NotificationSettings';
import { SubscriptionSettings } from './SubscriptionSettings';
import { 
  Palette, 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  FileText,
  Loader2,
  Eye,
  RefreshCw,
  Sparkles,
  Check,
  LogIn,
  Code,
  Zap,
  Users,
  Bell,
  Crown,
} from 'lucide-react';

export function BrandingSettings() {
  const { brandSettings, isLoading, isSaving, saveBrandSettings } = useBrandSettings();
  const [formData, setFormData] = useState<Partial<BrandSettings>>({});
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');

  useEffect(() => {
    if (!isLoading) {
      setFormData(brandSettings);
    }
  }, [brandSettings, isLoading]);

  const handleChange = (field: keyof BrandSettings, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const success = await saveBrandSettings(formData);
    if (success) {
      setHasChanges(false);
      applyColorsGlobally();
      applyCustomCSS();
    }
  };

  const applyColorsGlobally = () => {
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
  };

  const applyCustomCSS = () => {
    // Remove existing custom CSS
    const existingStyle = document.getElementById('brand-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Add new custom CSS if provided
    if (formData.custom_css) {
      const style = document.createElement('style');
      style.id = 'brand-custom-css';
      style.textContent = formData.custom_css;
      document.head.appendChild(style);
    }
  };

  const handlePreview = () => {
    applyColorsGlobally();
    applyCustomCSS();
    setPreviewMode(true);
  };

  const handleReset = () => {
    const root = document.documentElement;
    root.style.setProperty('--primary', brandSettings.primary_color);
    root.style.setProperty('--secondary', brandSettings.secondary_color);
    root.style.setProperty('--accent', brandSettings.accent_color);
    setFormData(brandSettings);
    setPreviewMode(false);
    setHasChanges(false);
    
    // Reset custom CSS
    const existingStyle = document.getElementById('brand-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Settings Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              White Label Settings
            </h2>
            <p className="text-muted-foreground mt-1">
              Customize your platform's appearance to match your brand and resell to your clients
            </p>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes
            </div>
          )}
        </div>

        {/* Tabbed Settings */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
            <TabsTrigger value="identity" className="text-xs">
              <Building2 className="w-4 h-4 mr-1 hidden sm:inline" />
              Identity
            </TabsTrigger>
            <TabsTrigger value="colors" className="text-xs">
              <Palette className="w-4 h-4 mr-1 hidden sm:inline" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="login" className="text-xs">
              <LogIn className="w-4 h-4 mr-1 hidden sm:inline" />
              Login
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs">
              <Mail className="w-4 h-4 mr-1 hidden sm:inline" />
              Email
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">
              <Code className="w-4 h-4 mr-1 hidden sm:inline" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs">
              <Zap className="w-4 h-4 mr-1 hidden sm:inline" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="features" className="text-xs">
              <Sparkles className="w-4 h-4 mr-1 hidden sm:inline" />
              Features
            </TabsTrigger>
            <TabsTrigger value="portal" className="text-xs">
              <Users className="w-4 h-4 mr-1 hidden sm:inline" />
              Portal
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">
              <Bell className="w-4 h-4 mr-1 hidden sm:inline" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="subscription" className="text-xs">
              <Crown className="w-4 h-4 mr-1 hidden sm:inline" />
              Limits
            </TabsTrigger>
          </TabsList>

          {/* Identity Tab */}
          <TabsContent value="identity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Brand Identity
                </CardTitle>
                <CardDescription>
                  Upload your logo and set your company name to personalize the platform for your clients.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name || ''}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="Your Company Name"
                    className="max-w-md"
                  />
                  <p className="text-xs text-muted-foreground">
                    This appears in the header, browser title, and throughout the platform
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LogoUploader
                    label="Company Logo"
                    value={formData.logo_url}
                    onChange={(url) => handleChange('logo_url', url)}
                    description="Recommended: 200x50px transparent PNG or SVG"
                    type="logo"
                  />
                  <LogoUploader
                    label="Favicon"
                    value={formData.favicon_url}
                    onChange={(url) => handleChange('favicon_url', url)}
                    description="Browser tab icon: 32x32px PNG or ICO"
                    type="favicon"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact & Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Contact & Support
                </CardTitle>
                <CardDescription>
                  Set your support contact details that clients will see throughout the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="support_email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
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
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Support Phone
                    </Label>
                    <Input
                      id="support_phone"
                      value={formData.support_phone || ''}
                      onChange={(e) => handleChange('support_phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="footer_text" className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Custom Footer Text
                  </Label>
                  <Textarea
                    id="footer_text"
                    value={formData.footer_text || ''}
                    onChange={(e) => handleChange('footer_text', e.target.value)}
                    placeholder={`© ${new Date().getFullYear()} Your Company. All rights reserved.`}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <DomainSettings 
              formData={formData} 
              onChange={handleChange}
            />
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Brand Colors
                </CardTitle>
                <CardDescription>
                  Define your brand's color palette. These colors will be applied across the entire platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ColorPicker
                    label="Primary Color"
                    value={formData.primary_color || '142 76% 36%'}
                    onChange={(value) => handleChange('primary_color', value)}
                    description="Buttons, links, and key actions"
                  />
                  <ColorPicker
                    label="Secondary Color"
                    value={formData.secondary_color || '215 28% 17%'}
                    onChange={(value) => handleChange('secondary_color', value)}
                    description="Sidebar and navigation"
                  />
                  <ColorPicker
                    label="Accent Color"
                    value={formData.accent_color || '142 71% 45%'}
                    onChange={(value) => handleChange('accent_color', value)}
                    description="Highlights and emphasis"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={handlePreview}>
                    <Eye className="w-4 h-4 mr-2" />
                    Apply Preview
                  </Button>
                  {previewMode && (
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset Colors
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-6">
            <LoginPageSettings 
              formData={formData} 
              onChange={handleChange}
            />
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <EmailBrandingSettings 
              formData={formData} 
              onChange={handleChange}
            />
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <AdvancedBrandingSettings 
              formData={formData} 
              onChange={handleChange}
            />
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <IntegrationSettings 
              formData={formData} 
              onChange={handleChange}
            />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <FeatureToggleSettings 
              formData={formData} 
              onChange={handleChange}
            />
          </TabsContent>

          {/* Portal Tab */}
          <TabsContent value="portal" className="space-y-6">
            <ClientPortalSettings 
              formData={formData} 
              onChange={handleChange}
            />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettings 
              formData={formData} 
              onChange={handleChange}
            />
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionSettings 
              formData={formData} 
              onChange={handleChange}
            />
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end gap-3 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border">
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasChanges}
            className="bg-gradient-primary hover:opacity-90 min-w-32"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Column */}
      <div className="hidden lg:block">
        <BrandPreviewPanel settings={formData} />
      </div>
    </div>
  );
}
