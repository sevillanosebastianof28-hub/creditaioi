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
  // ALWAYS check URL params first - this works on all domains
  const urlParams = new URLSearchParams(window.location.search);
  const subdomainParam = urlParams.get('subdomain');
  if (subdomainParam) {
    return subdomainParam;
  }
  
  const hostname = window.location.hostname;
  
  // Handle localhost development - check params only
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // For credit-ai.online main domain, rely on URL parameter
  if (hostname === 'credit-ai.online' || hostname === 'www.credit-ai.online') {
    return null;
  }
  
  // Handle credit-ai.online subdomains if they exist in the future
  // Expected format: subdomain.credit-ai.online
  if (hostname.endsWith('.credit-ai.online')) {
    const parts = hostname.split('.');
    // parts would be ['subdomain', 'credit-ai', 'online']
    if (parts.length >= 3) {
      const firstPart = parts[0];
      // Skip common non-white-label subdomains
      if (['www', 'app', 'api', 'admin', 'dashboard'].includes(firstPart)) {
        return null;
      }
      return firstPart;
    }
  }
  
  // Skip Lovable preview/staging domains - these should NOT auto-detect subdomains
  if (hostname.includes('lovable.app') || hostname.includes('lovable.dev')) {
    return null;
  }
  
  // Handle other production subdomains (generic pattern) - for future custom domains
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
    // Skip if no subdomain - set loading false immediately
    if (!subdomain) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Use the database function to get white-label config with agency_id in one query
      const { data, error: fetchError } = await supabase
        .rpc('get_brand_settings_by_subdomain', { p_subdomain: subdomain });
      
      if (fetchError) throw fetchError;
      
      if (data && data.length > 0) {
        const configData = data[0];
        const newConfig: WhiteLabelConfig = {
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
        
        setConfig(newConfig);
        
        // Get agency_id in parallel - don't wait for it to set config
        supabase
          .from('brand_settings')
          .select('agency_id')
          .eq('subdomain', subdomain)
          .single()
          .then(({ data: brandData }) => {
            if (brandData?.agency_id) {
              setAgencyId(brandData.agency_id);
            }
          });
      } else {
        // No config found - don't set error, just mark as not white-labeled
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error('Error fetching white-label config:', err);
      // Don't set error for missing config - it's expected on main domain
    } finally {
      setIsLoading(false);
    }
  }, [subdomain]);
  
  useEffect(() => {
    fetchWhiteLabelConfig();
  }, [subdomain]);
  
  useEffect(() => {
    // Set up real-time subscription for white-label updates
    // We subscribe to ALL brand_settings changes, not just the current subdomain
    // This allows us to detect when a subdomain is being set or changed
    const channel = supabase
      .channel('whitelabel_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'brand_settings',
        },
        (payload) => {
          console.log('Brand settings changed (white-label):', payload);
          
          // Handle UPDATE and INSERT events
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const configData = payload.new as any;
            
            // Check if this change is for the current subdomain
            const isCurrentSubdomain = subdomain && configData.subdomain === subdomain;
            
            // Or if we're watching a specific subdomain that was just set
            const subdomainJustSet = configData.subdomain && 
                                     !subdomain && 
                                     window.location.search.includes(`subdomain=${configData.subdomain}`);
            
            if (isCurrentSubdomain || subdomainJustSet) {
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
              console.log('Applying white-label config in real-time:', updatedConfig);
              applyWhiteLabelConfig(updatedConfig);
            }
          }
          
          // Handle DELETE events
          if (payload.eventType === 'DELETE') {
            const oldData = payload.old as any;
            if (subdomain && oldData.subdomain === subdomain) {
              setConfig(null);
              setAgencyId(null);
              setError('White-label configuration removed');
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up whitelabel realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [subdomain]); // Only depend on subdomain, not fetchWhiteLabelConfig
  
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
