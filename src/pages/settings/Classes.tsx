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
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAcademicYear } from '@/hooks/useAcademicYear';

interface Shift {
  id: string;
  name: string;
  name_bn: string | null;
}

interface Class {
  id: string;
  name: string;
  name_bn: string | null;
  grade_order: number;
  shift_id: string | null;
  shifts?: Shift | null;
}

export default function ClassesPage() {
  const { activeYear } = useAcademicYear();
  const [classes, setClasses] = useState<Class[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_bn: '',
    grade_order: 0,
    shift_id: '',
  });

  const fetchShifts = async () => {
    if (!activeYear) return;
    
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('id, name, name_bn')
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true)
        .order('start_time');

      if (error) throw error;
      setShifts(data || []);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*, shifts(id, name, name_bn)')
        .order('grade_order');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeYear) {
      fetchShifts();
    }
    fetchClasses();
  }, [activeYear]);

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Please fill class name');
      return;
    }

    try {
      const classData = {
        name: formData.name,
        name_bn: formData.name_bn || null,
        grade_order: formData.grade_order,
        shift_id: formData.shift_id || null,
      };

      if (editingClass) {
        const { error } = await supabase
          .from('classes')
          .update(classData)
          .eq('id', editingClass.id);

        if (error) throw error;
        toast.success('Class updated successfully');
      } else {
        const { error } = await supabase
          .from('classes')
          .insert(classData);

        if (error) throw error;
        toast.success('Class created successfully');
      }

      setIsDialogOpen(false);
      setEditingClass(null);
      setFormData({ name: '', name_bn: '', grade_order: 0, shift_id: '' });
      fetchClasses();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;
      toast.success('Class deleted');
      fetchClasses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const openEditDialog = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      name_bn: cls.name_bn || '',
      grade_order: cls.grade_order,
      shift_id: cls.shift_id || '',
    });
    setIsDialogOpen(true);
  };

  return (
    <MainLayout title="Classes" titleBn="শ্রেণী">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-success" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Classes</h2>
            <p className="text-sm text-muted-foreground font-bengali">শ্রেণী পরিচালনা</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingClass(null);
            setFormData({ name: '', name_bn: '', grade_order: 0, shift_id: '' });
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClass ? 'Edit Class' : 'Add New Class'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class Name</Label>
                  <Input
                    placeholder="e.g., Class 1"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>শ্রেণীর নাম</Label>
                  <Input
                    placeholder="যেমন: প্রথম শ্রেণী"
                    value={formData.name_bn}
                    onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shift (Optional)</Label>
                  <Select 
                    value={formData.shift_id || 'all'} 
                    onValueChange={(v) => setFormData({ ...formData, shift_id: v === 'all' ? '' : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shifts</SelectItem>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name} {shift.name_bn && `(${shift.name_bn})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Grade Order</Label>
                  <Input
                    type="number"
                    value={formData.grade_order}
                    onChange={(e) => setFormData({ ...formData, grade_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingClass ? 'Update' : 'Create'} Class
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Classes Table */}
      <div className="card-elevated overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Class Name</th>
              <th>শ্রেণীর নাম</th>
              <th>Shift</th>
              <th>Order</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls.id}>
                <td className="font-medium">{cls.name}</td>
                <td className="font-bengali">{cls.name_bn || '-'}</td>
                <td>
                  {cls.shifts ? (
                    <span>
                      {cls.shifts.name} {cls.shifts.name_bn && `(${cls.shifts.name_bn})`}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">All Shifts</span>
                  )}
                </td>
                <td>{cls.grade_order}</td>
                <td className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(cls)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(cls.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {classes.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No classes configured</p>
            <p className="text-sm text-muted-foreground font-bengali">কোন শ্রেণী কনফিগার করা হয়নি</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
