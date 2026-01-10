import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Code, Eye, Layout, Sparkles, MessageSquare } from 'lucide-react';
import { BrandSettings } from '@/hooks/useBrandSettings';

interface AdvancedBrandingSettingsProps {
  formData: Partial<BrandSettings>;
  onChange: (field: keyof BrandSettings, value: string | boolean) => void;
}

export function AdvancedBrandingSettings({ formData, onChange }: AdvancedBrandingSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Advanced Customization
        </CardTitle>
        <CardDescription>
          Fine-tune the platform appearance and behavior for a truly white-labeled experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform Badge */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              Hide "Powered by" Badge
            </Label>
            <p className="text-xs text-muted-foreground">
              Remove the Credit AI branding from the platform footer
            </p>
          </div>
          <Switch
            checked={formData.hide_powered_by || false}
            onCheckedChange={(checked) => onChange('hide_powered_by', checked)}
          />
        </div>

        <Separator />

        {/* UI Style Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sidebar_style" className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-muted-foreground" />
              Sidebar Style
            </Label>
            <Select
              value={formData.sidebar_style || 'default'}
              onValueChange={(value) => onChange('sidebar_style', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sidebar style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="expanded">Expanded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="button_style" className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-muted-foreground" />
              Button Style
            </Label>
            <Select
              value={formData.button_style || 'rounded'}
              onValueChange={(value) => onChange('button_style', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select button style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="pill">Pill</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Welcome Message */}
        <div className="space-y-2">
          <Label htmlFor="welcome_message" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            Client Welcome Message
          </Label>
          <Textarea
            id="welcome_message"
            value={formData.welcome_message || ''}
            onChange={(e) => onChange('welcome_message', e.target.value)}
            placeholder="Welcome to our credit repair platform! We're excited to help you improve your credit score."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Shown to clients when they first log in to the platform
          </p>
        </div>

        <Separator />

        {/* Custom CSS */}
        <div className="space-y-2">
          <Label htmlFor="custom_css" className="flex items-center gap-2">
            <Code className="w-4 h-4 text-muted-foreground" />
            Custom CSS (Advanced)
          </Label>
          <Textarea
            id="custom_css"
            value={formData.custom_css || ''}
            onChange={(e) => onChange('custom_css', e.target.value)}
            placeholder={`/* Example custom styles */
.sidebar { 
  /* Custom sidebar styles */ 
}

.btn-primary {
  /* Custom button styles */
}`}
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Add custom CSS to further customize the platform. Use with caution.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
