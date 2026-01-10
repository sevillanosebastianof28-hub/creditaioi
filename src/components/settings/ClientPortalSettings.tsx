import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  Eye,
  EyeOff,
  TrendingUp,
  FileText,
  FolderOpen,
  CreditCard,
  MessageSquare,
  Brain,
  BarChart2,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { BrandSettings } from '@/hooks/useBrandSettings';

interface ClientPortalSettingsProps {
  formData: Partial<BrandSettings>;
  onChange: (field: keyof BrandSettings, value: any) => void;
}

interface PortalOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'visibility' | 'permissions';
}

const portalOptions: PortalOption[] = [
  // Visibility options
  {
    id: 'show_scores',
    name: 'Credit Scores',
    description: 'Display credit scores from all three bureaus',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'visibility',
  },
  {
    id: 'show_progress',
    name: 'Progress Tracking',
    description: 'Show score history and improvement charts',
    icon: <BarChart2 className="w-5 h-5" />,
    category: 'visibility',
  },
  {
    id: 'show_disputes',
    name: 'Dispute Status',
    description: 'Allow clients to view their dispute progress',
    icon: <FileText className="w-5 h-5" />,
    category: 'visibility',
  },
  {
    id: 'show_documents',
    name: 'Document Vault',
    description: 'Client access to uploaded documents',
    icon: <FolderOpen className="w-5 h-5" />,
    category: 'visibility',
  },
  {
    id: 'show_billing',
    name: 'Billing & Invoices',
    description: 'Display payment history and invoices',
    icon: <CreditCard className="w-5 h-5" />,
    category: 'visibility',
  },
  {
    id: 'show_messages',
    name: 'Messaging',
    description: 'Access to message center and communication',
    icon: <MessageSquare className="w-5 h-5" />,
    category: 'visibility',
  },
  {
    id: 'show_ai_tools',
    name: 'AI Tools',
    description: 'Access to AI Credit Coach and other AI features',
    icon: <Brain className="w-5 h-5" />,
    category: 'visibility',
  },
  // Permission options
  {
    id: 'allow_document_upload',
    name: 'Document Upload',
    description: 'Allow clients to upload their own documents',
    icon: <Upload className="w-5 h-5" />,
    category: 'permissions',
  },
  {
    id: 'allow_dispute_requests',
    name: 'Dispute Requests',
    description: 'Allow clients to request new dispute items',
    icon: <AlertTriangle className="w-5 h-5" />,
    category: 'permissions',
  },
];

const categoryLabels: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  visibility: { 
    label: 'Portal Visibility', 
    description: 'Control what sections clients can see in their portal',
    icon: <Eye className="w-4 h-4" /> 
  },
  permissions: { 
    label: 'Client Permissions', 
    description: 'Control what actions clients can take',
    icon: <Users className="w-4 h-4" /> 
  },
};

export function ClientPortalSettings({ formData, onChange }: ClientPortalSettingsProps) {
  const currentConfig = formData.client_portal_config || {};

  const updateConfig = (optionId: string, enabled: boolean) => {
    const updatedConfig = {
      ...currentConfig,
      [optionId]: enabled,
    };
    onChange('client_portal_config', updatedConfig);
  };

  const isEnabled = (optionId: string): boolean => {
    return (currentConfig as any)[optionId] !== false;
  };

  const groupedOptions = portalOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, PortalOption[]>);

  const visibleCount = portalOptions.filter(o => o.category === 'visibility' && isEnabled(o.id)).length;
  const totalVisibility = portalOptions.filter(o => o.category === 'visibility').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Client Portal Configuration
            </span>
            <Badge variant="outline" className="text-xs">
              {visibleCount} / {totalVisibility} Sections Visible
            </Badge>
          </CardTitle>
          <CardDescription>
            Customize what your clients see and can do in their portal. These settings apply to all clients using your white-labeled platform.
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
                          <Label htmlFor={option.id} className="font-medium cursor-pointer flex items-center gap-2">
                            {option.name}
                            {!enabled && (
                              <Badge variant="secondary" className="text-[10px] py-0">
                                <EyeOff className="w-3 h-3 mr-1" />
                                Hidden
                              </Badge>
                            )}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id={option.id}
                        checked={enabled}
                        onCheckedChange={(checked) => updateConfig(option.id, checked)}
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
