import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bell,
  Mail,
  Smartphone,
  TrendingUp,
  FileText,
  CreditCard,
  Megaphone,
  AlertCircle,
} from 'lucide-react';
import { BrandSettings } from '@/hooks/useBrandSettings';

interface NotificationSettingsProps {
  formData: Partial<BrandSettings>;
  onChange: (field: keyof BrandSettings, value: any) => void;
}

interface NotificationOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'channels' | 'alerts';
}

const notificationOptions: NotificationOption[] = [
  // Channel options
  {
    id: 'email_notifications',
    name: 'Email Notifications',
    description: 'Send notifications via email to clients',
    icon: <Mail className="w-5 h-5" />,
    category: 'channels',
  },
  {
    id: 'sms_notifications',
    name: 'SMS Notifications',
    description: 'Send text message alerts (requires Twilio integration)',
    icon: <Smartphone className="w-5 h-5" />,
    category: 'channels',
  },
  // Alert options
  {
    id: 'score_change_alerts',
    name: 'Score Change Alerts',
    description: 'Notify clients when their credit score changes',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'alerts',
  },
  {
    id: 'dispute_updates',
    name: 'Dispute Updates',
    description: 'Alerts for dispute status changes and bureau responses',
    icon: <FileText className="w-5 h-5" />,
    category: 'alerts',
  },
  {
    id: 'billing_reminders',
    name: 'Billing Reminders',
    description: 'Payment due dates and invoice notifications',
    icon: <CreditCard className="w-5 h-5" />,
    category: 'alerts',
  },
  {
    id: 'marketing_emails',
    name: 'Marketing Communications',
    description: 'Promotional emails and special offers',
    icon: <Megaphone className="w-5 h-5" />,
    category: 'alerts',
  },
];

const categoryLabels: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  channels: { 
    label: 'Notification Channels', 
    description: 'Choose how notifications are delivered to your clients',
    icon: <Bell className="w-4 h-4" /> 
  },
  alerts: { 
    label: 'Alert Types', 
    description: 'Configure which notifications your clients receive',
    icon: <AlertCircle className="w-4 h-4" /> 
  },
};

export function NotificationSettings({ formData, onChange }: NotificationSettingsProps) {
  const currentSettings = formData.notification_settings || {};

  const updateSetting = (settingId: string, enabled: boolean) => {
    const updatedSettings = {
      ...currentSettings,
      [settingId]: enabled,
    };
    onChange('notification_settings', updatedSettings);
  };

  const isEnabled = (settingId: string): boolean => {
    const value = (currentSettings as any)[settingId];
    // Default values
    if (value === undefined) {
      return ['email_notifications', 'score_change_alerts', 'dispute_updates', 'billing_reminders'].includes(settingId);
    }
    return value;
  };

  const groupedOptions = notificationOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, NotificationOption[]>);

  const enabledCount = notificationOptions.filter(o => isEnabled(o.id)).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Client Notification Settings
            </span>
            <Badge variant="outline" className="text-xs">
              {enabledCount} / {notificationOptions.length} Active
            </Badge>
          </CardTitle>
          <CardDescription>
            Configure how and when your platform sends notifications to clients. These settings apply to all automated notifications from your white-labeled platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.entries(groupedOptions).map(([category, options], index) => (
            <div key={category} className="space-y-4">
              {index > 0 && <Separator />}
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  {categoryLabels[category]?.icon}
                  {categoryLabels[category]?.label}
                </div>
                <p className="text-sm text-muted-foreground">
                  {categoryLabels[category]?.description}
                </p>
              </div>
              
              <div className="space-y-3">
                {options.map((option) => {
                  const enabled = isEnabled(option.id);
                  
                  return (
                    <div
                      key={option.id}
                      className={`p-4 rounded-lg border flex items-center justify-between transition-colors ${
                        enabled ? 'bg-background border-border' : 'bg-muted/30 border-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {option.icon}
                        </div>
                        <div className="space-y-0.5">
                          <Label htmlFor={option.id} className="font-medium cursor-pointer">
                            {option.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id={option.id}
                        checked={enabled}
                        onCheckedChange={(checked) => updateSetting(option.id, checked)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
