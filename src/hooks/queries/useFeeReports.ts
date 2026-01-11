import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';

// Types
export interface ClassCollectionReport {
  studentId: string;
  studentName: string;
  studentNameBn: string | null;
  studentIdNumber: string | null;
  totalDue: number;
  totalPaid: number;
  totalLateFine: number;
  remaining: number;
  status: 'paid' | 'partial' | 'unpaid';
}

export interface MonthlyCollectionSummary {
  classId: string;
  className: string;
  classNameBn: string | null;
  gradeOrder: number;
  totalStudents: number;
  totalDue: number;
  totalPaid: number;
  collectionRate: number;
}

export interface DefaulterRecord {
  studentId: string;
  studentName: string;
  studentNameBn: string | null;
  studentIdNumber: string | null;
  className: string;
  sectionName: string | null;
  feeType: string;
  feeMonth: string | null;
  amountDue: number;
  amountPaid: number;
  remaining: number;
  daysOverdue: number;
}

// Class-wise Collection Report
export function useClassCollectionReport(classId: string | null, month: string | null) {
  const { activeYear } = useAcademicYear();

  return useQuery({
    queryKey: ['class-collection-report', activeYear?.id, classId, month],
    queryFn: async () => {
      if (!activeYear?.id || !classId) return [];

      let query = supabase
        .from('student_fee_records')
        .select(`
          student_id,
          fee_type,
          fee_month,
          amount_due,
          amount_paid,
          late_fine,
          status,
          students!inner(
            id,
            name,
            name_bn,
            student_id_number,
            class_id
          )
        `)
        .eq('academic_year_id', activeYear.id)
        .eq('students.class_id', classId);

      if (month) {
        query = query.eq('fee_month', month);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by student
      const studentMap = new Map<string, ClassCollectionReport>();

      (data || []).forEach((record: any) => {
        const studentId = record.student_id;
        const existing = studentMap.get(studentId);

        if (existing) {
          existing.totalDue += record.amount_due;
          existing.totalPaid += record.amount_paid;
          existing.totalLateFine += record.late_fine;
          existing.remaining += (record.amount_due + record.late_fine - record.amount_paid);
        } else {
          studentMap.set(studentId, {
            studentId,
            studentName: record.students.name,
            studentNameBn: record.students.name_bn,
            studentIdNumber: record.students.student_id_number,
            totalDue: record.amount_due,
            totalPaid: record.amount_paid,
            totalLateFine: record.late_fine,
            remaining: record.amount_due + record.late_fine - record.amount_paid,
            status: 'unpaid',
          });
        }
      });

      // Calculate status
      const result = Array.from(studentMap.values()).map((student) => {
        const total = student.totalDue + student.totalLateFine;
        if (student.totalPaid >= total) {
          student.status = 'paid';
        } else if (student.totalPaid > 0) {
          student.status = 'partial';
        } else {
          student.status = 'unpaid';
        }
        return student;
      });

      return result.sort((a, b) => a.studentName.localeCompare(b.studentName));
    },
    enabled: !!activeYear?.id && !!classId,
  });
}

// Monthly Collection Summary (all classes)
export function useMonthlyCollectionSummary(month: string | null) {
  const { activeYear } = useAcademicYear();

  return useQuery({
    queryKey: ['monthly-collection-summary', activeYear?.id, month],
    queryFn: async () => {
      if (!activeYear?.id || !month) return [];

      // Get all classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id, name, name_bn, grade_order')
        .eq('is_active', true)
        .order('grade_order');

      if (!classes) return [];

      // Get fee records for the month
      const { data: feeRecords } = await supabase
        .from('student_fee_records')
        .select(`
          amount_due,
          amount_paid,
          students!inner(class_id)
        `)
        .eq('academic_year_id', activeYear.id)
        .eq('fee_month', month)
        .eq('fee_type', 'monthly');

      // Get student counts per class
      const { data: studentCounts } = await supabase
        .from('students')
        .select('class_id')
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true);

      // Group fee records by class
      const classRecordsMap = new Map<string, { due: number; paid: number }>();
      (feeRecords || []).forEach((record: any) => {
        const classId = record.students.class_id;
        const existing = classRecordsMap.get(classId) || { due: 0, paid: 0 };
        existing.due += record.amount_due;
        existing.paid += record.amount_paid;
        classRecordsMap.set(classId, existing);
      });

      // Count students per class
      const studentCountMap = new Map<string, number>();
      (studentCounts || []).forEach((s: any) => {
        studentCountMap.set(s.class_id, (studentCountMap.get(s.class_id) || 0) + 1);
      });

      // Build summary
      const summary: MonthlyCollectionSummary[] = classes.map((cls) => {
        const records = classRecordsMap.get(cls.id) || { due: 0, paid: 0 };
        const totalStudents = studentCountMap.get(cls.id) || 0;
        
        return {
          classId: cls.id,
          className: cls.name,
          classNameBn: cls.name_bn,
          gradeOrder: cls.grade_order,
          totalStudents,
          totalDue: records.due,
          totalPaid: records.paid,
          collectionRate: records.due > 0 ? (records.paid / records.due) * 100 : 0,
        };
      });

      return summary.sort((a, b) => a.gradeOrder - b.gradeOrder);
    },
    enabled: !!activeYear?.id && !!month,
  });
}

// Defaulter List
export function useDefaulterList(classId?: string, feeType?: string) {
  const { activeYear } = useAcademicYear();

  return useQuery({
    queryKey: ['defaulter-list', activeYear?.id, classId, feeType],
    queryFn: async () => {
      if (!activeYear?.id) return [];

      let query = supabase
        .from('student_fee_records')
        .select(`
          id,
          student_id,
          fee_type,
          fee_month,
          amount_due,
          amount_paid,
          late_fine,
          created_at,
          students!inner(
            id,
            name,
            name_bn,
            student_id_number,
            class_id,
            classes(name),
            sections(name)
          )
        `)
        .eq('academic_year_id', activeYear.id)
        .neq('status', 'paid');

      if (classId) {
        query = query.eq('students.class_id', classId);
      }

      if (feeType) {
        query = query.eq('fee_type', feeType);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;

      const today = new Date();

      const defaulters: DefaulterRecord[] = (data || []).map((record: any) => {
        const createdAt = new Date(record.created_at);
        const daysOverdue = Math.floor((today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const remaining = record.amount_due + record.late_fine - record.amount_paid;

        return {
          studentId: record.student_id,
          studentName: record.students.name,
          studentNameBn: record.students.name_bn,
          studentIdNumber: record.students.student_id_number,
          className: record.students.classes?.name || '',
          sectionName: record.students.sections?.name || null,
          feeType: record.fee_type,
          feeMonth: record.fee_month,
          amountDue: record.amount_due,
          amountPaid: record.amount_paid,
          remaining,
          daysOverdue,
        };
      });

      return defaulters.filter((d) => d.remaining > 0).sort((a, b) => b.daysOverdue - a.daysOverdue);
    },
    enabled: !!activeYear?.id,
  });
}

// Collection Summary Stats
export function useFeeCollectionStats() {
  const { activeYear } = useAcademicYear();

  return useQuery({
    queryKey: ['fee-collection-stats', activeYear?.id],
    queryFn: async () => {
      if (!activeYear?.id) return null;

      const { data, error } = await supabase
        .from('student_fee_records')
        .select('amount_due, amount_paid, late_fine, status')
        .eq('academic_year_id', activeYear.id);

      if (error) throw error;

      const stats = {
        totalDue: 0,
        totalPaid: 0,
        totalLateFine: 0,
        totalRemaining: 0,
        paidCount: 0,
        partialCount: 0,
        unpaidCount: 0,
      };

      (data || []).forEach((record) => {
        stats.totalDue += record.amount_due;
        stats.totalPaid += record.amount_paid;
        stats.totalLateFine += record.late_fine;
        stats.totalRemaining += (record.amount_due + record.late_fine - record.amount_paid);

        if (record.status === 'paid') stats.paidCount++;
        else if (record.status === 'partial') stats.partialCount++;
        else stats.unpaidCount++;
      });

      return stats;
    },
    enabled: !!activeYear?.id,
  });
}
