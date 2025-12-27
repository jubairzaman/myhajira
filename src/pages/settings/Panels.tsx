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
import { Layers, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAcademicYear } from '@/hooks/useAcademicYear';

interface Shift {
  id: string;
  name: string;
}

interface Panel {
  id: string;
  name: string;
  name_bn: string | null;
  type: string;
  shift_id: string;
  start_time: string;
  late_threshold_time: string;
  absent_cutoff_time: string;
  sms_trigger_time: string;
  shifts?: Shift;
}

export default function PanelsPage() {
  const { activeYear } = useAcademicYear();
  const [panels, setPanels] = useState<Panel[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_bn: '',
    type: 'primary',
    shift_id: '',
    start_time: '08:00',
    late_threshold_time: '08:30',
    absent_cutoff_time: '09:00',
    sms_trigger_time: '09:30',
  });

  const fetchShifts = async () => {
    if (!activeYear) return;
    
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('id, name')
        .eq('academic_year_id', activeYear.id);

      if (error) throw error;
      setShifts(data || []);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  const fetchPanels = async () => {
    if (!activeYear) return;
    
    try {
      const { data, error } = await supabase
        .from('panels')
        .select('*, shifts(id, name)')
        .order('name');

      if (error) throw error;
      setPanels(data || []);
    } catch (error) {
      console.error('Error fetching panels:', error);
      toast.error('Failed to load panels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeYear) {
      fetchShifts();
      fetchPanels();
    }
  }, [activeYear]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.shift_id) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const panelData = {
        name: formData.name,
        name_bn: formData.name_bn || null,
        type: formData.type,
        shift_id: formData.shift_id,
        start_time: formData.start_time,
        late_threshold_time: formData.late_threshold_time,
        absent_cutoff_time: formData.absent_cutoff_time,
        sms_trigger_time: formData.sms_trigger_time,
      };

      if (editingPanel) {
        const { error } = await supabase
          .from('panels')
          .update(panelData)
          .eq('id', editingPanel.id);

        if (error) throw error;
        toast.success('Panel updated successfully');
      } else {
        const { error } = await supabase
          .from('panels')
          .insert(panelData);

        if (error) throw error;
        toast.success('Panel created successfully');
      }

      setIsDialogOpen(false);
      setEditingPanel(null);
      resetForm();
      fetchPanels();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_bn: '',
      type: 'primary',
      shift_id: '',
      start_time: '08:00',
      late_threshold_time: '08:30',
      absent_cutoff_time: '09:00',
      sms_trigger_time: '09:30',
    });
  };

  const handleDelete = async (panelId: string) => {
    if (!confirm('Are you sure you want to delete this panel?')) return;

    try {
      const { error } = await supabase
        .from('panels')
        .delete()
        .eq('id', panelId);

      if (error) throw error;
      toast.success('Panel deleted');
      fetchPanels();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const openEditDialog = (panel: Panel) => {
    setEditingPanel(panel);
    setFormData({
      name: panel.name,
      name_bn: panel.name_bn || '',
      type: panel.type,
      shift_id: panel.shift_id,
      start_time: panel.start_time,
      late_threshold_time: panel.late_threshold_time,
      absent_cutoff_time: panel.absent_cutoff_time,
      sms_trigger_time: panel.sms_trigger_time,
    });
    setIsDialogOpen(true);
  };

  const panelTypes = [
    { value: 'primary', label: 'Primary', labelBn: 'প্রাথমিক' },
    { value: 'girls', label: 'Girls', labelBn: 'বালিকা' },
    { value: 'boys', label: 'Boys', labelBn: 'বালক' },
    { value: 'teacher', label: 'Teacher', labelBn: 'শিক্ষক' },
  ];

  return (
    <MainLayout title="Panels" titleBn="প্যানেল">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <Layers className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Panels</h2>
            <p className="text-sm text-muted-foreground font-bengali">প্যানেল পরিচালনা</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingPanel(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Panel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingPanel ? 'Edit Panel' : 'Add New Panel'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Panel Name</Label>
                  <Input
                    placeholder="e.g., Primary Panel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>প্যানেলের নাম</Label>
                  <Input
                    placeholder="যেমন: প্রাথমিক প্যানেল"
                    value={formData.name_bn}
                    onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shift</Label>
                  <Select value={formData.shift_id} onValueChange={(v) => setFormData({ ...formData, shift_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Panel Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {panelTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label} ({type.labelBn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Late Threshold</Label>
                  <Input
                    type="time"
                    value={formData.late_threshold_time}
                    onChange={(e) => setFormData({ ...formData, late_threshold_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Absent Cut-off</Label>
                  <Input
                    type="time"
                    value={formData.absent_cutoff_time}
                    onChange={(e) => setFormData({ ...formData, absent_cutoff_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMS Trigger Time</Label>
                  <Input
                    type="time"
                    value={formData.sms_trigger_time}
                    onChange={(e) => setFormData({ ...formData, sms_trigger_time: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingPanel ? 'Update' : 'Create'} Panel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Panels Table */}
      <div className="card-elevated overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Panel Name</th>
              <th>Type</th>
              <th>Shift</th>
              <th>Start Time</th>
              <th>Late Threshold</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {panels.map((panel) => (
              <tr key={panel.id}>
                <td>
                  <div>
                    <p className="font-medium">{panel.name}</p>
                    <p className="text-sm text-muted-foreground font-bengali">{panel.name_bn}</p>
                  </div>
                </td>
                <td className="capitalize">{panel.type}</td>
                <td>{panel.shifts?.name || '-'}</td>
                <td>{panel.start_time}</td>
                <td>{panel.late_threshold_time}</td>
                <td className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(panel)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(panel.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {panels.length === 0 && !loading && (
          <div className="text-center py-12">
            <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No panels configured</p>
            <p className="text-sm text-muted-foreground font-bengali">কোন প্যানেল কনফিগার করা হয়নি</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
