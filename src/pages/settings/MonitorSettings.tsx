import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tv, Image, FileText, Video, Plus, Trash2, Edit2, Save, Loader2, ArrowUp, ArrowDown, Palette, Type, Upload } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  title_bn: string | null;
  is_active: boolean;
  display_order: number;
}

interface VideoItem {
  id: string;
  title: string;
  video_url: string;
  is_active: boolean;
  display_order: number;
}

interface ScrollerSettings {
  fontSize: number;
  fontFamily: string;
  speed: number;
  bgColor: string;
  textColor: string;
  bulletColor: string;
}

const FONT_OPTIONS = [
  { value: 'Hind Siliguri', label: 'হিন্দ সিলিগুড়ি' },
  { value: 'Noto Sans Bengali', label: 'নোটো সান্স বাংলা' },
  { value: 'Tiro Bangla', label: 'তিরো বাংলা' },
  { value: 'Baloo Da 2', label: 'বালু দা' },
];

export default function MonitorSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  // News
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsTitleBn, setNewNewsTitleBn] = useState('');
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [showNewsDialog, setShowNewsDialog] = useState(false);
  
  // Videos
  const [videoItems, setVideoItems] = useState<VideoItem[]>([]);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Scroller Settings
  const [scrollerSettings, setScrollerSettings] = useState<ScrollerSettings>({
    fontSize: 24,
    fontFamily: 'Hind Siliguri',
    speed: 50,
    bgColor: '#991B1B',
    textColor: '#FFFFFF',
    bulletColor: '#FDE047',
  });
  const [savingScroller, setSavingScroller] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch logo and scroller settings from system_settings
      const { data: settings } = await supabase
        .from('system_settings')
        .select('monitor_logo_url, scroller_font_size, scroller_font_family, scroller_speed, scroller_bg_color, scroller_text_color, scroller_bullet_color')
        .limit(1)
        .maybeSingle();
      
      if (settings) {
        setLogoUrl(settings.monitor_logo_url);
        setScrollerSettings({
          fontSize: settings.scroller_font_size ?? 24,
          fontFamily: settings.scroller_font_family ?? 'Hind Siliguri',
          speed: settings.scroller_speed ?? 50,
          bgColor: settings.scroller_bg_color ?? '#991B1B',
          textColor: settings.scroller_text_color ?? '#FFFFFF',
          bulletColor: settings.scroller_bullet_color ?? '#FDE047',
        });
      }

      // Fetch news items
      const { data: news } = await supabase
        .from('monitor_news')
        .select('*')
        .order('display_order', { ascending: true });
      
      setNewsItems(news || []);

      // Fetch video items
      const { data: videos } = await supabase
        .from('monitor_videos')
        .select('*')
        .order('display_order', { ascending: true });
      
      setVideoItems(videos || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('ডেটা লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  // Logo handlers
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    
    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveLogo = async () => {
    if (!logoFile) return;

    setSaving(true);
    try {
      // Upload to storage
      const fileName = `monitor-logo-${Date.now()}.${logoFile.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, logoFile);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      // Update system_settings
      const { error: updateError } = await supabase
        .from('system_settings')
        .update({ monitor_logo_url: publicUrl.publicUrl })
        .not('id', 'is', null);

      if (updateError) throw updateError;

      setLogoUrl(publicUrl.publicUrl);
      setLogoFile(null);
      toast.success('লোগো সংরক্ষিত হয়েছে');
    } catch (error) {
      console.error('Error saving logo:', error);
      toast.error('লোগো সংরক্ষণ ব্যর্থ');
    } finally {
      setSaving(false);
    }
  };

  // Scroller Settings handlers
  const saveScrollerSettings = async () => {
    setSavingScroller(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          scroller_font_size: scrollerSettings.fontSize,
          scroller_font_family: scrollerSettings.fontFamily,
          scroller_speed: scrollerSettings.speed,
          scroller_bg_color: scrollerSettings.bgColor,
          scroller_text_color: scrollerSettings.textColor,
          scroller_bullet_color: scrollerSettings.bulletColor,
        })
        .not('id', 'is', null);

      if (error) throw error;
      toast.success('স্ক্রলার সেটিংস সংরক্ষিত হয়েছে');
    } catch (error) {
      console.error('Error saving scroller settings:', error);
      toast.error('স্ক্রলার সেটিংস সংরক্ষণ ব্যর্থ');
    } finally {
      setSavingScroller(false);
    }
  };

  // News handlers
  const addNews = async () => {
    if (!newNewsTitle.trim()) return;

    try {
      const maxOrder = Math.max(0, ...newsItems.map(n => n.display_order));
      const { data, error } = await supabase
        .from('monitor_news')
        .insert({
          title: newNewsTitle,
          title_bn: newNewsTitleBn || null,
          display_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;

      setNewsItems([...newsItems, data]);
      setNewNewsTitle('');
      setNewNewsTitleBn('');
      setShowNewsDialog(false);
      toast.success('নিউজ যোগ করা হয়েছে');
    } catch (error) {
      console.error('Error adding news:', error);
      toast.error('নিউজ যোগ ব্যর্থ');
    }
  };

  const updateNews = async () => {
    if (!editingNews) return;

    try {
      const { error } = await supabase
        .from('monitor_news')
        .update({
          title: editingNews.title,
          title_bn: editingNews.title_bn,
        })
        .eq('id', editingNews.id);

      if (error) throw error;

      setNewsItems(newsItems.map(n => n.id === editingNews.id ? editingNews : n));
      setEditingNews(null);
      setShowNewsDialog(false);
      toast.success('নিউজ আপডেট হয়েছে');
    } catch (error) {
      console.error('Error updating news:', error);
      toast.error('নিউজ আপডেট ব্যর্থ');
    }
  };

  const toggleNewsActive = async (news: NewsItem) => {
    try {
      const { error } = await supabase
        .from('monitor_news')
        .update({ is_active: !news.is_active })
        .eq('id', news.id);

      if (error) throw error;

      setNewsItems(newsItems.map(n => n.id === news.id ? { ...n, is_active: !n.is_active } : n));
    } catch (error) {
      console.error('Error toggling news:', error);
      toast.error('আপডেট ব্যর্থ');
    }
  };

  const deleteNews = async (id: string) => {
    try {
      const { error } = await supabase
        .from('monitor_news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNewsItems(newsItems.filter(n => n.id !== id));
      toast.success('নিউজ মুছে ফেলা হয়েছে');
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('মুছে ফেলা ব্যর্থ');
    }
  };

  const moveNews = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newsItems.length) return;

    const newItems = [...newsItems];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    // Update display_order
    const updates = newItems.map((item, i) => ({
      id: item.id,
      display_order: i,
    }));

    try {
      for (const update of updates) {
        await supabase
          .from('monitor_news')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
      setNewsItems(newItems.map((item, i) => ({ ...item, display_order: i })));
    } catch (error) {
      console.error('Error reordering news:', error);
      toast.error('ক্রম পরিবর্তন ব্যর্থ');
    }
  };

  // Video handlers - with file upload
  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!validTypes.includes(file.type)) {
      toast.error('শুধুমাত্র MP4, WebM বা OGG ফাইল সাপোর্টেড');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('ফাইল সাইজ ১০০MB এর বেশি হতে পারবে না');
      return;
    }

    setNewVideoFile(file);
  };

  const addVideo = async () => {
    if (!newVideoTitle.trim() || !newVideoFile) {
      toast.error('ভিডিওর নাম এবং ফাইল দিন');
      return;
    }

    setUploadingVideo(true);
    try {
      // Upload video to storage
      const fileExt = newVideoFile.name.split('.').pop();
      const fileName = `monitor-video-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, newVideoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      // Add to database
      const maxOrder = Math.max(0, ...videoItems.map(v => v.display_order));
      const { data, error } = await supabase
        .from('monitor_videos')
        .insert({
          title: newVideoTitle,
          video_url: publicUrlData.publicUrl,
          display_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;

      setVideoItems([...videoItems, data]);
      setNewVideoTitle('');
      setNewVideoFile(null);
      setShowVideoDialog(false);
      toast.success('ভিডিও আপলোড সম্পন্ন');
    } catch (error) {
      console.error('Error adding video:', error);
      toast.error('ভিডিও আপলোড ব্যর্থ');
    } finally {
      setUploadingVideo(false);
    }
  };

  const updateVideoTitle = async () => {
    if (!editingVideo) return;

    try {
      const { error } = await supabase
        .from('monitor_videos')
        .update({
          title: editingVideo.title,
        })
        .eq('id', editingVideo.id);

      if (error) throw error;

      setVideoItems(videoItems.map(v => v.id === editingVideo.id ? editingVideo : v));
      setEditingVideo(null);
      setShowVideoDialog(false);
      toast.success('ভিডিও আপডেট হয়েছে');
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('ভিডিও আপডেট ব্যর্থ');
    }
  };

  const toggleVideoActive = async (video: VideoItem) => {
    try {
      const { error } = await supabase
        .from('monitor_videos')
        .update({ is_active: !video.is_active })
        .eq('id', video.id);

      if (error) throw error;

      setVideoItems(videoItems.map(v => v.id === video.id ? { ...v, is_active: !v.is_active } : v));
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error('আপডেট ব্যর্থ');
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      // Get video URL to delete from storage
      const video = videoItems.find(v => v.id === id);
      
      // Delete from database
      const { error } = await supabase
        .from('monitor_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Try to delete from storage (optional, may fail if file doesn't exist)
      if (video?.video_url) {
        const fileName = video.video_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('videos').remove([fileName]).catch(() => {});
        }
      }

      setVideoItems(videoItems.filter(v => v.id !== id));
      toast.success('ভিডিও মুছে ফেলা হয়েছে');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('মুছে ফেলা ব্যর্থ');
    }
  };

  const moveVideo = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= videoItems.length) return;

    const newItems = [...videoItems];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    const updates = newItems.map((item, i) => ({
      id: item.id,
      display_order: i,
    }));

    try {
      for (const update of updates) {
        await supabase
          .from('monitor_videos')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
      setVideoItems(newItems.map((item, i) => ({ ...item, display_order: i })));
    } catch (error) {
      console.error('Error reordering videos:', error);
      toast.error('ক্রম পরিবর্তন ব্যর্থ');
    }
  };

  if (loading) {
    return (
      <MainLayout title="Monitor Settings" titleBn="মনিটর সেটিংস">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Monitor Settings" titleBn="মনিটর সেটিংস">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Tv className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold font-bengali">মনিটর ডিসপ্লে সেটিংস</h1>
            <p className="text-muted-foreground">গেট মনিটরে প্রদর্শনের জন্য লোগো, নিউজ ও ভিডিও সেটআপ করুন</p>
          </div>
        </div>

        {/* Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              মনিটর লোগো
            </CardTitle>
            <CardDescription>গেট মনিটরে দেখানোর জন্য লোগো আপলোড করুন</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {logoUrl ? (
                <img src={logoUrl} alt="Monitor Logo" className="h-20 w-auto object-contain border rounded-lg p-2" />
              ) : (
                <div className="h-20 w-32 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                  কোনো লোগো নেই
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="max-w-xs"
                />
                {logoFile && (
                  <Button onClick={saveLogo} disabled={saving} size="sm">
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    লোগো সংরক্ষণ করুন
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scroller Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              স্ক্রলার সেটিংস
            </CardTitle>
            <CardDescription>নিউজ স্ক্রলারের ফন্ট, স্পিড এবং কালার কাস্টমাইজ করুন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preview */}
            <div className="rounded-lg overflow-hidden border">
              <div 
                className="h-16 flex items-center px-6 overflow-hidden"
                style={{ backgroundColor: scrollerSettings.bgColor }}
              >
                <span 
                  className="font-semibold whitespace-nowrap"
                  style={{ 
                    color: scrollerSettings.textColor,
                    fontSize: `${scrollerSettings.fontSize}px`,
                    fontFamily: scrollerSettings.fontFamily,
                  }}
                >
                  <span style={{ color: scrollerSettings.bulletColor }}>●</span>
                  {' '}এটি একটি প্রিভিউ টেক্সট - This is a preview text
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Font Size */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  ফন্ট সাইজ: {scrollerSettings.fontSize}px
                </Label>
                <Slider
                  value={[scrollerSettings.fontSize]}
                  onValueChange={(value) => setScrollerSettings(prev => ({ ...prev, fontSize: value[0] }))}
                  min={16}
                  max={48}
                  step={2}
                  className="w-full"
                />
              </div>

              {/* Font Family */}
              <div className="space-y-3">
                <Label>ফন্ট ফ্যামিলি</Label>
                <Select
                  value={scrollerSettings.fontFamily}
                  onValueChange={(value) => setScrollerSettings(prev => ({ ...prev, fontFamily: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ফন্ট সিলেক্ট করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map(font => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Speed */}
              <div className="space-y-3">
                <Label>স্ক্রল স্পিড: {scrollerSettings.speed < 30 ? 'ধীর' : scrollerSettings.speed < 70 ? 'মাঝারি' : 'দ্রুত'}</Label>
                <Slider
                  value={[scrollerSettings.speed]}
                  onValueChange={(value) => setScrollerSettings(prev => ({ ...prev, speed: value[0] }))}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Colors */}
              <div className="space-y-3">
                <Label>রঙ সেটিংস</Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">ব্যাকগ্রাউন্ড</Label>
                    <input
                      type="color"
                      value={scrollerSettings.bgColor}
                      onChange={(e) => setScrollerSettings(prev => ({ ...prev, bgColor: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer border"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">টেক্সট</Label>
                    <input
                      type="color"
                      value={scrollerSettings.textColor}
                      onChange={(e) => setScrollerSettings(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer border"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">বুলেট</Label>
                    <input
                      type="color"
                      value={scrollerSettings.bulletColor}
                      onChange={(e) => setScrollerSettings(prev => ({ ...prev, bulletColor: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer border"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={saveScrollerSettings} disabled={savingScroller}>
              {savingScroller ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              স্ক্রলার সেটিংস সংরক্ষণ করুন
            </Button>
          </CardContent>
        </Card>

        {/* News Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  নিউজ স্ক্রলার
                </CardTitle>
                <CardDescription>মনিটরের নিচে স্ক্রল হওয়া নিউজ হেডলাইন (শুধুমাত্র আইডল মোডে দেখাবে)</CardDescription>
              </div>
              <Dialog open={showNewsDialog} onOpenChange={setShowNewsDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingNews(null); setNewNewsTitle(''); setNewNewsTitleBn(''); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    নতুন নিউজ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingNews ? 'নিউজ সম্পাদনা' : 'নতুন নিউজ যোগ করুন'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>নিউজ (English)</Label>
                      <Input
                        value={editingNews ? editingNews.title : newNewsTitle}
                        onChange={(e) => editingNews 
                          ? setEditingNews({ ...editingNews, title: e.target.value })
                          : setNewNewsTitle(e.target.value)
                        }
                        placeholder="Enter news headline"
                      />
                    </div>
                    <div>
                      <Label>নিউজ (বাংলা)</Label>
                      <Input
                        value={editingNews ? (editingNews.title_bn || '') : newNewsTitleBn}
                        onChange={(e) => editingNews
                          ? setEditingNews({ ...editingNews, title_bn: e.target.value })
                          : setNewNewsTitleBn(e.target.value)
                        }
                        placeholder="নিউজ হেডলাইন লিখুন"
                        className="font-bengali"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewsDialog(false)}>বাতিল</Button>
                    <Button onClick={editingNews ? updateNews : addNews}>
                      {editingNews ? 'আপডেট করুন' : 'যোগ করুন'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {newsItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">কোনো নিউজ যোগ করা হয়নি</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ক্রম</TableHead>
                    <TableHead>নিউজ</TableHead>
                    <TableHead className="w-24">সক্রিয়</TableHead>
                    <TableHead className="w-32">কার্যক্রম</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsItems.map((news, index) => (
                    <TableRow key={news.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            disabled={index === 0}
                            onClick={() => moveNews(index, 'up')}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            disabled={index === newsItems.length - 1}
                            onClick={() => moveNews(index, 'down')}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{news.title}</p>
                        {news.title_bn && <p className="text-sm text-muted-foreground font-bengali">{news.title_bn}</p>}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={news.is_active}
                          onCheckedChange={() => toggleNewsActive(news)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingNews(news);
                              setShowNewsDialog(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteNews(news.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Videos Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  ভিডিও
                </CardTitle>
                <CardDescription>আইডল মোডে প্লে হওয়া ভিডিও আপলোড করুন (MP4, WebM সাপোর্টেড, সর্বোচ্চ ১০০MB)</CardDescription>
              </div>
              <Dialog open={showVideoDialog} onOpenChange={(open) => {
                setShowVideoDialog(open);
                if (!open) {
                  setEditingVideo(null);
                  setNewVideoTitle('');
                  setNewVideoFile(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingVideo(null); setNewVideoTitle(''); setNewVideoFile(null); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    নতুন ভিডিও
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingVideo ? 'ভিডিও সম্পাদনা' : 'নতুন ভিডিও আপলোড করুন'}</DialogTitle>
                    <DialogDescription>
                      {editingVideo ? 'শুধুমাত্র ভিডিওর শিরোনাম পরিবর্তন করা যাবে' : 'MP4 বা WebM ফরম্যাটের ভিডিও আপলোড করুন'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>ভিডিও শিরোনাম</Label>
                      <Input
                        value={editingVideo ? editingVideo.title : newVideoTitle}
                        onChange={(e) => editingVideo 
                          ? setEditingVideo({ ...editingVideo, title: e.target.value })
                          : setNewVideoTitle(e.target.value)
                        }
                        placeholder="ভিডিওর নাম লিখুন"
                      />
                    </div>
                    {!editingVideo && (
                      <div>
                        <Label>ভিডিও ফাইল</Label>
                        <div className="mt-2">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                              {newVideoFile ? (
                                <p className="text-sm text-foreground font-medium">{newVideoFile.name}</p>
                              ) : (
                                <>
                                  <p className="text-sm text-muted-foreground">ভিডিও ফাইল সিলেক্ট করুন</p>
                                  <p className="text-xs text-muted-foreground mt-1">MP4, WebM, OGG (সর্বোচ্চ ১০০MB)</p>
                                </>
                              )}
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="video/mp4,video/webm,video/ogg"
                              onChange={handleVideoFileSelect}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowVideoDialog(false)}>বাতিল</Button>
                    <Button 
                      onClick={editingVideo ? updateVideoTitle : addVideo}
                      disabled={uploadingVideo || (!editingVideo && (!newVideoTitle.trim() || !newVideoFile))}
                    >
                      {uploadingVideo ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          আপলোড হচ্ছে...
                        </>
                      ) : (
                        editingVideo ? 'আপডেট করুন' : 'আপলোড করুন'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {videoItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">কোনো ভিডিও যোগ করা হয়নি</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ক্রম</TableHead>
                    <TableHead>শিরোনাম</TableHead>
                    <TableHead className="w-24">সক্রিয়</TableHead>
                    <TableHead className="w-32">কার্যক্রম</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videoItems.map((video, index) => (
                    <TableRow key={video.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            disabled={index === 0}
                            onClick={() => moveVideo(index, 'up')}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            disabled={index === videoItems.length - 1}
                            onClick={() => moveVideo(index, 'down')}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{video.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {video.video_url.includes('supabase') ? '📁 আপলোডেড ফাইল' : video.video_url}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={video.is_active}
                          onCheckedChange={() => toggleVideoActive(video)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingVideo(video);
                              setShowVideoDialog(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteVideo(video.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
