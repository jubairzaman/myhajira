import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useParentTestimonials, useCreateParentTestimonial, useUpdateParentTestimonial, useDeleteParentTestimonial } from '@/hooks/queries/useWebsiteCMS';
import { Loader2, Plus, Pencil, Trash2, MessageSquare, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ParentTestimonialsManager() {
  const { data: testimonials, isLoading } = useParentTestimonials();
  const createTestimonial = useCreateParentTestimonial();
  const updateTestimonial = useUpdateParentTestimonial();
  const deleteTestimonial = useDeleteParentTestimonial();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_bn: '',
    relation: '',
    relation_bn: '',
    student_class: '',
    photo_url: '',
    comment: '',
    comment_bn: '',
    rating: 5,
    is_enabled: true,
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      name_bn: '',
      relation: '',
      relation_bn: '',
      student_class: '',
      photo_url: '',
      comment: '',
      comment_bn: '',
      rating: 5,
      is_enabled: true,
      display_order: 0,
    });
    setEditingItem(null);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      name_bn: item.name_bn || '',
      relation: item.relation || '',
      relation_bn: item.relation_bn || '',
      student_class: item.student_class || '',
      photo_url: item.photo_url || '',
      comment: item.comment || '',
      comment_bn: item.comment_bn || '',
      rating: item.rating || 5,
      is_enabled: item.is_enabled ?? true,
      display_order: item.display_order || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.comment) {
      toast({ title: 'নাম এবং মতামত দিতে হবে', variant: 'destructive' });
      return;
    }

    try {
      if (editingItem) {
        await updateTestimonial.mutateAsync({ id: editingItem.id, ...formData });
      } else {
        await createTestimonial.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি এই মতামত মুছে ফেলতে চান?')) {
      await deleteTestimonial.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Parent Testimonials" titleBn="অভিভাবকদের মতামত">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Parent Testimonials" titleBn="অভিভাবকদের মতামত">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">অভিভাবকদের মতামত যা ওয়েবসাইটে দেখাবে</p>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                নতুন মতামত
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-bengali">
                  {editingItem ? 'মতামত সম্পাদনা' : 'নতুন মতামত যোগ করুন'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>নাম (EN) *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>নাম (বাংলা)</Label>
                    <Input
                      value={formData.name_bn}
                      onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                      className="font-bengali"
                    />
                  </div>
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>সম্পর্ক (EN)</Label>
                    <Input
                      value={formData.relation}
                      onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                      placeholder="Father / Mother / Guardian"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>সম্পর্ক (বাংলা)</Label>
                    <Input
                      value={formData.relation_bn}
                      onChange={(e) => setFormData({ ...formData, relation_bn: e.target.value })}
                      placeholder="পিতা / মাতা / অভিভাবক"
                      className="font-bengali"
                    />
                  </div>
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>ছাত্র/ছাত্রীর ক্লাস</Label>
                    <Input
                      value={formData.student_class}
                      onChange={(e) => setFormData({ ...formData, student_class: e.target.value })}
                      placeholder="Class 5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>রেটিং</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: n })}
                          className="p-1"
                        >
                          <Star className={`w-6 h-6 ${n <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ছবির URL</Label>
                  <Input
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>মতামত (EN) *</Label>
                  <Textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>মতামত (বাংলা)</Label>
                  <Textarea
                    value={formData.comment_bn}
                    onChange={(e) => setFormData({ ...formData, comment_bn: e.target.value })}
                    rows={3}
                    className="font-bengali"
                  />
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>ক্রম</Label>
                    <Input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={formData.is_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                    />
                    <Label>সক্রিয়</Label>
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={createTestimonial.isPending || updateTestimonial.isPending}>
                  {(createTestimonial.isPending || updateTestimonial.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingItem ? 'আপডেট করুন' : 'যোগ করুন'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              মতামত তালিকা
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testimonials && testimonials.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>নাম</TableHead>
                    <TableHead>সম্পর্ক</TableHead>
                    <TableHead>রেটিং</TableHead>
                    <TableHead className="w-[100px]">স্ট্যাটাস</TableHead>
                    <TableHead className="w-[100px]">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.photo_url ? (
                            <img src={item.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                              {item.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium font-bengali">{item.name_bn || item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.student_class}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.relation_bn || item.relation || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          {Array.from({ length: item.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${item.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.is_enabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>কোনো মতামত নেই</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
