import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain,
  Target,
  Sparkles,
  TrendingUp,
  Clock,
  Calculator,
  FolderOpen,
  MessageSquare,
  CreditCard,
  BarChart3,
  Shield,
  Gauge,
  Bot,
  FileText,
} from 'lucide-react';
import { BrandSettings, EnabledFeatures } from '@/hooks/useBrandSettings';

interface FeatureToggleSettingsProps {
  formData: Partial<BrandSettings>;
  onChange: (field: keyof BrandSettings, value: BrandSettings[keyof BrandSettings]) => void;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'ai' | 'core' | 'client';
  premium?: boolean;
}

const features: Feature[] = [
  // AI Features
  {
    id: 'ai_credit_coach',
    name: 'AI Credit Coach',
    description: '24/7 intelligent chatbot for personalized credit guidance',
    icon: <Brain className="w-5 h-5" />,
    category: 'ai',
    premium: true,
  },
  {
    id: 'ai_goal_roadmap',
    name: 'AI Goal Roadmap',
    description: 'Predictive timelines and milestone tracking',
    icon: <Target className="w-5 h-5" />,
    category: 'ai',
    premium: true,
  },
  {
    id: 'ai_smart_prioritization',
    name: 'AI Smart Prioritization',
    description: 'Ranks dispute items by potential score impact',
    icon: <Sparkles className="w-5 h-5" />,
    category: 'ai',
    premium: true,
  },
  {
    id: 'ai_dispute_predictor',
    name: 'AI Dispute Predictor',
    description: 'Estimates deletion probability for each item',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'ai',
    premium: true,
  },
  {
    id: 'ai_bureau_forecaster',
    name: 'AI Bureau Forecaster',
    description: 'Predicts response timing and outcomes',
    icon: <Clock className="w-5 h-5" />,
    category: 'ai',
    premium: true,
  },
  // Core Features
  {
    id: 'score_simulator',
    name: 'Score Simulator',
    description: 'Interactive calculator for credit score projections',
    icon: <Calculator className="w-5 h-5" />,
    category: 'core',
  },
  {
    id: 'round_manager',
    name: 'Round Manager',
    description: 'Dispute cycle and round tracking system',
    icon: <Gauge className="w-5 h-5" />,
    category: 'core',
  },
  {
    id: 'document_vault',
    name: 'Document Vault',
    description: 'Secure document storage and verification',
    icon: <FolderOpen className="w-5 h-5" />,
    category: 'core',
  },
  {
    id: 'dispute_letters',
    name: 'Dispute Letter Generator',
    description: 'AI-powered dispute letter creation',
    icon: <FileText className="w-5 h-5" />,
    category: 'core',
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Business performance and outcome tracking',
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'core',
  },
  {
    id: 'compliance_logs',
    name: 'Compliance Logs',
    description: 'Activity logging for regulatory compliance',
    icon: <Shield className="w-5 h-5" />,
    category: 'core',
  },
  // Client-Facing Features
  {
    id: 'messaging',
    name: 'Client Messaging',
    description: 'Real-time messaging between clients and staff',
    icon: <MessageSquare className="w-5 h-5" />,
    category: 'client',
  },
  {
    id: 'billing',
    name: 'Client Billing',
    description: 'Invoice management and payment tracking',
    icon: <CreditCard className="w-5 h-5" />,
    category: 'client',
  },
];

const categoryLabels: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  ai: { 
    label: 'AI-Powered Features', 
    description: 'Advanced AI capabilities for intelligent credit repair',
    icon: <Bot className="w-4 h-4" /> 
  },
  core: { 
    label: 'Core Platform Features', 
    description: 'Essential tools for credit repair operations',
    icon: <Gauge className="w-4 h-4" /> 
  },
  client: { 
    label: 'Client Portal Features', 
    description: 'Features visible to your clients',
    icon: <MessageSquare className="w-4 h-4" /> 
  },
};

export function FeatureToggleSettings({ formData, onChange }: FeatureToggleSettingsProps) {
  const currentFeatures: EnabledFeatures = formData.enabled_features || {};

  const updateFeature = (featureId: keyof EnabledFeatures, enabled: boolean) => {
    const updatedFeatures: EnabledFeatures = {
      ...currentFeatures,
      [featureId]: enabled,
    };
    onChange('enabled_features', updatedFeatures);
  };

  const isFeatureEnabled = (featureId: keyof EnabledFeatures): boolean => {
    return currentFeatures[featureId] !== false;
  };

  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  const enabledCount = features.filter(f => isFeatureEnabled(f.id as keyof EnabledFeatures)).length;
  const aiEnabledCount = features.filter(f => f.category === 'ai' && isFeatureEnabled(f.id as keyof EnabledFeatures)).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Feature Management
            </span>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {enabledCount} / {features.length} Active
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Brain className="w-3 h-3 mr-1" />
                {aiEnabledCount} AI Features
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Control which features are available on your platform. Disabled features will be hidden from your clients and staff.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.entries(groupedFeatures).map(([category, categoryFeatures], index) => (
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
              
              <div className="grid gap-4 sm:grid-cols-2">
                {categoryFeatures.map((feature) => {
                  const enabled = isFeatureEnabled(feature.id as keyof EnabledFeatures);
                  
                  return (
                    <div
                      key={feature.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        enabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {feature.icon}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={feature.id} className="font-medium cursor-pointer">
                                {feature.name}
                              </Label>
                              {feature.premium && (
                                <Badge variant="secondary" className="text-[10px] py-0">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={feature.id}
                          checked={enabled}
                          onCheckedChange={(checked) => updateFeature(feature.id as keyof EnabledFeatures, checked)}
                        />
                      </div>
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
