import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, Plus, Edit, Trash2, Check, Archive } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_archived: boolean;
}

export default function AcademicYearPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
  });

  const fetchYears = async () => {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setYears(data || []);
    } catch (error) {
      console.error('Error fetching academic years:', error);
      toast.error('Failed to load academic years');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingYear) {
        const { error } = await supabase
          .from('academic_years')
          .update({
            name: formData.name,
            start_date: formData.start_date,
            end_date: formData.end_date,
            is_active: formData.is_active,
          })
          .eq('id', editingYear.id);

        if (error) throw error;
        toast.success('Academic year updated successfully');
      } else {
        const { error } = await supabase
          .from('academic_years')
          .insert({
            name: formData.name,
            start_date: formData.start_date,
            end_date: formData.end_date,
            is_active: formData.is_active,
          });

        if (error) throw error;
        toast.success('Academic year created successfully');
      }

      setIsAddDialogOpen(false);
      setEditingYear(null);
      setFormData({ name: '', start_date: '', end_date: '', is_active: false });
      fetchYears();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleSetActive = async (yearId: string) => {
    try {
      // First, deactivate all years
      await supabase
        .from('academic_years')
        .update({ is_active: false })
        .neq('id', '');

      // Then activate the selected year
      const { error } = await supabase
        .from('academic_years')
        .update({ is_active: true })
        .eq('id', yearId);

      if (error) throw error;
      toast.success('Active year updated');
      fetchYears();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update active year');
    }
  };

  const handleArchive = async (yearId: string) => {
    try {
      const { error } = await supabase
        .from('academic_years')
        .update({ is_archived: true, is_active: false })
        .eq('id', yearId);

      if (error) throw error;
      toast.success('Academic year archived');
      fetchYears();
    } catch (error: any) {
      toast.error(error.message || 'Failed to archive');
    }
  };

  const handleDelete = async (yearId: string) => {
    if (!confirm('Are you sure you want to delete this academic year?')) return;

    try {
      const { error } = await supabase
        .from('academic_years')
        .delete()
        .eq('id', yearId);

      if (error) throw error;
      toast.success('Academic year deleted');
      fetchYears();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const openEditDialog = (year: AcademicYear) => {
    setEditingYear(year);
    setFormData({
      name: year.name,
      start_date: year.start_date,
      end_date: year.end_date,
      is_active: year.is_active,
    });
    setIsAddDialogOpen(true);
  };

  return (
    <MainLayout title="Academic Year" titleBn="শিক্ষাবর্ষ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Academic Years</h2>
            <p className="text-sm text-muted-foreground font-bengali">শিক্ষাবর্ষ পরিচালনা</p>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingYear(null);
            setFormData({ name: '', start_date: '', end_date: '', is_active: false });
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Add Year</span>
              <span className="font-bengali">/ বছর যোগ</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingYear ? 'Edit Academic Year' : 'Add New Academic Year'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Year Name / বছরের নাম</Label>
                <Input
                  placeholder="e.g., 2024-2025"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Set as Active Year</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingYear ? 'Update' : 'Create'} Academic Year
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Years Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {years.map((year, index) => (
          <div
            key={year.id}
            className={cn(
              'card-elevated p-6 animate-fade-in-up relative',
              year.is_active && 'ring-2 ring-success',
              year.is_archived && 'opacity-60'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {year.is_active && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-success text-success-foreground text-xs rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                Active
              </div>
            )}
            {year.is_archived && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full flex items-center gap-1">
                <Archive className="w-3 h-3" />
                Archived
              </div>
            )}

            <h3 className="text-xl font-semibold text-foreground mb-2">{year.name}</h3>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <p>Start: {new Date(year.start_date).toLocaleDateString()}</p>
              <p>End: {new Date(year.end_date).toLocaleDateString()}</p>
            </div>

            <div className="flex items-center gap-2">
              {!year.is_active && !year.is_archived && (
                <Button variant="outline" size="sm" onClick={() => handleSetActive(year.id)}>
                  Set Active
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => openEditDialog(year)}>
                <Edit className="w-4 h-4" />
              </Button>
              {!year.is_archived && (
                <Button variant="ghost" size="icon" onClick={() => handleArchive(year.id)}>
                  <Archive className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => handleDelete(year.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {years.length === 0 && !loading && (
        <div className="card-elevated text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No academic years configured</p>
          <p className="text-sm text-muted-foreground font-bengali">কোন শিক্ষাবর্ষ কনফিগার করা হয়নি</p>
        </div>
      )}
    </MainLayout>
  );
}
