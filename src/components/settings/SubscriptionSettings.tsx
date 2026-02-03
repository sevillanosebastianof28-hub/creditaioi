import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Crown,
  Users,
  UserCog,
  FileText,
  Palette,
  Code,
  Headphones,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { BrandSettings, SubscriptionFeatures } from '@/hooks/useBrandSettings';

interface SubscriptionSettingsProps {
  formData: Partial<BrandSettings>;
  onChange: (field: keyof BrandSettings, value: BrandSettings[keyof BrandSettings]) => void;
}

interface LimitSetting {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'number' | 'boolean';
  placeholder?: string;
}

const limitSettings: LimitSetting[] = [
  {
    id: 'max_clients',
    name: 'Maximum Clients',
    description: 'Limit the number of clients (leave empty for unlimited)',
    icon: <Users className="w-5 h-5" />,
    type: 'number',
    placeholder: 'Unlimited',
  },
  {
    id: 'max_staff',
    name: 'Maximum Staff Members',
    description: 'Limit the number of VA/staff accounts',
    icon: <UserCog className="w-5 h-5" />,
    type: 'number',
    placeholder: 'Unlimited',
  },
  {
    id: 'max_disputes_per_month',
    name: 'Monthly Dispute Limit',
    description: 'Maximum disputes that can be generated per month',
    icon: <FileText className="w-5 h-5" />,
    type: 'number',
    placeholder: 'Unlimited',
  },
];

const featureSettings: LimitSetting[] = [
  {
    id: 'white_label_enabled',
    name: 'White Label Branding',
    description: 'Full branding customization and "Powered by" removal',
    icon: <Palette className="w-5 h-5" />,
    type: 'boolean',
  },
  {
    id: 'api_access',
    name: 'API Access',
    description: 'Access to platform APIs for custom integrations',
    icon: <Code className="w-5 h-5" />,
    type: 'boolean',
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Dedicated support with faster response times',
    icon: <Headphones className="w-5 h-5" />,
    type: 'boolean',
  },
  {
    id: 'custom_integrations',
    name: 'Custom Integrations',
    description: 'Ability to request custom integration development',
    icon: <Crown className="w-5 h-5" />,
    type: 'boolean',
  },
];

export function SubscriptionSettings({ formData, onChange }: SubscriptionSettingsProps) {
  const currentSettings: SubscriptionFeatures = formData.subscription_features || {};

  const updateSetting = (settingId: keyof SubscriptionFeatures, value: SubscriptionFeatures[keyof SubscriptionFeatures]) => {
    const updatedSettings: SubscriptionFeatures = {
      ...currentSettings,
      [settingId]: value,
    };
    onChange('subscription_features', updatedSettings);
  };

  const getValue = (settingId: keyof SubscriptionFeatures) => {
    return currentSettings[settingId];
  };

  const isBoolean = (settingId: string): boolean => {
    const setting = [...limitSettings, ...featureSettings].find(s => s.id === settingId);
    return setting?.type === 'boolean';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Subscription & Limits
            </span>
            <Badge variant="secondary" className="text-xs">
              Platform Configuration
            </Badge>
          </CardTitle>
          <CardDescription>
            Configure usage limits and premium feature access for your platform. These settings help you manage your subscription tier and client capacity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Limits Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <InfinityIcon className="w-4 h-4" />
                Usage Limits
              </div>
              <p className="text-sm text-muted-foreground">
                Set capacity limits for your platform
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3">
              {limitSettings.map((setting) => {
                const value = getValue(setting.id as keyof SubscriptionFeatures);
                
                return (
                  <div key={setting.id} className="p-4 rounded-lg border bg-background space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {setting.icon}
                      </div>
                      <div>
                        <Label htmlFor={setting.id} className="font-medium">
                          {setting.name}
                        </Label>
                      </div>
                    </div>
                    <Input
                      id={setting.id}
                      type="number"
                      value={typeof value === 'number' ? value : ''}
                      onChange={(e) => updateSetting(setting.id as keyof SubscriptionFeatures, e.target.value ? parseInt(e.target.value, 10) : null)}
                      placeholder={setting.placeholder}
                      className="bg-muted/30"
                    />
                    <p className="text-xs text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Premium Features Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <Crown className="w-4 h-4" />
                Premium Features
              </div>
              <p className="text-sm text-muted-foreground">
                Enable or disable premium features for your subscription
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {featureSettings.map((setting) => {
                const enabled = getValue(setting.id as keyof SubscriptionFeatures) !== false;
                
                return (
                  <div
                    key={setting.id}
                    className={`p-4 rounded-lg border flex items-center justify-between transition-colors ${
                      enabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {setting.icon}
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor={setting.id} className="font-medium cursor-pointer">
                          {setting.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={setting.id}
                      checked={enabled}
                      onCheckedChange={(checked) => updateSetting(setting.id as keyof SubscriptionFeatures, checked)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
