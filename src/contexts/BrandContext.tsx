import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubdomainDetection } from '@/hooks/useSubdomainDetection';

interface BrandSettings {
  company_name: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  support_email?: string;
  support_phone?: string;
  footer_text?: string;
  login_background_url?: string;
  login_tagline?: string;
  terms_url?: string;
  privacy_url?: string;
  hide_powered_by?: boolean;
  custom_css?: string;
  welcome_message?: string;
  sidebar_style?: string;
  button_style?: string;
}

interface BrandContextType {
  brand: BrandSettings;
  isLoading: boolean;
}

const defaultBrand: BrandSettings = {
  company_name: 'Credit AI',
  primary_color: '142 76% 36%',
  secondary_color: '215 28% 17%',
  accent_color: '142 71% 45%',
  hide_powered_by: false,
  sidebar_style: 'default',
  button_style: 'rounded',
};

const BrandContext = createContext<BrandContextType>({
  brand: defaultBrand,
  isLoading: true,
});

export const useBrand = () => useContext(BrandContext);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<BrandSettings>(defaultBrand);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  const { isWhiteLabeled, config: whiteLabelConfig, isLoading: subdomainLoading } = useSubdomainDetection();

  useEffect(() => {
    const fetchBrand = async () => {
      // Prioritize white-label config if viewing via subdomain parameter
      if (isWhiteLabeled && whiteLabelConfig && !subdomainLoading) {
        const brandData: BrandSettings = {
          company_name: whiteLabelConfig.company_name || 'Credit AI',
          logo_url: whiteLabelConfig.logo_url,
          favicon_url: whiteLabelConfig.favicon_url,
          primary_color: whiteLabelConfig.primary_color || '142 76% 36%',
          secondary_color: whiteLabelConfig.secondary_color || '215 28% 17%',
          accent_color: whiteLabelConfig.accent_color || '142 71% 45%',
          support_email: whiteLabelConfig.support_email,
          support_phone: whiteLabelConfig.support_phone,
          footer_text: whiteLabelConfig.footer_text,
          login_background_url: whiteLabelConfig.login_background_url,
          login_tagline: whiteLabelConfig.login_tagline,
          terms_url: whiteLabelConfig.terms_url,
          privacy_url: whiteLabelConfig.privacy_url,
          hide_powered_by: whiteLabelConfig.hide_powered_by || false,
          custom_css: undefined,
          welcome_message: whiteLabelConfig.welcome_message,
          sidebar_style: 'default',
          button_style: whiteLabelConfig.button_style || 'rounded',
        };
        
        setBrand(brandData);
        applyBrandColors(brandData.primary_color, brandData.secondary_color, brandData.accent_color);
        
        if (brandData.favicon_url) {
          updateFavicon(brandData.favicon_url);
        }
        
        if (brandData.company_name) {
          document.title = brandData.company_name;
        }
        
        applyButtonStyle(brandData.button_style);
        setIsLoading(false);
        return;
      }
      
      if (!profile?.agency_id) {
        setBrand(defaultBrand);
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
          const brandData: BrandSettings = {
            company_name: data.company_name || 'Credit AI',
            logo_url: data.logo_url || undefined,
            favicon_url: data.favicon_url || undefined,
            primary_color: data.primary_color || '142 76% 36%',
            secondary_color: data.secondary_color || '215 28% 17%',
            accent_color: data.accent_color || '142 71% 45%',
            support_email: data.support_email || undefined,
            support_phone: data.support_phone || undefined,
            footer_text: data.footer_text || undefined,
            login_background_url: (data as any).login_background_url || undefined,
            login_tagline: (data as any).login_tagline || undefined,
            terms_url: (data as any).terms_url || undefined,
            privacy_url: (data as any).privacy_url || undefined,
            hide_powered_by: (data as any).hide_powered_by || false,
            custom_css: (data as any).custom_css || undefined,
            welcome_message: (data as any).welcome_message || undefined,
            sidebar_style: (data as any).sidebar_style || 'default',
            button_style: (data as any).button_style || 'rounded',
          };

          setBrand(brandData);

          // Apply custom CSS variables
          applyBrandColors(data.primary_color, data.secondary_color, data.accent_color);

          // Apply custom CSS
          applyCustomCSS(brandData.custom_css);

          // Update favicon if custom
          if (data.favicon_url) {
            updateFavicon(data.favicon_url);
          }

          // Update document title
          if (data.company_name) {
            document.title = data.company_name;
          }

          // Apply button style class
          applyButtonStyle(brandData.button_style);
        }
      } catch (error) {
        console.error('Error fetching brand settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrand();
  }, [profile?.agency_id, isWhiteLabeled, whiteLabelConfig, subdomainLoading]);
  
  useEffect(() => {
    // Set up real-time subscription for brand settings updates
    if (profile?.agency_id) {
      const channel = supabase
        .channel(`brand_settings_${profile.agency_id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'brand_settings',
            filter: `agency_id=eq.${profile.agency_id}`,
          },
          (payload) => {
            console.log('Brand settings changed (real-time):', payload);
            
            // Handle UPDATE and INSERT events
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              const data = payload.new as any;
              const brandData: BrandSettings = {
                company_name: data.company_name || 'Credit AI',
                logo_url: data.logo_url || undefined,
                favicon_url: data.favicon_url || undefined,
                primary_color: data.primary_color || '142 76% 36%',
                secondary_color: data.secondary_color || '215 28% 17%',
                accent_color: data.accent_color || '142 71% 45%',
                support_email: data.support_email || undefined,
                support_phone: data.support_phone || undefined,
                footer_text: data.footer_text || undefined,
                login_background_url: data.login_background_url || undefined,
                login_tagline: data.login_tagline || undefined,
                terms_url: data.terms_url || undefined,
                privacy_url: data.privacy_url || undefined,
                hide_powered_by: data.hide_powered_by || false,
                custom_css: data.custom_css || undefined,
                welcome_message: data.welcome_message || undefined,
                sidebar_style: data.sidebar_style || 'default',
                button_style: data.button_style || 'rounded',
              };

              setBrand(brandData);

              // Apply changes in real-time
              applyBrandColors(data.primary_color, data.secondary_color, data.accent_color);
              applyCustomCSS(brandData.custom_css);
              
              if (data.favicon_url) {
                updateFavicon(data.favicon_url);
              }
              
              if (data.company_name) {
                document.title = data.company_name;
              }
              
              applyButtonStyle(brandData.button_style);
            }
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        console.log('Cleaning up brand settings realtime subscription (context)');
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.agency_id]);

  return (
    <BrandContext.Provider value={{ brand, isLoading }}>
      {children}
    </BrandContext.Provider>
  );
}

function applyBrandColors(primary?: string | null, secondary?: string | null, accent?: string | null) {
  const root = document.documentElement;

  if (primary) {
    root.style.setProperty('--primary', primary);
  }
  if (secondary) {
    root.style.setProperty('--secondary', secondary);
  }
  if (accent) {
    root.style.setProperty('--accent', accent);
  }
}

function applyCustomCSS(css?: string) {
  // Remove existing custom CSS
  const existingStyle = document.getElementById('brand-custom-css');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Add new custom CSS if provided
  if (css) {
    const style = document.createElement('style');
    style.id = 'brand-custom-css';
    style.textContent = css;
    document.head.appendChild(style);
  }
}

function applyButtonStyle(style?: string) {
  const root = document.documentElement;
  
  // Remove existing button style classes
  root.classList.remove('button-rounded', 'button-square', 'button-pill');
  
  // Add new button style class
  if (style) {
    root.classList.add(`button-${style}`);
  }
}

function updateFavicon(faviconUrl: string) {
  const existingLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (existingLink) {
    existingLink.href = faviconUrl;
  } else {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = faviconUrl;
    document.head.appendChild(link);
  }
}
