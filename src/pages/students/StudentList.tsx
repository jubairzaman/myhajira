import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
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

interface Student {
  id: string;
  name: string;
  name_bn: string | null;
  student_id_number: string | null;
  guardian_mobile: string;
  blood_group: string | null;
  photo_url: string | null;
  is_active: boolean;
  shift: { id: string; name: string } | null;
  class: { id: string; name: string } | null;
  section: { id: string; name: string } | null;
  rfid_card: { card_number: string } | null;
}

interface ClassOption {
  id: string;
  name: string;
}

export default function StudentList() {
  const { activeYear } = useAcademicYear();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [activeYear]);

  const fetchStudents = async () => {
    if (!activeYear) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id, name, name_bn, student_id_number, guardian_mobile, blood_group, photo_url, is_active,
          shift:shifts(id, name),
          class:classes(id, name),
          section:sections(id, name),
          rfid_card:rfid_cards_students(card_number)
        `)
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Transform data to handle array returns from joins
      const transformedData = (data || []).map(student => ({
        ...student,
        shift: Array.isArray(student.shift) ? student.shift[0] : student.shift,
        class: Array.isArray(student.class) ? student.class[0] : student.class,
        section: Array.isArray(student.section) ? student.section[0] : student.section,
        rfid_card: Array.isArray(student.rfid_card) ? student.rfid_card[0] : student.rfid_card,
      }));

      setStudents(transformedData as Student[]);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await supabase
        .from('classes')
        .select('id, name')
        .eq('is_active', true)
        .order('grade_order');
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to deactivate this student?')) return;
    
    try {
      const { error } = await supabase
        .from('students')
        .update({ is_active: false })
        .eq('id', studentId);

      if (error) throw error;
      
      toast.success('Student deactivated');
      fetchStudents();
    } catch (error: any) {
      toast.error('Failed to deactivate student');
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.name_bn && student.name_bn.includes(searchQuery));
    const matchesClass = classFilter === 'all' || student.class?.id === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <MainLayout title="Students" titleBn="শিক্ষার্থী">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">All Students ({students.length})</h2>
            <p className="text-sm text-muted-foreground font-bengali">সকল শিক্ষার্থীর তালিকা</p>
          </div>
        </div>

        <Link to="/students/new">
          <Button variant="hero" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
            <span className="font-bengali">/ শিক্ষার্থী যোগ</span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name... / নাম দিয়ে খুঁজুন..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="card-elevated p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      ) : (
        /* Student Table */
        <div className="card-elevated overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class / Section</th>
                <th>Shift</th>
                <th>Guardian Mobile</th>
                <th>RFID Card</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr 
                  key={student.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={student.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`}
                        alt={student.name}
                        className="w-10 h-10 rounded-full bg-muted"
                      />
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground font-bengali">{student.name_bn || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="font-medium">{student.class?.name || '-'}</p>
                    <p className="text-sm text-muted-foreground">{student.section?.name || '-'}</p>
                  </td>
                  <td>
                    <p className="font-medium">{student.shift?.name || '-'}</p>
                  </td>
                  <td>
                    <p className="font-mono text-sm">{student.guardian_mobile}</p>
                  </td>
                  <td>
                    {student.rfid_card?.card_number ? (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-success" />
                        <span className="text-sm font-mono text-success">{student.rfid_card.card_number}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not enrolled</span>
                    )}
                  </td>
                  <td className="text-right">
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
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CreditCard className="w-4 h-4 mr-2" />
                          {student.rfid_card ? 'Change Card' : 'Enroll Card'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">No students found</p>
              <p className="text-sm text-muted-foreground font-bengali">কোন শিক্ষার্থী পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
}
