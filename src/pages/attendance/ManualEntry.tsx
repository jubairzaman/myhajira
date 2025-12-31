import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Save, Loader2, Check, X, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  name: string;
  name_bn: string | null;
  photo_url: string | null;
  student_id_number: string | null;
  attendance_status: 'present' | 'late' | 'absent' | 'not_marked';
  attendance_id?: string;
}

interface Shift {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
}

export default function ManualEntry() {
  const { activeYear } = useAcademicYear();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  
  // Filters
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Students list
  const [students, setStudents] = useState<Student[]>([]);
  const [reason, setReason] = useState('');

  // Fetch shifts on load
  useEffect(() => {
    if (activeYear) {
      fetchShifts();
    }
  }, [activeYear]);

  // Fetch classes when shift changes
  useEffect(() => {
    if (selectedShift) {
      fetchClasses();
    }
  }, [selectedShift]);

  // Fetch sections when class changes
  useEffect(() => {
    if (selectedClass) {
      fetchSections();
    }
  }, [selectedClass]);

  // Fetch students when all filters are selected
  useEffect(() => {
    if (selectedShift && selectedClass && selectedSection && selectedDate) {
      fetchStudents();
    }
  }, [selectedShift, selectedClass, selectedSection, selectedDate]);

  const fetchShifts = async () => {
    if (!activeYear) return;
    const { data } = await supabase
      .from('shifts')
      .select('id, name')
      .eq('academic_year_id', activeYear.id)
      .eq('is_active', true);
    setShifts(data || []);
  };

  const fetchClasses = async () => {
    const { data } = await supabase
      .from('classes')
      .select('id, name')
      .eq('shift_id', selectedShift)
      .eq('is_active', true)
      .order('grade_order');
    setClasses(data || []);
    setSelectedClass('');
    setSections([]);
    setStudents([]);
  };

  const fetchSections = async () => {
    const { data } = await supabase
      .from('sections')
      .select('id, name')
      .eq('class_id', selectedClass)
      .eq('is_active', true);
    setSections(data || []);
    setSelectedSection('');
    setStudents([]);
  };

  const fetchStudents = async () => {
    if (!activeYear) return;
    setLoading(true);

    try {
      // Get all students for the selected class/section
      const { data: studentList, error } = await supabase
        .from('students')
        .select('id, name, name_bn, photo_url, student_id_number')
        .eq('academic_year_id', activeYear.id)
        .eq('shift_id', selectedShift)
        .eq('class_id', selectedClass)
        .eq('section_id', selectedSection)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Get attendance for selected date
      const { data: attendanceList } = await supabase
        .from('student_attendance')
        .select('id, student_id, status')
        .eq('attendance_date', selectedDate)
        .in('student_id', (studentList || []).map(s => s.id));

      const attendanceMap = new Map(
        (attendanceList || []).map(a => [a.student_id, { id: a.id, status: a.status }])
      );

      // Map students with their attendance status
      const studentsWithStatus: Student[] = (studentList || []).map(s => {
        const attendance = attendanceMap.get(s.id);
        return {
          ...s,
          attendance_status: attendance?.status as any || 'not_marked',
          attendance_id: attendance?.id,
        };
      });

      setStudents(studentsWithStatus);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // RULE 10 & 11: Mark attendance for a student
  const markAttendance = async (studentId: string, newStatus: 'present' | 'late' | 'absent') => {
    if (!activeYear || !user || !reason.trim()) {
      toast.error('Please provide a reason for manual entry');
      return;
    }

    setSaving(studentId);

    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const oldStatus = student.attendance_status;
      const punchTime = new Date(`${selectedDate}T${format(new Date(), 'HH:mm:ss')}`);

      if (student.attendance_id) {
        // RULE 11 Case 2: Attendance exists - allow admin override
        const { error } = await supabase
          .from('student_attendance')
          .update({
            status: newStatus,
            punch_time: punchTime.toISOString(),
            is_manual: true,
            manual_by: user.id,
            manual_reason: reason,
          })
          .eq('id', student.attendance_id);

        if (error) throw error;
      } else {
        // RULE 11 Case 1: Attendance does not exist - create new
        const { error } = await supabase
          .from('student_attendance')
          .insert({
            student_id: studentId,
            attendance_date: selectedDate,
            punch_time: punchTime.toISOString(),
            status: newStatus,
            academic_year_id: activeYear.id,
            is_manual: true,
            manual_by: user.id,
            manual_reason: reason,
          });

        if (error) throw error;
      }

      // Log manual action (RULE 11)
      await supabase.from('manual_attendance_logs').insert({
        person_id: studentId,
        person_type: 'student',
        attendance_date: selectedDate,
        admin_id: user.id,
        old_status: oldStatus === 'not_marked' ? null : oldStatus,
        new_status: newStatus,
        reason: reason,
      });

      toast.success(`Marked ${student.name} as ${newStatus}`);
      fetchStudents(); // Refresh list
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      toast.error(error.message || 'Failed to save attendance');
    } finally {
      setSaving(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">Present</span>;
      case 'late':
        return <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded-full">Late</span>;
      case 'absent':
        return <span className="px-2 py-1 bg-destructive/20 text-destructive text-xs rounded-full">Absent</span>;
      default:
        return <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">Not Marked</span>;
    }
  };

  return (
    <MainLayout title="Manual Entry" titleBn="ম্যানুয়াল এন্ট্রি">
      <div className="space-y-6">
        {/* Filters Card */}
        <div className="card-elevated p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Edit className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Manual Student Attendance</h2>
              <p className="text-sm text-muted-foreground font-bengali">ম্যানুয়াল ছাত্র উপস্থিতি</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Shift</Label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger><SelectValue placeholder="Select Shift" /></SelectTrigger>
                <SelectContent>
                  {shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass} disabled={!selectedShift}>
                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedClass}>
                <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                <SelectContent>
                  {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {students.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="form-label-required">Reason for Manual Entry</Label>
              <Textarea
                placeholder="e.g., Device offline, Card malfunction..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>
          )}
        </div>

        {/* Students List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : students.length > 0 ? (
          <div className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Student</th>
                    <th className="text-center p-3 text-sm font-medium">Status</th>
                    <th className="text-center p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover bg-muted"
                          />
                          <div>
                            <p className="font-medium text-sm">{student.name}</p>
                            {student.name_bn && <p className="text-xs text-muted-foreground font-bengali">{student.name_bn}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">{getStatusBadge(student.attendance_status)}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant={student.attendance_status === 'present' ? 'default' : 'outline'}
                            className={cn("gap-1", student.attendance_status === 'present' && "bg-success hover:bg-success/90")}
                            onClick={() => markAttendance(student.id, 'present')}
                            disabled={saving === student.id || !reason.trim()}
                          >
                            {saving === student.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            <span className="hidden sm:inline">Present</span>
                          </Button>
                          <Button
                            size="sm"
                            variant={student.attendance_status === 'late' ? 'default' : 'outline'}
                            className={cn("gap-1", student.attendance_status === 'late' && "bg-warning hover:bg-warning/90")}
                            onClick={() => markAttendance(student.id, 'late')}
                            disabled={saving === student.id || !reason.trim()}
                          >
                            {saving === student.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                            <span className="hidden sm:inline">Late</span>
                          </Button>
                          <Button
                            size="sm"
                            variant={student.attendance_status === 'absent' ? 'default' : 'outline'}
                            className={cn("gap-1", student.attendance_status === 'absent' && "bg-destructive hover:bg-destructive/90")}
                            onClick={() => markAttendance(student.id, 'absent')}
                            disabled={saving === student.id || !reason.trim()}
                          >
                            {saving === student.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                            <span className="hidden sm:inline">Absent</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : selectedSection ? (
          <div className="card-elevated p-8 text-center">
            <p className="text-muted-foreground">No students found for the selected filters</p>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
