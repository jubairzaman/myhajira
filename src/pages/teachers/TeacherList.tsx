import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const teachers = [
  {
    id: '1',
    name: 'Dr. Mohammad Hasan',
    designation: 'Head Teacher',
    shift: 'Morning',
    mobile: '01712345678',
    rfidCardId: 'RFID-TCH001',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hasan',
    bloodGroup: 'A+',
  },
  {
    id: '2',
    name: 'Fatima Begum',
    designation: 'Senior Teacher',
    shift: 'Morning',
    mobile: '01812345678',
    rfidCardId: 'RFID-TCH002',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatimab',
    bloodGroup: 'B+',
  },
  {
    id: '3',
    name: 'Shahidul Islam',
    designation: 'Assistant Teacher',
    shift: 'Day',
    mobile: '01912345678',
    rfidCardId: 'RFID-TCH003',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shahid',
    bloodGroup: 'O+',
  },
  {
    id: '4',
    name: 'Rukhsana Akter',
    designation: 'Junior Teacher',
    shift: 'Morning',
    mobile: '01612345678',
    rfidCardId: null,
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rukhsana',
    bloodGroup: 'AB+',
  },
];

export default function TeacherList() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h2 className="text-xl font-semibold">All Teachers</h2>
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

      {/* Teacher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTeachers.map((teacher, index) => (
          <div
            key={teacher.id}
            className="card-elevated p-6 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <img
                src={teacher.photoUrl}
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
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {teacher.rfidCardId ? 'Change Card' : 'Enroll Card'}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="font-semibold text-lg text-foreground mb-1">{teacher.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{teacher.designation}</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shift</span>
                <span className="font-medium">{teacher.shift}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mobile</span>
                <span className="font-mono">{teacher.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blood Group</span>
                <span className="font-medium text-destructive">{teacher.bloodGroup}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">RFID Card</span>
                {teacher.rfidCardId ? (
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

      {filteredTeachers.length === 0 && (
        <div className="card-elevated text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No teachers found</p>
          <p className="text-sm text-muted-foreground font-bengali">কোন শিক্ষক পাওয়া যায়নি</p>
        </div>
      )}
    </MainLayout>
  );
}
