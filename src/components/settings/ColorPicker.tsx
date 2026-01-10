import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const [hue, setHue] = useState(142);
  const [saturation, setSaturation] = useState(76);
  const [lightness, setLightness] = useState(36);
  const [isOpen, setIsOpen] = useState(false);

  // Parse HSL from value
  useEffect(() => {
    if (value) {
      const parts = value.split(' ').map(p => parseFloat(p.replace('%', '')));
      if (parts.length >= 3) {
        setHue(parts[0] || 142);
        setSaturation(parts[1] || 76);
        setLightness(parts[2] || 36);
      }
    }
  }, [value]);

  const handleChange = (h: number, s: number, l: number) => {
    const newValue = `${h} ${s}% ${l}%`;
    onChange(newValue);
  };

  const presetColors = [
    { name: 'Green', value: '142 76% 36%' },
    { name: 'Blue', value: '217 91% 60%' },
    { name: 'Purple', value: '270 76% 50%' },
    { name: 'Red', value: '0 84% 60%' },
    { name: 'Orange', value: '25 95% 53%' },
    { name: 'Teal', value: '174 84% 32%' },
    { name: 'Pink', value: '330 81% 60%' },
    { name: 'Indigo', value: '239 84% 67%' },
  ];

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-12 h-10 p-0 border-2"
              style={{ backgroundColor: `hsl(${value || '142 76% 36%'})` }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hue</span>
                  <span>{hue}°</span>
                </div>
                <Slider
                  value={[hue]}
                  onValueChange={([v]) => {
                    setHue(v);
                    handleChange(v, saturation, lightness);
                  }}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Saturation</span>
                  <span>{saturation}%</span>
                </div>
                <Slider
                  value={[saturation]}
                  onValueChange={([v]) => {
                    setSaturation(v);
                    handleChange(hue, v, lightness);
                  }}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Lightness</span>
                  <span>{lightness}%</span>
                </div>
                <Slider
                  value={[lightness]}
                  onValueChange={([v]) => {
                    setLightness(v);
                    handleChange(hue, saturation, v);
                  }}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Presets</span>
              <div className="grid grid-cols-4 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => onChange(color.value)}
                    className="w-full h-8 rounded-md border border-border hover:scale-105 transition-transform"
                    style={{ backgroundColor: `hsl(${color.value})` }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div 
              className="h-16 rounded-lg border border-border"
              style={{ backgroundColor: `hsl(${value || '142 76% 36%'})` }}
            />
          </PopoverContent>
        </Popover>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="142 76% 36%"
          className="flex-1"
        />
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
