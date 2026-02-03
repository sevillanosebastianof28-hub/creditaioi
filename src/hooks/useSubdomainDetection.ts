import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WhiteLabelConfig {
  id: string;
  company_name: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  support_email?: string;
  support_phone?: string;
  footer_text?: string;
  login_background_url?: string;
  login_tagline?: string;
  terms_url?: string;
  privacy_url?: string;
  hide_powered_by?: boolean;
  welcome_message?: string;
  button_style?: string;
  enabled_features?: Record<string, boolean>;
  client_portal_config?: Record<string, boolean>;
}

interface SubdomainDetectionResult {
  isWhiteLabeled: boolean;
  subdomain: string | null;
  config: WhiteLabelConfig | null;
  isLoading: boolean;
  error: string | null;
  agencyId: string | null;
}

// Get subdomain from current URL
function extractSubdomain(): string | null {
  const hostname = window.location.hostname;
  
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check URL params for testing subdomain
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('subdomain');
  }
  
  // Handle production subdomains
  // Expected format: subdomain.yourdomain.com or subdomain.lovable.app
  const parts = hostname.split('.');
  
  // Skip if it's a direct domain (no subdomain)
  if (parts.length < 3) {
    return null;
  }
  
  // Skip common non-white-label subdomains
  const firstPart = parts[0];
  if (['www', 'app', 'api', 'admin', 'dashboard'].includes(firstPart)) {
    return null;
  }
  
  return firstPart;
}

export function useSubdomainDetection(): SubdomainDetectionResult {
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<WhiteLabelConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  
  const subdomain = extractSubdomain();
  
  const fetchWhiteLabelConfig = useCallback(async () => {
    if (!subdomain) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Use the database function to get white-label config
      const { data, error: fetchError } = await supabase
        .rpc('get_brand_settings_by_subdomain', { p_subdomain: subdomain });
      
      if (fetchError) throw fetchError;
      
      if (data && data.length > 0) {
        const configData = data[0];
        setConfig({
          id: configData.id,
          company_name: configData.company_name,
          logo_url: configData.logo_url || undefined,
          favicon_url: configData.favicon_url || undefined,
          primary_color: configData.primary_color || undefined,
          secondary_color: configData.secondary_color || undefined,
          accent_color: configData.accent_color || undefined,
          support_email: configData.support_email || undefined,
          support_phone: configData.support_phone || undefined,
          footer_text: configData.footer_text || undefined,
          login_background_url: configData.login_background_url || undefined,
          login_tagline: configData.login_tagline || undefined,
          terms_url: configData.terms_url || undefined,
          privacy_url: configData.privacy_url || undefined,
          hide_powered_by: configData.hide_powered_by || false,
          welcome_message: configData.welcome_message || undefined,
          button_style: configData.button_style || undefined,
          enabled_features: configData.enabled_features as Record<string, boolean> || undefined,
          client_portal_config: configData.client_portal_config as Record<string, boolean> || undefined,
        });
        
        // Get agency_id from brand_settings for client registration
        const { data: brandData } = await supabase
          .from('brand_settings')
          .select('agency_id')
          .eq('subdomain', subdomain)
          .single();
        
        if (brandData?.agency_id) {
          setAgencyId(brandData.agency_id);
        }
      } else {
        setError('White-label configuration not found');
      }
    } catch (err) {
      console.error('Error fetching white-label config:', err);
      setError('Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  }, [subdomain]);
  
  useEffect(() => {
    fetchWhiteLabelConfig();

    // Set up real-time subscription for subdomain white-label updates
    if (subdomain) {
      const channel = supabase
        .channel(`subdomain_${subdomain}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'brand_settings',
            filter: `subdomain=eq.${subdomain}`,
          },
          (payload) => {
            console.log('Subdomain white-label config changed:', payload);
            
            // Handle UPDATE and INSERT events
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              const configData = payload.new as any;
              const updatedConfig: WhiteLabelConfig = {
                id: configData.id,
                company_name: configData.company_name,
                logo_url: configData.logo_url || undefined,
                favicon_url: configData.favicon_url || undefined,
                primary_color: configData.primary_color || undefined,
                secondary_color: configData.secondary_color || undefined,
                accent_color: configData.accent_color || undefined,
                support_email: configData.support_email || undefined,
                support_phone: configData.support_phone || undefined,
                footer_text: configData.footer_text || undefined,
                login_background_url: configData.login_background_url || undefined,
                login_tagline: configData.login_tagline || undefined,
                terms_url: configData.terms_url || undefined,
                privacy_url: configData.privacy_url || undefined,
                hide_powered_by: configData.hide_powered_by || false,
                welcome_message: configData.welcome_message || undefined,
                button_style: configData.button_style || undefined,
                enabled_features: configData.enabled_features as Record<string, boolean> || undefined,
                client_portal_config: configData.client_portal_config as Record<string, boolean> || undefined,
              };

              setConfig(updatedConfig);
              
              if (configData.agency_id) {
                setAgencyId(configData.agency_id);
              }

              // Apply the updated config immediately
              applyWhiteLabelConfig(updatedConfig);
            }
            
            // Handle DELETE events
            if (payload.eventType === 'DELETE') {
              setConfig(null);
              setAgencyId(null);
              setError('White-label configuration removed');
            }
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchWhiteLabelConfig, subdomain]);
  
  return {
    isWhiteLabeled: !!subdomain && !!config,
    subdomain,
    config,
    isLoading,
    error,
    agencyId,
  };
}

// Apply white-label config to the DOM
export function applyWhiteLabelConfig(config: WhiteLabelConfig) {
  const root = document.documentElement;
  
  // Apply colors
  if (config.primary_color) {
    root.style.setProperty('--primary', config.primary_color);
  }
  if (config.secondary_color) {
    root.style.setProperty('--secondary', config.secondary_color);
  }
  if (config.accent_color) {
    root.style.setProperty('--accent', config.accent_color);
  }
  
  // Apply favicon
  if (config.favicon_url) {
    const existingFavicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (existingFavicon) {
      existingFavicon.href = config.favicon_url;
    } else {
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = config.favicon_url;
      document.head.appendChild(favicon);
    }
  }
  
  // Apply document title
  if (config.company_name) {
    document.title = config.company_name;
  }
  
  // Apply button style
  if (config.button_style) {
    root.setAttribute('data-button-style', config.button_style);
  }
}
