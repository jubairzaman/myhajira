import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useWebsiteNotices, useCreateWebsiteNotice, useUpdateWebsiteNotice, useDeleteWebsiteNotice } from '@/hooks/queries/useWebsiteCMS';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Pin, FileText } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'academic', label: 'Academic' },
  { value: 'exam', label: 'Exam' },
  { value: 'admission', label: 'Admission' },
  { value: 'event', label: 'Event' },
  { value: 'holiday', label: 'Holiday' },
];

interface NoticeFormData {
  title: string;
  title_bn: string;
  content: string;
  content_bn: string;
  category: string;
  attachment_url: string;
  is_published: boolean;
  is_pinned: boolean;
}

const initialFormData: NoticeFormData = {
  title: '',
  title_bn: '',
  content: '',
  content_bn: '',
  category: 'general',
  attachment_url: '',
  is_published: true,
  is_pinned: false,
};

export default function NoticesManager() {
  const { data: notices, isLoading } = useWebsiteNotices();
  const createNotice = useCreateWebsiteNotice();
  const updateNotice = useUpdateWebsiteNotice();
  const deleteNotice = useDeleteWebsiteNotice();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NoticeFormData>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateNotice.mutateAsync({ id: editingId, ...formData });
        toast({ title: 'Notice updated successfully' });
      } else {
        await createNotice.mutateAsync({
          ...formData,
          created_by: null,
          publish_date: new Date().toISOString(),
        });
        toast({ title: 'Notice created successfully' });
      }
      setIsDialogOpen(false);
      setFormData(initialFormData);
      setEditingId(null);
    } catch (error) {
      toast({ title: 'Operation failed', variant: 'destructive' });
    }
  };

  const handleEdit = (notice: any) => {
    setFormData({
      title: notice.title,
      title_bn: notice.title_bn || '',
      content: notice.content,
      content_bn: notice.content_bn || '',
      category: notice.category,
      attachment_url: notice.attachment_url || '',
      is_published: notice.is_published,
      is_pinned: notice.is_pinned,
    });
    setEditingId(notice.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await deleteNotice.mutateAsync(id);
      toast({ title: 'Notice deleted successfully' });
    } catch (error) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-500',
      academic: 'bg-blue-500',
      exam: 'bg-purple-500',
      admission: 'bg-green-500',
      event: 'bg-orange-500',
      holiday: 'bg-red-500',
    };
    return <Badge className={colors[category] || 'bg-gray-500'}>{category}</Badge>;
  };

  if (isLoading) {
    return (
      <MainLayout title="Notice Management" titleBn="নোটিশ ম্যানেজমেন্ট">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Notice Management" titleBn="নোটিশ ম্যানেজমেন্ট">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setFormData(initialFormData);
              setEditingId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Add Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Notice' : 'Add New Notice'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title (English) *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
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

                <div className="space-y-2">
                  <Label>Content (English) *</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content (বাংলা)</Label>
                  <Textarea
                    value={formData.content_bn}
                    onChange={(e) => setFormData({ ...formData, content_bn: e.target.value })}
                    rows={4}
                    className="font-bengali"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Attachment URL</Label>
                    <Input
                      value={formData.attachment_url}
                      onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                    />
                    <Label>Published</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_pinned}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
                    />
                    <Label>Pinned</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createNotice.isPending || updateNotice.isPending}>
                    {(createNotice.isPending || updateNotice.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Notices ({notices?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices?.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {notice.is_pinned && <Pin className="w-4 h-4 text-primary" />}
                        <div>
                          <p className="font-medium">{notice.title}</p>
                          {notice.title_bn && (
                            <p className="text-sm text-muted-foreground font-bengali">{notice.title_bn}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(notice.category)}</TableCell>
                    <TableCell>
                      <Badge variant={notice.is_published ? 'default' : 'secondary'}>
                        {notice.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(notice.created_at), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {notice.attachment_url && (
                          <Button size="icon" variant="ghost" asChild>
                            <a href={notice.attachment_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(notice)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(notice.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!notices || notices.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No notices found. Click "Add Notice" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
