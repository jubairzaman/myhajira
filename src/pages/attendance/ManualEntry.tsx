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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Search, Save, GraduationCap, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Student {
  id: string;
  name: string;
  name_bn: string | null;
  student_id_number: string | null;
  classes: { name: string } | null;
  sections: { name: string } | null;
}

interface Teacher {
  id: string;
  name: string;
  name_bn: string | null;
  designation: string;
}

export default function ManualEntry() {
  const { activeYear } = useAcademicYear();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Student | Teacher | null>(null);
  const [personType, setPersonType] = useState<'student' | 'teacher'>('student');
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    status: 'present',
    reason: '',
  });

  const searchPeople = async (query: string, type: 'student' | 'teacher') => {
    if (!query || query.length < 2 || !activeYear) return;

    try {
      if (type === 'student') {
        const { data } = await supabase
          .from('students')
          .select('id, name, name_bn, student_id_number, classes(name), sections(name)')
          .eq('academic_year_id', activeYear.id)
          .eq('is_active', true)
          .or(`name.ilike.%${query}%,name_bn.ilike.%${query}%,student_id_number.ilike.%${query}%`)
          .limit(10);
        setStudents((data as Student[]) || []);
      } else {
        const { data } = await supabase
          .from('teachers')
          .select('id, name, name_bn, designation')
          .eq('academic_year_id', activeYear.id)
          .eq('is_active', true)
          .or(`name.ilike.%${query}%,name_bn.ilike.%${query}%`)
          .limit(10);
        setTeachers((data as Teacher[]) || []);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchPeople(searchQuery, personType);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, personType]);

  const handleSubmit = async () => {
    if (!selectedPerson || !activeYear || !user) {
      toast.error('Please select a person first');
      return;
    }

    if (!formData.reason) {
      toast.error('Please provide a reason for manual entry');
      return;
    }

    setLoading(true);

    try {
      const punchTime = new Date(`${formData.date}T${formData.time}`);

      if (personType === 'student') {
        // Check if record exists
        const { data: existing } = await supabase
          .from('student_attendance')
          .select('id')
          .eq('student_id', selectedPerson.id)
          .eq('attendance_date', formData.date)
          .maybeSingle();

        if (existing) {
          // Update existing record
          const { error } = await supabase
            .from('student_attendance')
            .update({
              status: formData.status,
              punch_time: punchTime.toISOString(),
              is_manual: true,
              manual_by: user.id,
              manual_reason: formData.reason,
            })
            .eq('id', existing.id);

          if (error) throw error;
        } else {
          // Insert new record
          const { error } = await supabase
            .from('student_attendance')
            .insert({
              student_id: selectedPerson.id,
              attendance_date: formData.date,
              punch_time: punchTime.toISOString(),
              status: formData.status,
              academic_year_id: activeYear.id,
              is_manual: true,
              manual_by: user.id,
              manual_reason: formData.reason,
            });

          if (error) throw error;
        }
      } else {
        // Teacher attendance
        const { data: existing } = await supabase
          .from('teacher_attendance')
          .select('id')
          .eq('teacher_id', selectedPerson.id)
          .eq('attendance_date', formData.date)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('teacher_attendance')
            .update({
              status: formData.status,
              punch_in_time: punchTime.toISOString(),
              is_manual: true,
              manual_by: user.id,
              manual_reason: formData.reason,
            })
            .eq('id', existing.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('teacher_attendance')
            .insert({
              teacher_id: selectedPerson.id,
              attendance_date: formData.date,
              punch_in_time: punchTime.toISOString(),
              status: formData.status,
              academic_year_id: activeYear.id,
              is_manual: true,
              manual_by: user.id,
              manual_reason: formData.reason,
            });

          if (error) throw error;
        }
      }

      toast.success('Attendance recorded successfully');
      setSelectedPerson(null);
      setSearchQuery('');
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        status: 'present',
        reason: '',
      });
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      toast.error(error.message || 'Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Manual Entry" titleBn="ম্যানুয়াল এন্ট্রি">
      <div className="max-w-2xl mx-auto">
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Edit className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Manual Attendance Entry</h2>
              <p className="text-sm text-muted-foreground font-bengali">
                ম্যানুয়াল উপস্থিতি এন্ট্রি
              </p>
            </div>
          </div>

          <Tabs
            value={personType}
            onValueChange={(v) => {
              setPersonType(v as 'student' | 'teacher');
              setSelectedPerson(null);
              setSearchQuery('');
            }}
          >
            <TabsList className="w-full mb-6">
              <TabsTrigger value="student" className="flex-1 gap-2">
                <GraduationCap className="w-4 h-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="teacher" className="flex-1 gap-2">
                <Users className="w-4 h-4" />
                Teacher
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-4">
              <div className="space-y-2">
                <Label>Search Student</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {students.length > 0 && !selectedPerson && (
                  <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                    {students.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => {
                          setSelectedPerson(student);
                          setSearchQuery('');
                          setStudents([]);
                        }}
                        className="w-full p-3 text-left hover:bg-muted transition-colors"
                      >
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.classes?.name} - {student.sections?.name}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="teacher" className="space-y-4">
              <div className="space-y-2">
                <Label>Search Teacher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {teachers.length > 0 && !selectedPerson && (
                  <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                    {teachers.map((teacher) => (
                      <button
                        key={teacher.id}
                        onClick={() => {
                          setSelectedPerson(teacher);
                          setSearchQuery('');
                          setTeachers([]);
                        }}
                        className="w-full p-3 text-left hover:bg-muted transition-colors"
                      >
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-sm text-muted-foreground">{teacher.designation}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {selectedPerson && (
            <div className="mt-6 space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedPerson.name}</p>
                <p className="text-sm text-muted-foreground font-bengali">
                  {selectedPerson.name_bn}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setSelectedPerson(null)}
                >
                  Change
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present / উপস্থিত</SelectItem>
                    <SelectItem value="late">Late / বিলম্বে</SelectItem>
                    <SelectItem value="absent">Absent / অনুপস্থিত</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="form-label-required">Reason for Manual Entry</Label>
                <Textarea
                  placeholder="e.g., Device was offline, Card not working..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full gap-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Attendance
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
