import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useStudentsQuery, useClassesQuery, Student } from '@/hooks/queries/useStudentsQuery';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function StudentList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeYear } = useAcademicYear();
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  const { data: students = [], isLoading: studentsLoading } = useStudentsQuery(activeYear?.id);
  const { data: classes = [] } = useClassesQuery();

  const handleDelete = useCallback(async (studentId: string) => {
    if (!confirm('আপনি কি এই শিক্ষার্থীকে স্থায়ীভাবে মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।')) return;
    
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
      
      toast.success('শিক্ষার্থী মুছে ফেলা হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['students', activeYear?.id] });
    } catch (error: any) {
      toast.error('শিক্ষার্থী মুছে ফেলা সম্ভব হয়নি');
    }
  }, [activeYear?.id, queryClient]);

  const filteredStudents = useMemo(() => {
    return students.filter((student: Student) => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.name_bn && student.name_bn.includes(searchQuery));
      const matchesClass = classFilter === 'all' || student.class?.id === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [students, searchQuery, classFilter]);

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
      {studentsLoading ? (
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
                  style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={student.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`}
                        alt={student.name}
                        className="w-10 h-10 rounded-full bg-muted"
                        loading="lazy"
                        decoding="async"
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
                        <DropdownMenuItem onClick={() => navigate(`/students/${student.id}/edit`)}>
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
                          Delete / মুছুন
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
