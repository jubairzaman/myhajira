import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWebsitePopupNotice, useUpdateWebsitePopupNotice } from '@/hooks/queries/useWebsiteCMSNew';
import { Loader2, Save, Bell, Image, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PopupNoticeManager() {
  const { data: popup, isLoading } = useWebsitePopupNotice();
  const updatePopup = useUpdateWebsitePopupNotice();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    title_bn: '',
    description: '',
    description_bn: '',
    image_url: '',
    button_text: '',
    button_text_bn: '',
    button_link: '',
    display_type: 'card' as 'image' | 'card',
    is_enabled: false,
    show_once_per_session: true,
  });

  useEffect(() => {
    if (popup) {
      setFormData({
        id: popup.id,
        title: popup.title || '',
        title_bn: popup.title_bn || '',
        description: popup.description || '',
        description_bn: popup.description_bn || '',
        image_url: popup.image_url || '',
        button_text: popup.button_text || '',
        button_text_bn: popup.button_text_bn || '',
        button_link: popup.button_link || '',
        display_type: popup.display_type || 'card',
        is_enabled: popup.is_enabled,
        show_once_per_session: popup.show_once_per_session,
      });
    }
  }, [popup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePopup.mutateAsync(formData);
    } catch (error) {
      toast({ title: 'সংরক্ষণ ব্যর্থ', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Popup Notice" titleBn="পপআপ নোটিশ">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Popup Notice" titleBn="পপআপ নোটিশ">
      <div className="space-y-6">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                পপআপ নোটিশ সেটিংস
              </CardTitle>
              <CardDescription>
                ওয়েবসাইটে ভিজিটরদের জন্য পপআপ নোটিশ কনফিগার করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div>
                  <Label className="text-base">পপআপ সক্রিয় করুন</Label>
                  <p className="text-sm text-muted-foreground">এটি অন করলে ওয়েবসাইটে পপআপ দেখাবে</p>
                </div>
                <Switch
                  checked={formData.is_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                />
              </div>

              {/* Display Type */}
              <div className="space-y-2">
                <Label>প্রদর্শনের ধরন</Label>
                <Select
                  value={formData.display_type}
                  onValueChange={(value: 'image' | 'card') => setFormData({ ...formData, display_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        কার্ড (টাইটেল + ডেসক্রিপশন)
                      </div>
                    </SelectItem>
                    <SelectItem value="image">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        শুধু ইমেজ
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image URL (for both types) */}
              <div className="space-y-2">
                <Label>ইমেজ URL {formData.display_type === 'image' && '(আবশ্যক)'}</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="h-32 w-auto mt-2 border rounded" />
                )}
              </div>

              {/* Card content (only for card type) */}
              {formData.display_type === 'card' && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>টাইটেল (English)</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Important Notice"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>টাইটেল (বাংলা)</Label>
                      <Input
                        value={formData.title_bn}
                        onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                        placeholder="গুরুত্বপূর্ণ নোটিশ"
                        className="font-bengali"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>বিবরণ (English)</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>বিবরণ (বাংলা)</Label>
                      <Textarea
                        value={formData.description_bn}
                        onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
                        placeholder="বিবরণ..."
                        rows={3}
                        className="font-bengali"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Button settings */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>বাটন টেক্সট (বাংলা)</Label>
                  <Input
                    value={formData.button_text_bn}
                    onChange={(e) => setFormData({ ...formData, button_text_bn: e.target.value })}
                    placeholder="বিস্তারিত দেখুন"
                    className="font-bengali"
                  />
                </div>
                <div className="space-y-2">
                  <Label>বাটন লিংক</Label>
                  <Input
                    value={formData.button_link}
                    onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                    placeholder="/website/notices"
                  />
                </div>
              </div>

              {/* Show once per session */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>সেশনে একবার দেখান</Label>
                  <p className="text-sm text-muted-foreground">বন্ধ করলে প্রতিটি পেজ রিলোডে পপআপ দেখাবে</p>
                </div>
                <Switch
                  checked={formData.show_once_per_session}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_once_per_session: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={updatePopup.isPending}>
              {updatePopup.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
