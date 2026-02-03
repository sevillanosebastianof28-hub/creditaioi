import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

  useEffect(() => {
    const fetchBrand = async () => {
      // First check if there's a subdomain parameter for white-labeling
      const urlParams = new URLSearchParams(window.location.search);
      const subdomainParam = urlParams.get('subdomain');
      
      console.log('🎨 BrandProvider: Checking for subdomain...', { subdomainParam, url: window.location.href });
      
      if (subdomainParam) {
        // Fetch white-label config from subdomain
        console.log('🔍 BrandProvider: Fetching white-label config for subdomain:', subdomainParam);
        try {
          const { data, error } = await supabase
            .rpc('get_brand_settings_by_subdomain', { p_subdomain: subdomainParam });
          
          console.log('📦 BrandProvider: Got white-label data:', { data, error });
          
          if (!error && data && data.length > 0) {
            const configData = data[0];
            const brandData: BrandSettings = {
              company_name: configData.company_name || 'Credit AI',
              logo_url: configData.logo_url || undefined,
              favicon_url: configData.favicon_url || undefined,
              primary_color: configData.primary_color || '142 76% 36%',
              secondary_color: configData.secondary_color || '215 28% 17%',
              accent_color: configData.accent_color || '142 71% 45%',
              support_email: configData.support_email || undefined,
              support_phone: configData.support_phone || undefined,
              footer_text: configData.footer_text || undefined,
              login_background_url: configData.login_background_url || undefined,
              login_tagline: configData.login_tagline || undefined,
              terms_url: configData.terms_url || undefined,
              privacy_url: configData.privacy_url || undefined,
              hide_powered_by: configData.hide_powered_by || false,
              custom_css: configData.custom_css || undefined,
              welcome_message: configData.welcome_message || undefined,
              sidebar_style: configData.sidebar_style || 'default',
              button_style: configData.button_style || 'rounded',
            };
            
            console.log('✅ BrandProvider: Applying white-label branding:', brandData);
            setBrand(brandData);
            applyBrandColors(brandData.primary_color, brandData.secondary_color, brandData.accent_color);
            applyCustomCSS(brandData.custom_css);
            
            if (brandData.favicon_url) {
              updateFavicon(brandData.favicon_url);
            }
            
            if (brandData.company_name) {
              document.title = brandData.company_name;
            }
            
            applyButtonStyle(brandData.button_style);
            setIsLoading(false);
            return;
          } else {
            console.warn('⚠️ BrandProvider: No white-label config found for subdomain:', subdomainParam);
          }
        } catch (error) {
          console.error('❌ BrandProvider: Error fetching white-label config:', error);
        }
      }
              hide_powered_by: configData.hide_powered_by || false,
              custom_css: configData.custom_css || undefined,
              welcome_message: configData.welcome_message || undefined,
              sidebar_style: configData.sidebar_style || 'default',
              button_style: configData.button_style || 'rounded',
            };
            
            setBrand(brandData);
            applyBrandColors(brandData.primary_color, brandData.secondary_color, brandData.accent_color);
            applyCustomCSS(brandData.custom_css);
            
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
        } catch (error) {
          console.error('Error fetching white-label config:', error);
        }
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
  }, [profile?.agency_id]);
  
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
