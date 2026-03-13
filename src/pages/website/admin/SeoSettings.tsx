import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWebsiteSettings, useUpdateWebsiteSettings } from '@/hooks/queries/useWebsiteCMS';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Search, Share2, Eye, Globe, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function SeoSettings() {
  const { data: settings, isLoading } = useWebsiteSettings();
  const updateSettings = useUpdateWebsiteSettings();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    id: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    og_title: '',
    og_description: '',
    og_image_url: '',
    twitter_card_title: '',
    twitter_card_description: '',
    twitter_card_image_url: '',
    canonical_url: '',
    robots_txt_override: '',
    json_ld_type: 'EducationalOrganization',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        id: settings.id,
        seo_title: settings.seo_title || settings.site_title || '',
        seo_description: settings.seo_description || '',
        seo_keywords: settings.seo_keywords || '',
        og_title: settings.og_title || '',
        og_description: settings.og_description || '',
        og_image_url: settings.og_image_url || '',
        twitter_card_title: settings.twitter_card_title || '',
        twitter_card_description: settings.twitter_card_description || '',
        twitter_card_image_url: settings.twitter_card_image_url || '',
        canonical_url: settings.canonical_url || '',
        robots_txt_override: settings.robots_txt_override || '',
        json_ld_type: settings.json_ld_type || 'EducationalOrganization',
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (field: 'og_image_url' | 'twitter_card_image_url', file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'ত্রুটি', description: 'শুধুমাত্র ইমেজ ফাইল আপলোড করুন', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'ত্রুটি', description: 'ইমেজ সাইজ ৫MB এর কম হতে হবে', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `seo/${field}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('website-assets').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('website-assets').getPublicUrl(path);
      setForm(prev => ({ ...prev, [field]: publicUrl }));
      toast({ title: 'আপলোড সফল' });
    } catch (err: any) {
      toast({ title: 'আপলোড ত্রুটি', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!form.seo_title.trim()) {
      toast({ title: 'SEO Title আবশ্যক', variant: 'destructive' });
      return;
    }
    updateSettings.mutate(form);
  };

  if (isLoading) {
    return (
      <MainLayout title="SEO সেটিংস" titleBn="SEO সেটিংস">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-bengali">🔍 SEO সেটিংস</h1>
            <p className="text-muted-foreground font-bengali">সার্চ ইঞ্জিন ও সোশ্যাল মিডিয়া অপটিমাইজেশন</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'প্রিভিউ বন্ধ' : 'ফেসবুক প্রিভিউ'}
            </Button>
            <Button onClick={handleSave} disabled={updateSettings.isPending}>
              {updateSettings.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              সংরক্ষণ
            </Button>
          </div>
        </div>

        {showPreview && (
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-lg font-bengali">📱 Facebook / Messenger প্রিভিউ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg border shadow-sm max-w-md">
                {(form.og_image_url || settings?.logo_url) && (
                  <img
                    src={form.og_image_url || settings?.logo_url || ''}
                    alt="OG Preview"
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-3">
                  <p className="text-xs text-muted-foreground uppercase">
                    {form.canonical_url ? new URL(form.canonical_url).hostname : 'yourschool.edu.bd'}
                  </p>
                  <p className="font-semibold text-sm mt-1">
                    {form.og_title || form.seo_title || 'Site Title'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {form.og_description || form.seo_description || 'Site description...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="font-bengali">
              <Search className="h-4 w-4 mr-1" /> বেসিক SEO
            </TabsTrigger>
            <TabsTrigger value="og" className="font-bengali">
              <Share2 className="h-4 w-4 mr-1" /> Open Graph
            </TabsTrigger>
            <TabsTrigger value="twitter" className="font-bengali">
              <Globe className="h-4 w-4 mr-1" /> Twitter Card
            </TabsTrigger>
            <TabsTrigger value="advanced" className="font-bengali">
              ⚙️ অ্যাডভান্সড
            </TabsTrigger>
          </TabsList>

          {/* Basic SEO */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="font-bengali">সার্চ ইঞ্জিন সেটিংস</CardTitle>
                <CardDescription className="font-bengali">Google, Bing ইত্যাদিতে আপনার সাইট কিভাবে দেখাবে</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bengali">Site Title *</Label>
                  <Input value={form.seo_title} onChange={e => handleChange('seo_title', e.target.value)} placeholder="আলী আকবর মডেল হাই স্কুল" maxLength={60} />
                  <p className="text-xs text-muted-foreground">{form.seo_title.length}/60 অক্ষর</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali">Meta Description</Label>
                  <Textarea value={form.seo_description} onChange={e => handleChange('seo_description', e.target.value)} placeholder="বিদ্যালয়ের সংক্ষিপ্ত বিবরণ..." maxLength={160} rows={3} />
                  <p className="text-xs text-muted-foreground">{form.seo_description.length}/160 অক্ষর</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali">Keywords (কমা দিয়ে আলাদা করুন)</Label>
                  <Input value={form.seo_keywords} onChange={e => handleChange('seo_keywords', e.target.value)} placeholder="school, education, bangladesh, dhaka" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali">Canonical URL</Label>
                  <Input value={form.canonical_url} onChange={e => handleChange('canonical_url', e.target.value)} placeholder="https://yourschool.edu.bd" type="url" />
                </div>

                {/* Google Preview */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2 font-bengali">🔍 Google সার্চ প্রিভিউ:</p>
                  <div>
                    <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                      {form.seo_title || 'আপনার সাইটের শিরোনাম'}
                    </p>
                    <p className="text-green-700 text-sm">
                      {form.canonical_url || 'https://yourschool.edu.bd'}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {form.seo_description || 'আপনার সাইটের বিবরণ এখানে দেখাবে...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Open Graph */}
          <TabsContent value="og">
            <Card>
              <CardHeader>
                <CardTitle className="font-bengali">Open Graph (Facebook / Messenger)</CardTitle>
                <CardDescription className="font-bengali">ফেসবুক ও মেসেঞ্জারে শেয়ার করলে কিভাবে দেখাবে</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bengali">OG Title</Label>
                  <Input value={form.og_title} onChange={e => handleChange('og_title', e.target.value)} placeholder="ফেসবুকে শেয়ার করা শিরোনাম" />
                  <p className="text-xs text-muted-foreground">খালি রাখলে Site Title ব্যবহার হবে</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali">OG Description</Label>
                  <Textarea value={form.og_description} onChange={e => handleChange('og_description', e.target.value)} placeholder="ফেসবুকে শেয়ার করা বিবরণ" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali">OG Image (1200×630 recommended)</Label>
                  {form.og_image_url && (
                    <img src={form.og_image_url} alt="OG" className="w-full max-w-md h-40 object-cover rounded-lg border" />
                  )}
                  <div className="flex gap-2">
                    <Input value={form.og_image_url} onChange={e => handleChange('og_image_url', e.target.value)} placeholder="https://..." className="flex-1" />
                    <label className="cursor-pointer">
                      <Button variant="outline" asChild disabled={uploading}>
                        <span>
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                        </span>
                      </Button>
                      <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload('og_image_url', e.target.files[0])} />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Twitter Card */}
          <TabsContent value="twitter">
            <Card>
              <CardHeader>
                <CardTitle className="font-bengali">Twitter Card</CardTitle>
                <CardDescription className="font-bengali">Twitter/X এ শেয়ার করলে কিভাবে দেখাবে</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bengali">Twitter Title</Label>
                  <Input value={form.twitter_card_title} onChange={e => handleChange('twitter_card_title', e.target.value)} placeholder="Twitter শিরোনাম" />
                  <p className="text-xs text-muted-foreground">খালি রাখলে OG Title ব্যবহার হবে</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali">Twitter Description</Label>
                  <Textarea value={form.twitter_card_description} onChange={e => handleChange('twitter_card_description', e.target.value)} placeholder="Twitter বিবরণ" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali">Twitter Image</Label>
                  {form.twitter_card_image_url && (
                    <img src={form.twitter_card_image_url} alt="Twitter" className="w-full max-w-md h-40 object-cover rounded-lg border" />
                  )}
                  <div className="flex gap-2">
                    <Input value={form.twitter_card_image_url} onChange={e => handleChange('twitter_card_image_url', e.target.value)} placeholder="https://..." className="flex-1" />
                    <label className="cursor-pointer">
                      <Button variant="outline" asChild disabled={uploading}>
                        <span>
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                        </span>
                      </Button>
                      <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload('twitter_card_image_url', e.target.files[0])} />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle className="font-bengali">অ্যাডভান্সড SEO</CardTitle>
                <CardDescription className="font-bengali">Robots.txt ও Structured Data কনফিগারেশন</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bengali">Robots.txt Override</Label>
                  <Textarea
                    value={form.robots_txt_override}
                    onChange={e => handleChange('robots_txt_override', e.target.value)}
                    placeholder={`User-agent: *\nAllow: /\n\nSitemap: https://yourschool.edu.bd/sitemap.xml`}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">খালি রাখলে ডিফল্ট robots.txt ব্যবহার হবে</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali">JSON-LD Type</Label>
                  <select
                    value={form.json_ld_type}
                    onChange={e => handleChange('json_ld_type', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="EducationalOrganization">Educational Organization</option>
                    <option value="School">School</option>
                    <option value="HighSchool">High School</option>
                    <option value="CollegeOrUniversity">College / University</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
