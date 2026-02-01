import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWebsiteSettings, useUpdateWebsiteSettings } from '@/hooks/queries/useWebsiteCMS';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Globe, Palette, Share2 } from 'lucide-react';

export default function WebsiteSettings() {
  const { data: settings, isLoading } = useWebsiteSettings();
  const updateSettings = useUpdateWebsiteSettings();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: '',
    school_name: '',
    school_name_bn: '',
    hero_title: '',
    hero_title_bn: '',
    hero_subtitle: '',
    hero_subtitle_bn: '',
    contact_address: '',
    contact_address_bn: '',
    contact_phone: '',
    contact_email: '',
    logo_url: '',
    favicon_url: '',
    hero_image_url: '',
    primary_color: '#4B0082',
    secondary_color: '#00D4FF',
    cta_button_color: '#00D4FF',
    secondary_button_color: '#4B0082',
    facebook_url: '',
    youtube_url: '',
    twitter_url: '',
    google_map_embed: '',
    is_website_enabled: true,
    office_hours: '',
    office_hours_bn: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        id: settings.id,
        school_name: settings.school_name || '',
        school_name_bn: settings.school_name_bn || '',
        hero_title: settings.hero_title || '',
        hero_title_bn: settings.hero_title_bn || '',
        hero_subtitle: settings.hero_subtitle || '',
        hero_subtitle_bn: settings.hero_subtitle_bn || '',
        contact_address: settings.contact_address || '',
        contact_address_bn: settings.contact_address_bn || '',
        contact_phone: settings.contact_phone || '',
        contact_email: settings.contact_email || '',
        logo_url: settings.logo_url || '',
        favicon_url: settings.favicon_url || '',
        hero_image_url: settings.hero_image_url || '',
        primary_color: settings.primary_color || '#4B0082',
        secondary_color: settings.secondary_color || '#00D4FF',
        cta_button_color: settings.cta_button_color || '#00D4FF',
        secondary_button_color: settings.secondary_button_color || '#4B0082',
        facebook_url: settings.facebook_url || '',
        youtube_url: settings.youtube_url || '',
        twitter_url: settings.twitter_url || '',
        google_map_embed: settings.google_map_embed || '',
        is_website_enabled: settings.is_website_enabled ?? true,
        office_hours: settings.office_hours || '',
        office_hours_bn: settings.office_hours_bn || '',
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync(formData);
      toast({ title: 'Settings saved successfully' });
    } catch (error) {
      toast({ title: 'Failed to save settings', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Website Settings" titleBn="ওয়েবসাইট সেটিংস">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Website Settings" titleBn="ওয়েবসাইট সেটিংস">
      <div className="space-y-6">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general" className="gap-2">
                <Globe className="w-4 h-4" /> General
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="w-4 h-4" /> Appearance
              </TabsTrigger>
              <TabsTrigger value="social" className="gap-2">
                <Share2 className="w-4 h-4" /> Social & Contact
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                  <CardDescription>Basic school information displayed on the website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>School Name (English)</Label>
                      <Input
                        value={formData.school_name}
                        onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                        placeholder="Enter school name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>School Name (বাংলা)</Label>
                      <Input
                        value={formData.school_name_bn}
                        onChange={(e) => setFormData({ ...formData, school_name_bn: e.target.value })}
                        placeholder="বিদ্যালয়ের নাম"
                        className="font-bengali"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Hero Title (English)</Label>
                      <Input
                        value={formData.hero_title}
                        onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                        placeholder="Welcome to Our School"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hero Title (বাংলা)</Label>
                      <Input
                        value={formData.hero_title_bn}
                        onChange={(e) => setFormData({ ...formData, hero_title_bn: e.target.value })}
                        placeholder="আমাদের বিদ্যালয়ে স্বাগতম"
                        className="font-bengali"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Hero Subtitle (English)</Label>
                      <Textarea
                        value={formData.hero_subtitle}
                        onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                        placeholder="School motto or tagline"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hero Subtitle (বাংলা)</Label>
                      <Textarea
                        value={formData.hero_subtitle_bn}
                        onChange={(e) => setFormData({ ...formData, hero_subtitle_bn: e.target.value })}
                        placeholder="স্লোগান"
                        className="font-bengali"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Website Enabled</Label>
                      <p className="text-sm text-muted-foreground">Toggle to enable/disable public website</p>
                    </div>
                    <Switch
                      checked={formData.is_website_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_website_enabled: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look of your website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Logo URL</Label>
                      <Input
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        placeholder="https://..."
                      />
                      {formData.logo_url && (
                        <img src={formData.logo_url} alt="Logo Preview" className="h-12 w-auto mt-2 border rounded" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Favicon URL (ব্রাউজার ট্যাব আইকন)</Label>
                      <Input
                        value={formData.favicon_url}
                        onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
                        placeholder="https://... (.ico, .png, .svg)"
                      />
                      {formData.favicon_url && (
                        <div className="flex items-center gap-2 mt-2">
                          <img src={formData.favicon_url} alt="Favicon Preview" className="h-8 w-8 border rounded" />
                          <span className="text-xs text-muted-foreground">প্রিভিউ</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Hero Image URL</Label>
                    <Input
                      value={formData.hero_image_url}
                      onChange={(e) => setFormData({ ...formData, hero_image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Primary Color (প্রাথমিক রং)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          placeholder="#4B0082"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color (গৌণ রং)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          placeholder="#00D4FF"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>CTA Button Color (প্রধান বাটন)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.cta_button_color}
                          onChange={(e) => setFormData({ ...formData, cta_button_color: e.target.value })}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={formData.cta_button_color}
                          onChange={(e) => setFormData({ ...formData, cta_button_color: e.target.value })}
                          placeholder="#00D4FF"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Button Color (গৌণ বাটন)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.secondary_button_color}
                          onChange={(e) => setFormData({ ...formData, secondary_button_color: e.target.value })}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={formData.secondary_button_color}
                          onChange={(e) => setFormData({ ...formData, secondary_button_color: e.target.value })}
                          placeholder="#4B0082"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>Contact & Social Media</CardTitle>
                  <CardDescription>Contact information and social media links</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        placeholder="+880 1xxx-xxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        placeholder="info@school.edu.bd"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Address (English)</Label>
                      <Textarea
                        value={formData.contact_address}
                        onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                        placeholder="School address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address (বাংলা)</Label>
                      <Textarea
                        value={formData.contact_address_bn}
                        onChange={(e) => setFormData({ ...formData, contact_address_bn: e.target.value })}
                        placeholder="ঠিকানা"
                        className="font-bengali"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Office Hours (English)</Label>
                      <Input
                        value={formData.office_hours}
                        onChange={(e) => setFormData({ ...formData, office_hours: e.target.value })}
                        placeholder="Sun-Thu: 8AM-4PM"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Office Hours (বাংলা)</Label>
                      <Input
                        value={formData.office_hours_bn}
                        onChange={(e) => setFormData({ ...formData, office_hours_bn: e.target.value })}
                        placeholder="রবি-বৃহঃ: সকাল ৮টা-বিকেল ৪টা"
                        className="font-bengali"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Facebook URL</Label>
                      <Input
                        value={formData.facebook_url}
                        onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>YouTube URL</Label>
                      <Input
                        value={formData.youtube_url}
                        onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Twitter URL</Label>
                      <Input
                        value={formData.twitter_url}
                        onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Google Maps Embed Code</Label>
                    <Textarea
                      value={formData.google_map_embed}
                      onChange={(e) => setFormData({ ...formData, google_map_embed: e.target.value })}
                      placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
