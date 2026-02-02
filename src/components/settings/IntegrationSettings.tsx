import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  CreditCard, 
  Zap, 
  Mail, 
  MessageSquare, 
  Phone,
  Send,
  Users,
  Calendar,
  BarChart3,
  Facebook,
  MessageCircle,
  Headphones,
  ChevronDown,
  ExternalLink,
  Check,
  AlertCircle,
} from 'lucide-react';
import { BrandSettings, IntegrationConfig, Integrations } from '@/hooks/useBrandSettings';

interface IntegrationSettingsProps {
  formData: Partial<BrandSettings>;
  onChange: (field: keyof BrandSettings, value: BrandSettings[keyof BrandSettings]) => void;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'payments' | 'marketing' | 'communication' | 'analytics' | 'support' | 'automation';
  fields: { key: string; label: string; placeholder: string; type?: string }[];
  docUrl?: string;
}

const integrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments and manage subscriptions',
    icon: <CreditCard className="w-5 h-5" />,
    category: 'payments',
    fields: [
      { key: 'api_key', label: 'Secret Key', placeholder: 'sk_live_...', type: 'password' },
      { key: 'publishable_key', label: 'Publishable Key', placeholder: 'pk_live_...' },
    ],
    docUrl: 'https://stripe.com/docs',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automate workflows with 5000+ apps',
    icon: <Zap className="w-5 h-5" />,
    category: 'automation',
    fields: [
      { key: 'webhook_url', label: 'Webhook URL', placeholder: 'https://hooks.zapier.com/...' },
    ],
    docUrl: 'https://zapier.com',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and automation',
    icon: <Mail className="w-5 h-5" />,
    category: 'marketing',
    fields: [
      { key: 'api_key', label: 'API Key', placeholder: 'xxxxxxxx-us1', type: 'password' },
      { key: 'list_id', label: 'Audience List ID', placeholder: 'abc123def4' },
    ],
    docUrl: 'https://mailchimp.com/developer/',
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS notifications and voice calls',
    icon: <Phone className="w-5 h-5" />,
    category: 'communication',
    fields: [
      { key: 'account_sid', label: 'Account SID', placeholder: 'ACxxxxxxxx' },
      { key: 'auth_token', label: 'Auth Token', placeholder: 'xxxxxxxx', type: 'password' },
      { key: 'phone_number', label: 'Twilio Phone Number', placeholder: '+1234567890' },
    ],
    docUrl: 'https://www.twilio.com/docs',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Transactional email delivery',
    icon: <Send className="w-5 h-5" />,
    category: 'communication',
    fields: [
      { key: 'api_key', label: 'API Key', placeholder: 'SG.xxxxxxxx', type: 'password' },
    ],
    docUrl: 'https://docs.sendgrid.com/',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CRM and marketing automation',
    icon: <Users className="w-5 h-5" />,
    category: 'marketing',
    fields: [
      { key: 'api_key', label: 'Private App Token', placeholder: 'pat-na1-xxxxxxxx', type: 'password' },
    ],
    docUrl: 'https://developers.hubspot.com/',
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Schedule client consultations',
    icon: <Calendar className="w-5 h-5" />,
    category: 'automation',
    fields: [
      { key: 'url', label: 'Calendly URL', placeholder: 'https://calendly.com/yourcompany' },
    ],
    docUrl: 'https://calendly.com',
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: 'Track user behavior and conversions',
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'analytics',
    fields: [
      { key: 'tracking_id', label: 'Measurement ID', placeholder: 'G-XXXXXXXXXX' },
    ],
    docUrl: 'https://analytics.google.com',
  },
  {
    id: 'facebook_pixel',
    name: 'Facebook Pixel',
    description: 'Track conversions and retarget ads',
    icon: <Facebook className="w-5 h-5" />,
    category: 'analytics',
    fields: [
      { key: 'pixel_id', label: 'Pixel ID', placeholder: '1234567890123456' },
    ],
    docUrl: 'https://www.facebook.com/business/tools/meta-pixel',
  },
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Live chat and customer messaging',
    icon: <MessageCircle className="w-5 h-5" />,
    category: 'support',
    fields: [
      { key: 'app_id', label: 'App ID', placeholder: 'xxxxxxxx' },
    ],
    docUrl: 'https://www.intercom.com/',
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Help desk and ticketing system',
    icon: <Headphones className="w-5 h-5" />,
    category: 'support',
    fields: [
      { key: 'subdomain', label: 'Subdomain', placeholder: 'yourcompany' },
      { key: 'api_token', label: 'API Token', placeholder: 'xxxxxxxx', type: 'password' },
    ],
    docUrl: 'https://www.zendesk.com/',
  },
];

const categoryLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  payments: { label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  marketing: { label: 'Marketing & CRM', icon: <Users className="w-4 h-4" /> },
  communication: { label: 'Communication', icon: <MessageSquare className="w-4 h-4" /> },
  analytics: { label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  support: { label: 'Customer Support', icon: <Headphones className="w-4 h-4" /> },
  automation: { label: 'Automation', icon: <Zap className="w-4 h-4" /> },
};

export function IntegrationSettings({ formData, onChange }: IntegrationSettingsProps) {
  const [expandedIntegration, setExpandedIntegration] = useState<string | null>(null);
  
  const currentIntegrations: Integrations = formData.integrations || {};

  const updateIntegration = (
    integrationId: keyof Integrations,
    field: keyof IntegrationConfig,
    value: IntegrationConfig[keyof IntegrationConfig]
  ) => {
    const updatedIntegrations: Integrations = {
      ...currentIntegrations,
      [integrationId]: {
        ...(currentIntegrations[integrationId] || {}),
        [field]: value,
      },
    };
    onChange('integrations', updatedIntegrations);
  };

  const getIntegrationStatus = (integrationId: keyof Integrations): 'connected' | 'configured' | 'not_configured' => {
    const integration = currentIntegrations[integrationId];
    if (!integration || !integration.enabled) return 'not_configured';
    
    const integrationDef = integrations.find(i => i.id === integrationId);
    if (!integrationDef) return 'not_configured';
    
    const hasAllFields = integrationDef.fields.every((f) => integration[f.key as keyof IntegrationConfig]);
    return hasAllFields ? 'connected' : 'configured';
  };

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  const connectedCount = integrations.filter(i => getIntegrationStatus(i.id as keyof Integrations) === 'connected').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Platform Integrations
            </span>
            <Badge variant="outline" className="text-xs">
              {connectedCount} / {integrations.length} Connected
            </Badge>
          </CardTitle>
          <CardDescription>
            Connect third-party services to extend your platform's capabilities. Your clients will see these integrations as part of your branded experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {categoryLabels[category]?.icon}
                {categoryLabels[category]?.label}
              </div>
              
              <div className="grid gap-3">
                {categoryIntegrations.map((integration) => {
                  const status = getIntegrationStatus(integration.id as keyof Integrations);
                  const isExpanded = expandedIntegration === integration.id;
                  const integrationData: IntegrationConfig =
                    currentIntegrations[integration.id as keyof Integrations] || { enabled: false };
                  
                  return (
                    <Collapsible
                      key={integration.id}
                      open={isExpanded}
                      onOpenChange={() => setExpandedIntegration(isExpanded ? null : integration.id)}
                    >
                      <div className="border rounded-lg overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${status === 'connected' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                                {integration.icon}
                              </div>
                              <div className="text-left">
                                <div className="font-medium flex items-center gap-2">
                                  {integration.name}
                                  {status === 'connected' && (
                                    <Badge variant="default" className="text-[10px] py-0">
                                      <Check className="w-3 h-3 mr-1" />
                                      Connected
                                    </Badge>
                                  )}
                                  {status === 'configured' && (
                                    <Badge variant="secondary" className="text-[10px] py-0">
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                      Incomplete
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{integration.description}</p>
                              </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="px-4 pb-4 space-y-4 border-t pt-4 bg-muted/30">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Enable Integration</Label>
                              <Switch
                                checked={integrationData.enabled || false}
                                onCheckedChange={(checked) => updateIntegration(
                                  integration.id as keyof Integrations,
                                  'enabled',
                                  checked
                                )}
                              />
                            </div>
                            
                            {integrationData.enabled && (
                              <>
                                <Separator />
                                <div className="space-y-3">
                                  {integration.fields.map((field) => (
                                    <div key={field.key} className="space-y-1.5">
                                      <Label htmlFor={`${integration.id}-${field.key}`} className="text-sm">
                                        {field.label}
                                      </Label>
                                      <Input
                                        id={`${integration.id}-${field.key}`}
                                        type={field.type || 'text'}
                                        value={integrationData[field.key] || ''}
                                        onChange={(e) => updateIntegration(
                                          integration.id as keyof Integrations,
                                          field.key as keyof IntegrationConfig,
                                          e.target.value
                                        )}
                                        placeholder={field.placeholder}
                                        className="bg-background"
                                      />
                                    </div>
                                  ))}
                                </div>
                                
                                {integration.docUrl && (
                                  <a
                                    href={integration.docUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                  >
                                    View Documentation
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
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
