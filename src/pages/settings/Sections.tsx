import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LayoutList, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Class {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
  name_bn: string | null;
  class_id: string;
  classes?: Class;
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_bn: '',
    class_id: '',
  });

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .order('grade_order');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*, classes(id, name)')
        .order('name');

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchSections();
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.class_id) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const sectionData = {
        name: formData.name,
        name_bn: formData.name_bn || null,
        class_id: formData.class_id,
      };

      if (editingSection) {
        const { error } = await supabase
          .from('sections')
          .update(sectionData)
          .eq('id', editingSection.id);

        if (error) throw error;
        toast.success('Section updated successfully');
      } else {
        const { error } = await supabase
          .from('sections')
          .insert(sectionData);

        if (error) throw error;
        toast.success('Section created successfully');
      }

      setIsDialogOpen(false);
      setEditingSection(null);
      setFormData({ name: '', name_bn: '', class_id: '' });
      fetchSections();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      toast.success('Section deleted');
      fetchSections();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const openEditDialog = (section: Section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      name_bn: section.name_bn || '',
      class_id: section.class_id,
    });
    setIsDialogOpen(true);
  };

  return (
    <MainLayout title="Sections" titleBn="শাখা">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LayoutList className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Sections</h2>
            <p className="text-sm text-muted-foreground font-bengali">শাখা পরিচালনা</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingSection(null);
            setFormData({ name: '', name_bn: '', class_id: '' });
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSection ? 'Edit Section' : 'Add New Section'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Name</Label>
                  <Input
                    placeholder="e.g., Section A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>শাখার নাম</Label>
                  <Input
                    placeholder="যেমন: শাখা ক"
                    value={formData.name_bn}
                    onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={formData.class_id} onValueChange={(v) => setFormData({ ...formData, class_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingSection ? 'Update' : 'Create'} Section
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sections Table */}
      <div className="card-elevated overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Section Name</th>
              <th>শাখার নাম</th>
              <th>Class</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <tr key={section.id}>
                <td className="font-medium">{section.name}</td>
                <td className="font-bengali">{section.name_bn || '-'}</td>
                <td>{section.classes?.name || '-'}</td>
                <td className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(section)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(section.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sections.length === 0 && !loading && (
          <div className="text-center py-12">
            <LayoutList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No sections configured</p>
            <p className="text-sm text-muted-foreground font-bengali">কোন শাখা কনফিগার করা হয়নি</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
