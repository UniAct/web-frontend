import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Palette, Save, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { UniversityService } from '../../api';
import type { UniversitySettings } from '../../api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface UniversitySettingsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (id: string | null) => void;
}

const DEFAULT_SETTINGS: UniversitySettings = {
  id: 0,
  university_id: 0,
  primary_color: '#2563eb',
  secondary_color: '#7c3aed',
  tab_name: '',
  logo_url: null,
  hero_images: [],
};

export function UniversitySettingsPage({ selectedUniversity }: UniversitySettingsPageProps) {
  const [settings, setSettings] = useState<UniversitySettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isHeroUploading, setIsHeroUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const applyBranding = (nextSettings: UniversitySettings) => {
    document.title = nextSettings.tab_name || 'UniAct';
    document.documentElement.style.setProperty('--primary', nextSettings.primary_color);
    document.documentElement.style.setProperty('--secondary', nextSettings.secondary_color);
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    UniversityService.getSettings()
      .then((data) => {
        if (!isMounted) return;
        setSettings({ ...DEFAULT_SETTINGS, ...data });
        applyBranding({ ...DEFAULT_SETTINGS, ...data });
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load settings');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedUniversity]);

  const updateField = <Key extends keyof UniversitySettings>(key: Key, value: UniversitySettings[Key]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSaveBranding = async () => {
    setIsSaving(true);
    try {
      const saved = await UniversityService.updateSettings({
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        tab_name: settings.tab_name?.trim() || null,
      });
      setSettings({ ...settings, ...saved });
      applyBranding(saved);
      toast.success('Branding saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save branding');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsLogoUploading(true);
    try {
      const logoUrl = await UniversityService.uploadLogo(file);
      setSettings((current) => ({ ...current, logo_url: logoUrl }));
      toast.success('Logo uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Logo upload failed');
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    setIsSaving(true);
    try {
      const saved = await UniversityService.updateSettings({ logo_url: null });
      setSettings((current) => ({ ...current, ...saved, logo_url: null }));
      toast.success('Logo removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove logo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleHeroSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (settings.hero_images.length >= 6) {
      toast.error('You can upload up to 6 campus images');
      return;
    }

    setIsHeroUploading(true);
    try {
      const heroImages = await UniversityService.uploadHeroImage(file);
      setSettings((current) => ({ ...current, hero_images: heroImages }));
      toast.success('Campus image uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Campus image upload failed');
    } finally {
      setIsHeroUploading(false);
    }
  };

  const handleDeleteHeroImage = async (url: string) => {
    try {
      const heroImages = await UniversityService.deleteHeroImage(url);
      setSettings((current) => ({ ...current, hero_images: heroImages }));
      toast.success('Campus image removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove image');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">University Settings</h2>
        <p className="text-slate-600 mt-1">Manage portal branding and campus life images.</p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="images">Campus Images</TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Branding
              </CardTitle>
              <CardDescription>Colors, browser tab name, and university logo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={settings.primary_color}
                        onChange={(event) => updateField('primary_color', event.target.value)}
                        className="w-12 h-10 rounded-md border border-slate-300"
                      />
                      <Input
                        value={settings.primary_color}
                        onChange={(event) => updateField('primary_color', event.target.value)}
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Secondary Color</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={settings.secondary_color}
                        onChange={(event) => updateField('secondary_color', event.target.value)}
                        className="w-12 h-10 rounded-md border border-slate-300"
                      />
                      <Input
                        value={settings.secondary_color}
                        onChange={(event) => updateField('secondary_color', event.target.value)}
                        placeholder="#7c3aed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Browser Tab Name / University Short Name
                    </label>
                    <Input
                      value={settings.tab_name ?? ''}
                      onChange={(event) => updateField('tab_name', event.target.value)}
                      maxLength={80}
                      placeholder="ANU"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div
                    className="rounded-lg p-5 text-white shadow-sm"
                    style={{ backgroundColor: settings.primary_color }}
                  >
                    <p className="text-sm opacity-90">Preview</p>
                    <p className="text-xl font-semibold mt-1">{settings.tab_name || 'UniAct University'}</p>
                    <div
                      className="mt-4 h-2 w-32 rounded-full"
                      style={{ backgroundColor: settings.secondary_color }}
                    />
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">Logo</p>
                        <p className="text-sm text-slate-500">PNG, JPG, WebP, or SVG up to 3 MB.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        disabled={isLogoUploading}
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4" />
                        {isLogoUploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoSelected} />

                    {settings.logo_url && (
                      <div className="mt-4 flex items-center gap-4">
                        <img src={settings.logo_url} alt="University logo" className="h-16 w-16 rounded-md object-contain border border-slate-200" />
                        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleRemoveLogo}>
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveBranding} disabled={isSaving} className="gap-2">
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Branding'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImagePlus className="w-5 h-5" />
                    Campus Life Images
                  </CardTitle>
                  <CardDescription>{settings.hero_images.length} / 6 images</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={isHeroUploading || settings.hero_images.length >= 6}
                  onClick={() => heroInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  {isHeroUploading ? 'Uploading...' : 'Upload Campus Image'}
                </Button>
              </div>
              <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={handleHeroSelected} />
            </CardHeader>
            <CardContent>
              {settings.hero_images.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-slate-500">
                  No campus images uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {settings.hero_images.map((url) => (
                    <div key={url} className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <img src={url} alt="Campus life" className="h-48 w-full object-cover" />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="absolute right-3 top-3 h-8 w-8 p-0 bg-white/90"
                        onClick={() => handleDeleteHeroImage(url)}
                        aria-label="Remove campus image"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
