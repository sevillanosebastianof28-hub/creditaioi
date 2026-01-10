import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  // New white-label fields
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
          // New fields
          login_background_url: (data as any).login_background_url || undefined,
          login_tagline: (data as any).login_tagline || undefined,
          email_header_logo_url: (data as any).email_header_logo_url || undefined,
          email_footer_text: (data as any).email_footer_text || undefined,
          terms_url: (data as any).terms_url || undefined,
          privacy_url: (data as any).privacy_url || undefined,
          hide_powered_by: (data as any).hide_powered_by || false,
          custom_css: (data as any).custom_css || undefined,
          welcome_message: (data as any).welcome_message || undefined,
          sidebar_style: (data as any).sidebar_style || 'default',
          button_style: (data as any).button_style || 'rounded',
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
