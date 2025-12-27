import { useState } from 'react';
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
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Mock data
const students = [
  {
    id: '1',
    nameEnglish: 'Mohammad Rafiq',
    nameBangla: 'মোহাম্মদ রফিক',
    class: 'Class 10',
    section: 'A',
    shift: 'Morning',
    panel: 'Boys',
    guardianMobile: '01712345678',
    rfidCardId: 'RFID-ABC123',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafiq',
    status: 'active',
  },
  {
    id: '2',
    nameEnglish: 'Fatima Akter',
    nameBangla: 'ফাতিমা আক্তার',
    class: 'Class 9',
    section: 'B',
    shift: 'Morning',
    panel: 'Girls',
    guardianMobile: '01812345678',
    rfidCardId: 'RFID-DEF456',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima',
    status: 'active',
  },
  {
    id: '3',
    nameEnglish: 'Abdul Karim',
    nameBangla: 'আব্দুল করিম',
    class: 'Class 8',
    section: 'A',
    shift: 'Day',
    panel: 'Boys',
    guardianMobile: '01912345678',
    rfidCardId: 'RFID-GHI789',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=karim',
    status: 'active',
  },
  {
    id: '4',
    nameEnglish: 'Nasreen Begum',
    nameBangla: 'নাসরীন বেগম',
    class: 'Class 7',
    section: 'C',
    shift: 'Morning',
    panel: 'Girls',
    guardianMobile: '01612345678',
    rfidCardId: null,
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nasreen',
    status: 'active',
  },
];

export default function StudentList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nameBangla.includes(searchQuery);
    const matchesClass = classFilter === 'all' || student.class === classFilter;
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
            <h2 className="text-xl font-semibold">All Students</h2>
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
                {Array.from({ length: 10 }, (_, i) => (
                  <SelectItem key={i + 1} value={`Class ${i + 1}`}>
                    Class {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="card-elevated overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class / Section</th>
              <th>Shift / Panel</th>
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
                      src={student.photoUrl}
                      alt={student.nameEnglish}
                      className="w-10 h-10 rounded-full bg-muted"
                    />
                    <div>
                      <p className="font-medium text-foreground">{student.nameEnglish}</p>
                      <p className="text-sm text-muted-foreground font-bengali">{student.nameBangla}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p className="font-medium">{student.class}</p>
                  <p className="text-sm text-muted-foreground">Section {student.section}</p>
                </td>
                <td>
                  <p className="font-medium">{student.shift}</p>
                  <p className="text-sm text-muted-foreground">{student.panel} Panel</p>
                </td>
                <td>
                  <p className="font-mono text-sm">{student.guardianMobile}</p>
                </td>
                <td>
                  {student.rfidCardId ? (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-success" />
                      <span className="text-sm font-mono text-success">{student.rfidCardId}</span>
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
                        {student.rfidCardId ? 'Change Card' : 'Enroll Card'}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
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
    </MainLayout>
  );
}
