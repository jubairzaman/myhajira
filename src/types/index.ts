// Academic Year
export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

// Shift
export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  academicYearId: string;
  isActive: boolean;
}

// Panel
export interface Panel {
  id: string;
  name: string;
  shiftId: string;
  startTime: string;
  lateThreshold: string;
  absentCutoff: string;
  smsTriggerTime: string;
  type: 'student' | 'teacher';
}

// Class
export interface Class {
  id: string;
  name: string;
  panelId: string;
  order: number;
}

// Section
export interface Section {
  id: string;
  name: string;
  classId: string;
}

// Student
export interface Student {
  id: string;
  nameEnglish: string;
  nameBangla: string;
  shiftId: string;
  panelId: string;
  classId: string;
  sectionId: string;
  guardianMobile: string;
  bloodGroup: string;
  photoUrl: string;
  rfidCardId: string;
  academicYearId: string;
  isActive: boolean;
  createdAt: string;
}

// Teacher
export interface Teacher {
  id: string;
  name: string;
  designation: string;
  shiftId: string;
  panelId: string;
  mobile: string;
  bloodGroup: string;
  photoUrl: string;
  rfidCardId: string;
  isActive: boolean;
  createdAt: string;
}

// RFID Card
export interface RfidCard {
  id: string;
  cardNumber: string;
  assignedTo: 'student' | 'teacher' | null;
  assignedId: string | null;
  deviceId: string;
  isActive: boolean;
  enrolledAt: string;
}

// ZKTeco Device
export interface Device {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  location: string;
  isOnline: boolean;
  lastSync: string;
  createdAt: string;
}

// Attendance Record
export interface AttendanceRecord {
  id: string;
  entityType: 'student' | 'teacher';
  entityId: string;
  date: string;
  punchInTime: string | null;
  punchOutTime: string | null;
  status: 'present' | 'late' | 'absent';
  lateMinutes: number;
  deviceId: string;
  academicYearId: string;
  isManual: boolean;
  manualReason?: string;
  editedBy?: string;
  editedAt?: string;
}

// SMS Log
export interface SmsLog {
  id: string;
  recipientMobile: string;
  message: string;
  type: 'absent' | 'late' | 'summary';
  status: 'sent' | 'failed' | 'pending';
  retryCount: number;
  studentId?: string;
  sentAt: string;
}

// User Roles
export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'operator';

// User
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  attendanceRate: number;
}

// Live Punch Display
export interface LivePunch {
  id: string;
  name: string;
  nameBangla?: string;
  photo: string;
  class?: string;
  section?: string;
  designation?: string;
  punchTime: string;
  status: 'present' | 'late';
  lateMinutes?: number;
  type: 'student' | 'teacher';
}

// Top Attendance Student
export interface TopAttendanceStudent {
  id: string;
  name: string;
  nameBangla: string;
  photo: string;
  class: string;
  section: string;
  presentDays: number;
  totalDays: number;
  percentage: number;
}
