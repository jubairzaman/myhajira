import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWebsiteAlumni, useApproveWebsiteAlumni, useUpdateWebsiteAlumni, useDeleteWebsiteAlumni } from '@/hooks/queries/useWebsiteCMS';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pencil, Trash2, Check, Star, User } from 'lucide-react';

interface AlumniFormData {
  name: string;
  name_bn: string;
  passing_year: number;
  current_position: string;
  current_position_bn: string;
  comment: string;
  comment_bn: string;
  photo_url: string;
  is_featured: boolean;
  show_in_bubble: boolean;
}

const currentYear = new Date().getFullYear();

export default function AlumniManager() {
  const { data: alumni, isLoading } = useWebsiteAlumni();
  const approveAlumni = useApproveWebsiteAlumni();
  const updateAlumni = useUpdateWebsiteAlumni();
  const deleteAlumni = useDeleteWebsiteAlumni();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AlumniFormData>({
    name: '',
    name_bn: '',
    passing_year: currentYear - 5,
    current_position: '',
    current_position_bn: '',
    comment: '',
    comment_bn: '',
    photo_url: '',
    is_featured: false,
    show_in_bubble: true,
  });

  const pendingAlumni = alumni?.filter((a) => !a.is_approved) || [];
  const approvedAlumni = alumni?.filter((a) => a.is_approved) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAlumni.mutateAsync({ id: editingId, ...formData });
        toast({ title: 'Alumni updated successfully' });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Operation failed', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_bn: '',
      passing_year: currentYear - 5,
      current_position: '',
      current_position_bn: '',
      comment: '',
      comment_bn: '',
      photo_url: '',
      is_featured: false,
      show_in_bubble: true,
    });
    setEditingId(null);
  };

  const handleEdit = (alum: any) => {
    setFormData({
      name: alum.name,
      name_bn: alum.name_bn || '',
      passing_year: alum.passing_year,
      current_position: alum.current_position || '',
      current_position_bn: alum.current_position_bn || '',
      comment: alum.comment || '',
      comment_bn: alum.comment_bn || '',
      photo_url: alum.photo_url || '',
      is_featured: alum.is_featured,
      show_in_bubble: alum.show_in_bubble,
    });
    setEditingId(alum.id);
    setIsDialogOpen(true);
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAlumni.mutateAsync(id);
      toast({ title: 'Alumni approved successfully' });
    } catch (error) {
      toast({ title: 'Approval failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alumni?')) return;
    try {
      await deleteAlumni.mutateAsync(id);
      toast({ title: 'Alumni deleted successfully' });
    } catch (error) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Alumni Management" titleBn="প্রাক্তন ছাত্র ম্যানেজমেন্ট">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const AlumniTable = ({ data, showApprove = false }: { data: any[]; showApprove?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Alumni</TableHead>
          <TableHead>Passing Year</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((alum) => (
          <TableRow key={alum.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={alum.photo_url} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{alum.name}</p>
                  {alum.name_bn && (
                    <p className="text-sm text-muted-foreground font-bengali">{alum.name_bn}</p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>{alum.passing_year}</TableCell>
            <TableCell>
              <div>
                <p>{alum.current_position || '-'}</p>
                {alum.current_position_bn && (
                  <p className="text-sm text-muted-foreground font-bengali">{alum.current_position_bn}</p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {alum.is_featured && (
                  <Badge className="bg-yellow-500">
                    <Star className="w-3 h-3 mr-1" /> Featured
                  </Badge>
                )}
                {alum.show_in_bubble && (
                  <Badge variant="outline">Bubble</Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {showApprove && (
                  <Button size="icon" variant="ghost" onClick={() => handleApprove(alum.id)}>
                    <Check className="w-4 h-4 text-green-500" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => handleEdit(alum)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(alum.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
              No alumni found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <MainLayout title="Alumni Management" titleBn="প্রাক্তন ছাত্র ম্যানেজমেন্ট">
      <div className="space-y-6">
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              Pending Approval
              {pendingAlumni.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingAlumni.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedAlumni.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <AlumniTable data={pendingAlumni} showApprove />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Alumni</CardTitle>
              </CardHeader>
              <CardContent>
                <AlumniTable data={approvedAlumni} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Alumni</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name (English) *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (বাংলা)</Label>
                  <Input
                    value={formData.name_bn}
                    onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                    className="font-bengali"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Passing Year *</Label>
                  <Input
                    type="number"
                    value={formData.passing_year}
                    onChange={(e) => setFormData({ ...formData, passing_year: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Photo URL</Label>
                  <Input
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Current Position (English)</Label>
                  <Input
                    value={formData.current_position}
                    onChange={(e) => setFormData({ ...formData, current_position: e.target.value })}
                    placeholder="Software Engineer at Google"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Position (বাংলা)</Label>
                  <Input
                    value={formData.current_position_bn}
                    onChange={(e) => setFormData({ ...formData, current_position_bn: e.target.value })}
                    className="font-bengali"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Comment (English)</Label>
                  <Textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Comment (বাংলা)</Label>
                  <Textarea
                    value={formData.comment_bn}
                    onChange={(e) => setFormData({ ...formData, comment_bn: e.target.value })}
                    rows={3}
                    className="font-bengali"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.show_in_bubble}
                    onCheckedChange={(checked) => setFormData({ ...formData, show_in_bubble: checked })}
                  />
                  <Label>Show in Bubble</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateAlumni.isPending}>
                  {updateAlumni.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
