import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface IntegrationConfig {
  enabled: boolean;
  api_key?: string | null;
  webhook_url?: string | null;
  list_id?: string | null;
  account_sid?: string | null;
  auth_token?: string | null;
  phone_number?: string | null;
  app_id?: string | null;
  subdomain?: string | null;
  tracking_id?: string | null;
  pixel_id?: string | null;
  url?: string | null;
  publishable_key?: string | null;
  api_token?: string | null;
}

export interface EnabledFeatures {
  ai_credit_coach?: boolean;
  ai_goal_roadmap?: boolean;
  ai_smart_prioritization?: boolean;
  ai_dispute_predictor?: boolean;
  ai_bureau_forecaster?: boolean;
  score_simulator?: boolean;
  round_manager?: boolean;
  document_vault?: boolean;
  messaging?: boolean;
  billing?: boolean;
  analytics?: boolean;
  compliance_logs?: boolean;
  dispute_letters?: boolean;
}

export interface ClientPortalConfig {
  show_scores?: boolean;
  show_disputes?: boolean;
  show_documents?: boolean;
  show_billing?: boolean;
  show_messages?: boolean;
  show_ai_tools?: boolean;
  show_progress?: boolean;
  allow_document_upload?: boolean;
  allow_dispute_requests?: boolean;
}

export interface NotificationSettingsConfig {
  email_notifications?: boolean;
  sms_notifications?: boolean;
  score_change_alerts?: boolean;
  dispute_updates?: boolean;
  billing_reminders?: boolean;
  marketing_emails?: boolean;
}

export interface SubscriptionFeatures {
  max_clients?: number | null;
  max_staff?: number | null;
  max_disputes_per_month?: number | null;
  white_label_enabled?: boolean;
  api_access?: boolean;
  priority_support?: boolean;
  custom_integrations?: boolean;
}

export interface Integrations {
  stripe?: IntegrationConfig;
  zapier?: IntegrationConfig;
  mailchimp?: IntegrationConfig;
  twilio?: IntegrationConfig;
  sendgrid?: IntegrationConfig;
  hubspot?: IntegrationConfig;
  calendly?: IntegrationConfig;
  google_analytics?: IntegrationConfig;
  facebook_pixel?: IntegrationConfig;
  intercom?: IntegrationConfig;
  zendesk?: IntegrationConfig;
}

export interface BrandSettings {
  id?: string;
  agency_id?: string;
  company_name: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  custom_domain?: string;
  support_email?: string;
  support_phone?: string;
  footer_text?: string;
  // White-label fields
  login_background_url?: string;
  login_tagline?: string;
  email_header_logo_url?: string;
  email_footer_text?: string;
  terms_url?: string;
  privacy_url?: string;
  hide_powered_by?: boolean;
  custom_css?: string;
  welcome_message?: string;
  sidebar_style?: 'default' | 'minimal' | 'expanded';
  button_style?: 'rounded' | 'square' | 'pill';
  // Platform configuration
  enabled_features?: EnabledFeatures;
  integrations?: Integrations;
  client_portal_config?: ClientPortalConfig;
  notification_settings?: NotificationSettingsConfig;
  subscription_features?: SubscriptionFeatures;
  // Subdomain / multi-tenant
  subdomain?: string;
  is_published?: boolean;
  published_at?: string;
}

const defaultBrandSettings: BrandSettings = {
  company_name: 'Credit AI',
  primary_color: '142 76% 36%',
  secondary_color: '215 28% 17%',
  accent_color: '142 71% 45%',
  hide_powered_by: false,
  sidebar_style: 'default',
  button_style: 'rounded',
};

export function useBrandSettings() {
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(defaultBrandSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user, profile } = useAuth();

  const fetchBrandSettings = useCallback(async () => {
    if (!user || !profile?.agency_id) {
      setBrandSettings(defaultBrandSettings);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('brand_settings')
        .select('*')
        .eq('agency_id', profile.agency_id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const dbData = data as any;
        setBrandSettings({
          id: data.id,
          agency_id: data.agency_id || undefined,
          company_name: data.company_name,
          logo_url: data.logo_url || undefined,
          favicon_url: data.favicon_url || undefined,
          primary_color: data.primary_color || '142 76% 36%',
          secondary_color: data.secondary_color || '215 28% 17%',
          accent_color: data.accent_color || '142 71% 45%',
          custom_domain: data.custom_domain || undefined,
          support_email: data.support_email || undefined,
          support_phone: data.support_phone || undefined,
          footer_text: data.footer_text || undefined,
          // White-label fields
          login_background_url: dbData.login_background_url || undefined,
          login_tagline: dbData.login_tagline || undefined,
          email_header_logo_url: dbData.email_header_logo_url || undefined,
          email_footer_text: dbData.email_footer_text || undefined,
          terms_url: dbData.terms_url || undefined,
          privacy_url: dbData.privacy_url || undefined,
          hide_powered_by: dbData.hide_powered_by || false,
          custom_css: dbData.custom_css || undefined,
          welcome_message: dbData.welcome_message || undefined,
          sidebar_style: dbData.sidebar_style || 'default',
          button_style: dbData.button_style || 'rounded',
          // Platform configuration
          enabled_features: dbData.enabled_features || undefined,
          integrations: dbData.integrations || undefined,
          client_portal_config: dbData.client_portal_config || undefined,
          notification_settings: dbData.notification_settings || undefined,
          subscription_features: dbData.subscription_features || undefined,
          // Subdomain / multi-tenant
          subdomain: dbData.subdomain || undefined,
          is_published: dbData.is_published || false,
          published_at: dbData.published_at || undefined,
        });
      }
    } catch (error) {
      console.error('Error fetching brand settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, profile?.agency_id]);

  const saveBrandSettings = async (settings: Partial<BrandSettings>) => {
    if (!user || !profile?.agency_id) {
      toast.error('You must be logged in as a business owner');
      return false;
    }

    setIsSaving(true);
    try {
      const updatedSettings = { ...brandSettings, ...settings };

      const payload = {
        company_name: updatedSettings.company_name,
        logo_url: updatedSettings.logo_url,
        favicon_url: updatedSettings.favicon_url,
        primary_color: updatedSettings.primary_color,
        secondary_color: updatedSettings.secondary_color,
        accent_color: updatedSettings.accent_color,
        custom_domain: updatedSettings.custom_domain,
        support_email: updatedSettings.support_email,
        support_phone: updatedSettings.support_phone,
        footer_text: updatedSettings.footer_text,
        login_background_url: updatedSettings.login_background_url,
        login_tagline: updatedSettings.login_tagline,
        email_header_logo_url: updatedSettings.email_header_logo_url,
        email_footer_text: updatedSettings.email_footer_text,
        terms_url: updatedSettings.terms_url,
        privacy_url: updatedSettings.privacy_url,
        hide_powered_by: updatedSettings.hide_powered_by,
        custom_css: updatedSettings.custom_css,
        welcome_message: updatedSettings.welcome_message,
        sidebar_style: updatedSettings.sidebar_style,
        button_style: updatedSettings.button_style,
        // Platform configuration
        enabled_features: updatedSettings.enabled_features,
        integrations: updatedSettings.integrations,
        client_portal_config: updatedSettings.client_portal_config,
        notification_settings: updatedSettings.notification_settings,
        subscription_features: updatedSettings.subscription_features,
        // Subdomain / multi-tenant
        subdomain: updatedSettings.subdomain,
        is_published: updatedSettings.is_published,
        published_at: updatedSettings.published_at,
      };

      if (brandSettings.id) {
        // Update existing
        const { error } = await supabase
          .from('brand_settings')
          .update(payload as any)
          .eq('id', brandSettings.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('brand_settings')
          .insert({
            agency_id: profile.agency_id,
            ...payload,
          } as any)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          updatedSettings.id = data.id;
        }
      }

      setBrandSettings(updatedSettings);
      toast.success('Brand settings saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving brand settings:', error);
      toast.error('Failed to save brand settings');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchBrandSettings();
  }, [fetchBrandSettings]);

  return {
    brandSettings,
    isLoading,
    isSaving,
    saveBrandSettings,
    refreshBrandSettings: fetchBrandSettings,
  };
}
