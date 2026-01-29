import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHeroSlides, useCreateHeroSlide, useUpdateHeroSlide, useDeleteHeroSlide } from '@/hooks/queries/useWebsiteCMS';
import { Loader2, Plus, Pencil, Trash2, Image, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HeroSlidesManager() {
  const { data: slides, isLoading } = useHeroSlides();
  const createSlide = useCreateHeroSlide();
  const updateSlide = useUpdateHeroSlide();
  const deleteSlide = useDeleteHeroSlide();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    title_bn: '',
    subtitle: '',
    subtitle_bn: '',
    link_url: '',
    display_order: 0,
    is_enabled: true,
  });

  const resetForm = () => {
    setFormData({
      image_url: '',
      title: '',
      title_bn: '',
      subtitle: '',
      subtitle_bn: '',
      link_url: '',
      display_order: 0,
      is_enabled: true,
    });
    setEditingSlide(null);
  };

  const openEdit = (slide: any) => {
    setEditingSlide(slide);
    setFormData({
      image_url: slide.image_url || '',
      title: slide.title || '',
      title_bn: slide.title_bn || '',
      subtitle: slide.subtitle || '',
      subtitle_bn: slide.subtitle_bn || '',
      link_url: slide.link_url || '',
      display_order: slide.display_order || 0,
      is_enabled: slide.is_enabled ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.image_url) {
      toast({ title: 'ছবির URL দিতে হবে', variant: 'destructive' });
      return;
    }

    try {
      if (editingSlide) {
        await updateSlide.mutateAsync({ id: editingSlide.id, ...formData });
      } else {
        await createSlide.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি এই স্লাইড মুছে ফেলতে চান?')) {
      await deleteSlide.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Hero Slides" titleBn="হিরো স্লাইড">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Hero Slides" titleBn="হিরো স্লাইড">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">হোমপেজের হিরো সেকশনে যে স্লাইডগুলো দেখাবে</p>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                নতুন স্লাইড
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-bengali">
                  {editingSlide ? 'স্লাইড সম্পাদনা' : 'নতুন স্লাইড যোগ করুন'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>ছবির URL *</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded mt-2" />
                  )}
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (বাংলা)</Label>
                    <Input
                      value={formData.title_bn}
                      onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                      className="font-bengali"
                    />
                  </div>
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>Subtitle (EN)</Label>
                    <Input
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle (বাংলা)</Label>
                    <Input
                      value={formData.subtitle_bn}
                      onChange={(e) => setFormData({ ...formData, subtitle_bn: e.target.value })}
                      className="font-bengali"
                    />
                  </div>
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>Link URL</Label>
                    <Input
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      placeholder="/website/admissions"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ক্রম</Label>
                    <Input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                  />
                  <Label>সক্রিয়</Label>
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={createSlide.isPending || updateSlide.isPending}>
                  {(createSlide.isPending || updateSlide.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingSlide ? 'আপডেট করুন' : 'যোগ করুন'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              স্লাইড তালিকা
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slides && slides.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ক্রম</TableHead>
                    <TableHead className="w-[100px]">ছবি</TableHead>
                    <TableHead>শিরোনাম</TableHead>
                    <TableHead className="w-[100px]">স্ট্যাটাস</TableHead>
                    <TableHead className="w-[100px]">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slides.map((slide) => (
                    <TableRow key={slide.id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <GripVertical className="w-4 h-4" />
                          {slide.display_order}
                        </div>
                      </TableCell>
                      <TableCell>
                        <img src={slide.image_url} alt="" className="w-16 h-10 object-cover rounded" />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium font-bengali">{slide.title_bn || slide.title || '-'}</p>
                          <p className="text-xs text-muted-foreground">{slide.subtitle_bn || slide.subtitle || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${slide.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {slide.is_enabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(slide)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(slide.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>কোনো স্লাইড নেই</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
