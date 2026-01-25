import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useWebsiteResults, useCreateWebsiteResult, useUpdateWebsiteResult, useDeleteWebsiteResult } from '@/hooks/queries/useWebsiteCMS';
import { useClassesQuery } from '@/hooks/queries/useClassesQuery';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';

interface ResultFormData {
  title: string;
  class_id: string;
  exam_id: string;
  pdf_url: string;
  is_published: boolean;
}

export default function ResultsManager() {
  const { data: results, isLoading } = useWebsiteResults();
  const { data: classes } = useClassesQuery();
  const { activeYear } = useAcademicYear();
  const createResult = useCreateWebsiteResult();
  const updateResult = useUpdateWebsiteResult();
  const deleteResult = useDeleteWebsiteResult();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ResultFormData>({
    title: '',
    class_id: '',
    exam_id: '',
    pdf_url: '',
    is_published: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeYear?.id) {
      toast({ title: 'No active academic year', variant: 'destructive' });
      return;
    }
    try {
      if (editingId) {
        await updateResult.mutateAsync({ 
          id: editingId, 
          title: formData.title,
          is_published: formData.is_published,
        });
        toast({ title: 'Result updated successfully' });
      } else {
        await createResult.mutateAsync({
          academic_year_id: activeYear.id,
          class_id: formData.class_id,
          exam_id: formData.exam_id,
          pdf_url: formData.pdf_url,
          title: formData.title,
        });
        toast({ title: 'Result created successfully' });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Operation failed', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      class_id: '',
      exam_id: '',
      pdf_url: '',
      is_published: true,
    });
    setEditingId(null);
  };

  const handleEdit = (result: any) => {
    setFormData({
      title: result.title || '',
      class_id: result.class_id || '',
      exam_id: result.exam_id || '',
      pdf_url: result.pdf_url || '',
      is_published: result.is_published,
    });
    setEditingId(result.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;
    try {
      await deleteResult.mutateAsync(id);
      toast({ title: 'Result deleted successfully' });
    } catch (error) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Results Management" titleBn="ফলাফল ম্যানেজমেন্ট">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Results Management" titleBn="ফলাফল ম্যানেজমেন্ট">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Add Result
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Result' : 'Add New Result'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., First Terminal Exam 2024"
                  />
                </div>

                {!editingId && (
                  <>
                    <div className="space-y-2">
                      <Label>Class *</Label>
                      <Select
                        value={formData.class_id}
                        onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes?.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name} {cls.name_bn && `(${cls.name_bn})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Result PDF URL *</Label>
                      <Input
                        value={formData.pdf_url}
                        onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                        placeholder="https://..."
                        required={!editingId}
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload PDF to storage and paste the URL here
                      </p>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label>Published</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createResult.isPending || updateResult.isPending}>
                    {(createResult.isPending || updateResult.isPending) && (
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
            <CardTitle>All Results ({results?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title / Exam</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results?.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{result.title || result.exam?.name || 'Untitled'}</p>
                        {result.exam?.name_bn && (
                          <p className="text-sm text-muted-foreground font-bengali">{result.exam.name_bn}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {result.class ? `${result.class.name}` : '-'}
                      {result.class?.name_bn && (
                        <span className="text-muted-foreground font-bengali"> ({result.class.name_bn})</span>
                      )}
                    </TableCell>
                    <TableCell>{result.academic_year?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={result.is_published ? 'default' : 'secondary'}>
                        {result.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {result.pdf_url && (
                          <Button size="icon" variant="ghost" asChild>
                            <a href={result.pdf_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(result)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(result.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!results || results.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No results found. Click "Add Result" to create one.
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
