import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useAlumniFormFields,
  useCreateAlumniFormField,
  useUpdateAlumniFormField,
  useDeleteAlumniFormField,
  AlumniFormField,
} from '@/hooks/queries/useWebsiteCMS';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pencil, Trash2, Plus, GripVertical } from 'lucide-react';

interface FieldFormData {
  field_name: string;
  field_label: string;
  field_label_bn: string;
  field_type: AlumniFormField['field_type'];
  is_required: boolean;
  display_order: number;
  is_enabled: boolean;
  placeholder: string;
  placeholder_bn: string;
}

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'select', label: 'Dropdown' },
];

export default function AlumniFormFieldsManager() {
  const { data: fields, isLoading } = useAlumniFormFields();
  const createField = useCreateAlumniFormField();
  const updateField = useUpdateAlumniFormField();
  const deleteField = useDeleteAlumniFormField();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FieldFormData>({
    field_name: '',
    field_label: '',
    field_label_bn: '',
    field_type: 'text',
    is_required: false,
    display_order: 0,
    is_enabled: true,
    placeholder: '',
    placeholder_bn: '',
  });

  const resetForm = () => {
    setFormData({
      field_name: '',
      field_label: '',
      field_label_bn: '',
      field_type: 'text',
      is_required: false,
      display_order: (fields?.length || 0) + 1,
      is_enabled: true,
      placeholder: '',
      placeholder_bn: '',
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate field_name from label if empty
    const fieldName = formData.field_name || formData.field_label.toLowerCase().replace(/\s+/g, '_');
    
    try {
      if (editingId) {
        await updateField.mutateAsync({
          id: editingId,
          ...formData,
          field_name: fieldName,
          options: null,
        });
      } else {
        await createField.mutateAsync({
          ...formData,
          field_name: fieldName,
          options: null,
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (field: AlumniFormField) => {
    setFormData({
      field_name: field.field_name,
      field_label: field.field_label,
      field_label_bn: field.field_label_bn || '',
      field_type: field.field_type,
      is_required: field.is_required,
      display_order: field.display_order,
      is_enabled: field.is_enabled,
      placeholder: field.placeholder || '',
      placeholder_bn: field.placeholder_bn || '',
    });
    setEditingId(field.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই ফিল্ড মুছে ফেলতে চান?')) return;
    try {
      await deleteField.mutateAsync(id);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleEnabled = async (field: AlumniFormField) => {
    try {
      await updateField.mutateAsync({
        id: field.id,
        is_enabled: !field.is_enabled,
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Custom Form Fields</CardTitle>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          এখানে থেকে Alumni Registration Form এ নতুন ফিল্ড যোগ করতে পারবেন।
        </p>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Field Label</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields?.map((field) => (
              <TableRow key={field.id}>
                <TableCell>
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{field.field_label}</p>
                    {field.field_label_bn && (
                      <p className="text-sm text-muted-foreground font-bengali">{field.field_label_bn}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{field.field_name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{field.field_type}</Badge>
                </TableCell>
                <TableCell>
                  {field.is_required ? (
                    <Badge variant="destructive">Required</Badge>
                  ) : (
                    <span className="text-muted-foreground">Optional</span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={field.is_enabled}
                    onCheckedChange={() => handleToggleEnabled(field)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(field)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(field.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!fields || fields.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No custom fields yet. Add your first field!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Field Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Field' : 'Add New Field'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Field Label (English) *</Label>
                <Input
                  value={formData.field_label}
                  onChange={(e) => setFormData({ ...formData, field_label: e.target.value })}
                  placeholder="e.g., Profession"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Field Label (বাংলা)</Label>
                <Input
                  value={formData.field_label_bn}
                  onChange={(e) => setFormData({ ...formData, field_label_bn: e.target.value })}
                  placeholder="পেশা"
                  className="font-bengali"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Field Type</Label>
                <Select
                  value={formData.field_type}
                  onValueChange={(value) => setFormData({ ...formData, field_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Placeholder (English)</Label>
                <Input
                  value={formData.placeholder}
                  onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                  placeholder="Enter your profession"
                />
              </div>
              <div className="space-y-2">
                <Label>Placeholder (বাংলা)</Label>
                <Input
                  value={formData.placeholder_bn}
                  onChange={(e) => setFormData({ ...formData, placeholder_bn: e.target.value })}
                  placeholder="আপনার পেশা লিখুন"
                  className="font-bengali"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_required"
                  checked={formData.is_required}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
                />
                <Label htmlFor="is_required">Required Field</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_enabled"
                  checked={formData.is_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                />
                <Label htmlFor="is_enabled">Enabled</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createField.isPending || updateField.isPending}>
                {(createField.isPending || updateField.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingId ? 'Update Field' : 'Add Field'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
