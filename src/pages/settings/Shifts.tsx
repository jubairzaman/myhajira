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
import { Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAcademicYear } from '@/hooks/useAcademicYear';

interface Shift {
  id: string;
  name: string;
  name_bn: string | null;
  start_time: string;
  end_time: string;
  late_threshold_time: string | null;
  absent_cutoff_time: string | null;
  sms_trigger_time: string | null;
  is_active: boolean;
  academic_year_id: string;
}

export default function ShiftsPage() {
  const { academicYears, activeYear } = useAcademicYear();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    name_bn: '',
    start_time: '08:00',
    end_time: '14:00',
    late_threshold_time: '08:30',
    absent_cutoff_time: '09:00',
    sms_trigger_time: '09:30',
  });

  useEffect(() => {
    if (activeYear) {
      setSelectedYearId(activeYear.id);
    }
  }, [activeYear]);

  const fetchShifts = async () => {
    if (!selectedYearId) return;
    
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('academic_year_id', selectedYearId)
        .order('start_time');

      if (error) throw error;
      setShifts(data || []);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast.error('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedYearId) {
      fetchShifts();
    }
  }, [selectedYearId]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.start_time || !formData.end_time) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const shiftData = {
        name: formData.name,
        name_bn: formData.name_bn || null,
        start_time: formData.start_time,
        end_time: formData.end_time,
        late_threshold_time: formData.late_threshold_time,
        absent_cutoff_time: formData.absent_cutoff_time,
        sms_trigger_time: formData.sms_trigger_time,
      };

      if (editingShift) {
        const { error } = await supabase
          .from('shifts')
          .update(shiftData)
          .eq('id', editingShift.id);

        if (error) throw error;
        toast.success('Shift updated successfully');
      } else {
        const { error } = await supabase
          .from('shifts')
          .insert({
            ...shiftData,
            academic_year_id: selectedYearId,
          });

        if (error) throw error;
        toast.success('Shift created successfully');
      }

      setIsDialogOpen(false);
      setEditingShift(null);
      resetForm();
      fetchShifts();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_bn: '',
      start_time: '08:00',
      end_time: '14:00',
      late_threshold_time: '08:30',
      absent_cutoff_time: '09:00',
      sms_trigger_time: '09:30',
    });
  };

  const handleDelete = async (shiftId: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;

    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;
      toast.success('Shift deleted');
      fetchShifts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const openEditDialog = (shift: Shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      name_bn: shift.name_bn || '',
      start_time: shift.start_time,
      end_time: shift.end_time,
      late_threshold_time: shift.late_threshold_time || '08:30',
      absent_cutoff_time: shift.absent_cutoff_time || '09:00',
      sms_trigger_time: shift.sms_trigger_time || '09:30',
    });
    setIsDialogOpen(true);
  };

  return (
    <MainLayout title="Shifts" titleBn="শিফট">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-info" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Shifts</h2>
            <p className="text-sm text-muted-foreground font-bengali">শিফট ও সময়সূচী পরিচালনা</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedYearId} onValueChange={setSelectedYearId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name} {year.is_active && '(Active)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingShift(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2" disabled={!selectedYearId}>
                <Plus className="w-4 h-4" />
                Add Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingShift ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Shift Name (English)</Label>
                    <Input
                      placeholder="e.g., Morning Shift"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>শিফটের নাম (বাংলা)</Label>
                    <Input
                      placeholder="যেমন: প্রভাতী শিফট"
                      value={formData.name_bn}
                      onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time / শুরুর সময়</Label>
                    <Input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time / শেষের সময়</Label>
                    <Input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Attendance Timing / উপস্থিতির সময়সূচী</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Late Threshold</Label>
                      <Input
                        type="time"
                        value={formData.late_threshold_time}
                        onChange={(e) => setFormData({ ...formData, late_threshold_time: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground font-bengali">বিলম্বের সময়সীমা</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Absent Cut-off</Label>
                      <Input
                        type="time"
                        value={formData.absent_cutoff_time}
                        onChange={(e) => setFormData({ ...formData, absent_cutoff_time: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground font-bengali">অনুপস্থিত সীমা</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">SMS Trigger</Label>
                      <Input
                        type="time"
                        value={formData.sms_trigger_time}
                        onChange={(e) => setFormData({ ...formData, sms_trigger_time: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground font-bengali">SMS পাঠানোর সময়</p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  {editingShift ? 'Update' : 'Create'} Shift
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="card-elevated overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Shift Name</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Late Threshold</th>
              <th>Absent Cut-off</th>
              <th>SMS Trigger</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift.id}>
                <td>
                  <div>
                    <p className="font-medium">{shift.name}</p>
                    <p className="text-sm text-muted-foreground font-bengali">{shift.name_bn || '-'}</p>
                  </div>
                </td>
                <td>{shift.start_time}</td>
                <td>{shift.end_time}</td>
                <td>{shift.late_threshold_time || '-'}</td>
                <td>{shift.absent_cutoff_time || '-'}</td>
                <td>{shift.sms_trigger_time || '-'}</td>
                <td className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(shift)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(shift.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {shifts.length === 0 && !loading && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No shifts configured</p>
            <p className="text-sm text-muted-foreground font-bengali">কোন শিফট কনফিগার করা হয়নি</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
