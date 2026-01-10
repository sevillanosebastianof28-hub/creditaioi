import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrandSettings } from '@/hooks/useBrandSettings';
import { Monitor, Smartphone, Bell, Mail, User } from 'lucide-react';
import { useState } from 'react';

interface BrandPreviewPanelProps {
  settings: Partial<BrandSettings>;
}

export function BrandPreviewPanel({ settings }: BrandPreviewPanelProps) {
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');

  const primaryColor = settings.primary_color || '142 76% 36%';
  const secondaryColor = settings.secondary_color || '215 28% 17%';
  const accentColor = settings.accent_color || '142 71% 45%';

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Preview</CardTitle>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant={view === 'desktop' ? 'default' : 'ghost'}
              onClick={() => setView('desktop')}
              className="h-8 w-8"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={view === 'mobile' ? 'default' : 'ghost'}
              onClick={() => setView('mobile')}
              className="h-8 w-8"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className={`rounded-lg border border-border overflow-hidden transition-all ${
            view === 'mobile' ? 'max-w-[280px] mx-auto' : 'w-full'
          }`}
        >
          {/* Mock Header */}
          <div 
            className="p-3 flex items-center justify-between"
            style={{ backgroundColor: `hsl(${secondaryColor})` }}
          >
            <div className="flex items-center gap-2">
              {settings.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt="Logo" 
                  className="h-6 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div 
                  className="h-6 w-6 rounded"
                  style={{ backgroundColor: `hsl(${primaryColor})` }}
                />
              )}
              <span className="text-white text-sm font-semibold truncate max-w-24">
                {settings.company_name || 'Your Company'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-white/60" />
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-3 h-3 text-white/80" />
              </div>
            </div>
          </div>

          {/* Mock Content */}
          <div className="p-4 bg-background space-y-3">
            <div className="space-y-1">
              <div className="h-3 bg-muted rounded w-24" />
              <div className="h-2 bg-muted rounded w-full" />
              <div className="h-2 bg-muted rounded w-3/4" />
            </div>

            {/* Primary Button */}
            <button
              className="w-full py-2 px-4 rounded-md text-white text-sm font-medium"
              style={{ backgroundColor: `hsl(${primaryColor})` }}
            >
              Primary Button
            </button>

            {/* Accent Element */}
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: `hsl(${accentColor})` }}
              />
              <span className="text-sm" style={{ color: `hsl(${accentColor})` }}>
                Accent Text
              </span>
            </div>

            {/* Mock Card */}
            <div className="p-3 rounded-lg border border-border space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-2 bg-muted rounded w-16" />
                <div 
                  className="px-2 py-0.5 rounded text-xs text-white"
                  style={{ backgroundColor: `hsl(${primaryColor})` }}
                >
                  Active
                </div>
              </div>
              <div className="h-2 bg-muted rounded w-full" />
            </div>
          </div>

          {/* Mock Footer */}
          <div className="px-4 py-2 border-t border-border bg-muted/50">
            <p className="text-[10px] text-muted-foreground text-center truncate">
              {settings.footer_text || `© ${new Date().getFullYear()} ${settings.company_name || 'Your Company'}. All rights reserved.`}
            </p>
          </div>
        </div>

        {/* Contact Preview */}
        {(settings.support_email || settings.support_phone) && (
          <div className="mt-4 p-3 bg-muted rounded-lg space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Contact Info Preview</p>
            {settings.support_email && (
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-3 h-3" />
                <span>{settings.support_email}</span>
              </div>
            )}
            {settings.support_phone && (
              <div className="flex items-center gap-2 text-xs">
                <span>📞</span>
                <span>{settings.support_phone}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
