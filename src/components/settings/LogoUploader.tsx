import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Upload, Loader2, Image, X, Link } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LogoUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  description?: string;
  type: 'logo' | 'favicon';
}

export function LogoUploader({ label, value, onChange, description, type }: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.agency_id) return;

    // Validate file type
    const allowedTypes = type === 'logo' 
      ? ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
      : ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/svg+xml'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Invalid file type. Please upload a ${type === 'logo' ? 'PNG, JPG, SVG, or WebP' : 'PNG, ICO, or SVG'} file.`);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.agency_id}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      setUrlInput(publicUrl);
      toast.success(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlChange = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={type === 'logo' ? 'image/png,image/jpeg,image/svg+xml,image/webp' : 'image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml'}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-24 border-dashed flex flex-col gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span>Click to upload {type}</span>
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="url" className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={`https://example.com/${type}.png`}
            />
            <Button variant="outline" onClick={handleUrlChange}>
              Apply
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {value && (
        <div className="relative p-4 bg-muted rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute top-2 right-2 h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-background rounded-lg p-2 border border-border">
              <img
                src={value}
                alt={`${type} preview`}
                className={type === 'logo' ? 'h-12 object-contain max-w-32' : 'h-8 w-8 object-contain'}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Current {type}</p>
              <p className="text-xs text-muted-foreground truncate">{value}</p>
            </div>
          </div>
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
