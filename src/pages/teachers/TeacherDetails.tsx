import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Loader2,
  User,
  Phone,
  CreditCard,
  Calendar,
  AlertCircle,
  Edit,
  Briefcase,
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';

interface TeacherData {
  id: string;
  name: string;
  name_bn: string | null;
  designation: string;
  mobile: string;
  blood_group: string | null;
  photo_url: string | null;
  is_active: boolean;
  shift: { id: string; name: string; name_bn: string | null } | null;
  rfid_card: { card_number: string } | null;
}

const designationLabels: Record<string, string> = {
  head_teacher: 'প্রধান শিক্ষক',
  assistant_head: 'সহকারী প্রধান শিক্ষক',
  senior_teacher: 'সিনিয়র শিক্ষক',
  assistant_teacher: 'সহকারী শিক্ষক',
  junior_teacher: 'জুনিয়র শিক্ষক',
};

export default function TeacherDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeYear } = useAcademicYear();
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState<{
    present: number;
    late: number;
    absent: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('teachers')
          .select(`
            id, name, name_bn, designation, mobile, blood_group, photo_url, is_active,
            shift:shifts(id, name, name_bn),
            rfid_card:rfid_cards_teachers(card_number)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        setTeacher({
          ...data,
          shift: Array.isArray(data.shift) ? data.shift[0] : data.shift,
          rfid_card: Array.isArray(data.rfid_card) ? data.rfid_card[0] : data.rfid_card,
        } as TeacherData);
      } catch (error) {
        console.error('Error fetching teacher:', error);
        toast.error('শিক্ষকের তথ্য লোড করা যায়নি');
        navigate('/teachers');
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id, navigate]);

  // Fetch attendance stats
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!id || !activeYear?.id) return;
      const { data } = await supabase
        .from('teacher_attendance')
        .select('status')
        .eq('teacher_id', id)
        .eq('academic_year_id', activeYear.id);

      if (data) {
        const present = data.filter(r => r.status === 'present').length;
        const late = data.filter(r => r.status === 'late').length;
        const absent = data.filter(r => r.status === 'absent').length;
        setAttendanceStats({ present, late, absent, total: data.length });
      }
    };
    fetchAttendance();
  }, [id, activeYear?.id]);

  if (loading) {
    return (
      <MainLayout title="Teacher Details" titleBn="শিক্ষকের বিস্তারিত">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!teacher) {
    return (
      <MainLayout title="Teacher Details" titleBn="শিক্ষকের বিস্তারিত">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p>শিক্ষক পাওয়া যায়নি</p>
        </div>
      </MainLayout>
    );
  }

  const attendancePercentage = attendanceStats && attendanceStats.total > 0
    ? (((attendanceStats.present + attendanceStats.late) / attendanceStats.total) * 100).toFixed(1)
    : null;

  return (
    <MainLayout title="Teacher Details" titleBn="শিক্ষকের বিস্তারিত">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/teachers">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <img
                src={teacher.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.id}`}
                alt={teacher.name}
                className="w-16 h-16 rounded-full bg-muted border-2 border-primary/20"
              />
              <div>
                <h2 className="text-xl font-semibold">{teacher.name}</h2>
                {teacher.name_bn && (
                  <p className="text-muted-foreground font-bengali">{teacher.name_bn}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={teacher.is_active ? 'default' : 'secondary'}>
                    {teacher.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <Link to={`/teachers/${id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              সম্পাদনা
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* Professional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="w-5 h-5" />
                <span className="font-bengali">পেশাগত তথ্য</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-bengali">পদবি</p>
                <p className="font-medium">{designationLabels[teacher.designation] || teacher.designation}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-bengali">শিফট</p>
                <p className="font-medium">{teacher.shift?.name || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="w-5 h-5" />
                <span className="font-bengali">যোগাযোগ ও অন্যান্য</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-bengali">মোবাইল</p>
                <p className="font-medium font-mono">{teacher.mobile}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-bengali">রক্তের গ্রুপ</p>
                <p className="font-medium">{teacher.blood_group || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-bengali">RFID কার্ড</p>
                {teacher.rfid_card?.card_number ? (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-success" />
                    <span className="font-mono text-sm text-success">
                      {teacher.rfid_card.card_number}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">নিবন্ধিত নয়</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Stats */}
          {attendanceStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  <span className="font-bengali">উপস্থিতি তথ্য</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{attendanceStats.total}</p>
                    <p className="text-sm text-muted-foreground font-bengali">মোট দিন</p>
                  </div>
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <p className="text-2xl font-bold text-success">{attendanceStats.present}</p>
                    <p className="text-sm text-muted-foreground font-bengali">উপস্থিত</p>
                  </div>
                  <div className="text-center p-3 bg-warning/10 rounded-lg">
                    <p className="text-2xl font-bold text-warning">{attendanceStats.late}</p>
                    <p className="text-sm text-muted-foreground font-bengali">বিলম্ব</p>
                  </div>
                  <div className="text-center p-3 bg-destructive/10 rounded-lg">
                    <p className="text-2xl font-bold text-destructive">{attendanceStats.absent}</p>
                    <p className="text-sm text-muted-foreground font-bengali">অনুপস্থিত</p>
                  </div>
                  {attendancePercentage && (
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{attendancePercentage}%</p>
                      <p className="text-sm text-muted-foreground font-bengali">উপস্থিতি হার</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
