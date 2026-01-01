import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  CreditCard,
  Eye,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { toast } from 'sonner';

const designationLabels: Record<string, string> = {
  head_teacher: 'Head Teacher',
  assistant_head: 'Assistant Head Teacher',
  senior_teacher: 'Senior Teacher',
  assistant_teacher: 'Assistant Teacher',
  junior_teacher: 'Junior Teacher',
};

interface Teacher {
  id: string;
  name: string;
  name_bn: string | null;
  designation: string;
  mobile: string;
  blood_group: string | null;
  photo_url: string | null;
  is_active: boolean;
  shift: { id: string; name: string } | null;
  rfid_card: { card_number: string } | null;
}

export default function TeacherList() {
  const navigate = useNavigate();
  const { activeYear } = useAcademicYear();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, [activeYear]);

  const fetchTeachers = async () => {
    if (!activeYear) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id, name, name_bn, designation, mobile, blood_group, photo_url, is_active,
          shift:shifts(id, name),
          rfid_card:rfid_cards_teachers(card_number)
        `)
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Transform data to handle array returns from joins
      const transformedData = (data || []).map(teacher => ({
        ...teacher,
        shift: Array.isArray(teacher.shift) ? teacher.shift[0] : teacher.shift,
        rfid_card: Array.isArray(teacher.rfid_card) ? teacher.rfid_card[0] : teacher.rfid_card,
      }));

      setTeachers(transformedData as Teacher[]);
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teacherId: string) => {
    if (!confirm('Are you sure you want to deactivate this teacher?')) return;
    
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ is_active: false })
        .eq('id', teacherId);

      if (error) throw error;
      
      toast.success('Teacher deactivated');
      fetchTeachers();
    } catch (error: any) {
      toast.error('Failed to deactivate teacher');
    }
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.name_bn && teacher.name_bn.includes(searchQuery))
  );

  return (
    <MainLayout title="Teachers" titleBn="শিক্ষক">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-info" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">All Teachers ({teachers.length})</h2>
            <p className="text-sm text-muted-foreground font-bengali">সকল শিক্ষকের তালিকা</p>
          </div>
        </div>

        <Link to="/teachers/new">
          <Button variant="hero" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Teacher</span>
            <span className="font-bengali">/ শিক্ষক যোগ</span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name... / নাম দিয়ে খুঁজুন..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="card-elevated p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading teachers...</p>
        </div>
      ) : (
        /* Teacher Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTeachers.map((teacher, index) => (
            <div
              key={teacher.id}
              className="card-elevated p-6 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <img
                  src={teacher.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.id}`}
                  alt={teacher.name}
                  className="w-16 h-16 rounded-full bg-muted"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/teachers/${teacher.id}/edit`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className="w-4 h-4 mr-2" />
                      {teacher.rfid_card ? 'Change Card' : 'Enroll Card'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(teacher.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deactivate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="font-semibold text-lg text-foreground mb-1">{teacher.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {designationLabels[teacher.designation] || teacher.designation}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shift</span>
                  <span className="font-medium">{teacher.shift?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mobile</span>
                  <span className="font-mono">{teacher.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blood Group</span>
                  <span className="font-medium text-destructive">{teacher.blood_group || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">RFID Card</span>
                  {teacher.rfid_card?.card_number ? (
                    <span className="text-success flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      Enrolled
                    </span>
                  ) : (
                    <span className="text-warning">Not enrolled</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredTeachers.length === 0 && (
        <div className="card-elevated text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No teachers found</p>
          <p className="text-sm text-muted-foreground font-bengali">কোন শিক্ষক পাওয়া যায়নি</p>
        </div>
      )}
    </MainLayout>
  );
}
