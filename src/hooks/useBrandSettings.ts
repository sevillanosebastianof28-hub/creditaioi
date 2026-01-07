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
}

const defaultBrandSettings: BrandSettings = {
  company_name: 'Credit AI',
  primary_color: '142 76% 36%',
  secondary_color: '215 28% 17%',
  accent_color: '142 71% 45%',
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
      toast.error('You must be logged in as an agency owner');
      return false;
    }

    setIsSaving(true);
    try {
      const updatedSettings = { ...brandSettings, ...settings };

      if (brandSettings.id) {
        // Update existing
        const { error } = await supabase
          .from('brand_settings')
          .update({
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
          })
          .eq('id', brandSettings.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('brand_settings')
          .insert({
            agency_id: profile.agency_id,
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
          })
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
