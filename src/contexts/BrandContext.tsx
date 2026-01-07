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
          setBrand({
            company_name: data.company_name || 'Credit AI',
            logo_url: data.logo_url || undefined,
            favicon_url: data.favicon_url || undefined,
            primary_color: data.primary_color || '142 76% 36%',
            secondary_color: data.secondary_color || '215 28% 17%',
            accent_color: data.accent_color || '142 71% 45%',
            support_email: data.support_email || undefined,
            support_phone: data.support_phone || undefined,
            footer_text: data.footer_text || undefined,
          });

          // Apply custom CSS variables
          applyBrandColors(data.primary_color, data.secondary_color, data.accent_color);

          // Update favicon if custom
          if (data.favicon_url) {
            updateFavicon(data.favicon_url);
          }

          // Update document title
          if (data.company_name) {
            document.title = data.company_name;
          }
        }
      } catch (error) {
        console.error('Error fetching brand settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrand();
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
