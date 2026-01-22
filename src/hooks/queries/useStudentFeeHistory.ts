import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';

export interface StudentFeeHistoryRecord {
  id: string;
  feeType: string;
  feeMonth: string | null;
  examName: string | null;
  amountDue: number;
  amountPaid: number;
  lateFine: number;
  remaining: number;
  status: string;
  receiptNumber: string | null;
  paymentDate: string | null;
  createdAt: string;
}

export interface StudentFeeHistorySummary {
  studentId: string;
  studentName: string;
  studentNameBn: string | null;
  studentIdNumber: string | null;
  className: string;
  classNameBn: string | null;
  sectionName: string | null;
  guardianMobile: string;
  photoUrl: string | null;
  totalDue: number;
  totalPaid: number;
  totalLateFine: number;
  totalRemaining: number;
  records: StudentFeeHistoryRecord[];
}

export function useStudentFeeHistory(studentId: string | null) {
  const { activeYear } = useAcademicYear();

  return useQuery({
    queryKey: ['student-fee-history', activeYear?.id, studentId],
    queryFn: async (): Promise<StudentFeeHistorySummary | null> => {
      if (!activeYear?.id || !studentId) return null;

      // Fetch student info
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          name_bn,
          student_id_number,
          guardian_mobile,
          photo_url,
          classes(id, name, name_bn),
          sections(name)
        `)
        .eq('id', studentId)
        .single();

      if (studentError || !student) return null;

      // Fetch fee records
      const { data: feeRecords, error: feeError } = await supabase
        .from('student_fee_records')
        .select(`
          id,
          fee_type,
          fee_month,
          amount_due,
          amount_paid,
          late_fine,
          status,
          receipt_number,
          payment_date,
          created_at,
          exams(name, name_bn)
        `)
        .eq('student_id', studentId)
        .eq('academic_year_id', activeYear.id)
        .order('created_at', { ascending: true });

      if (feeError) throw feeError;

      const records: StudentFeeHistoryRecord[] = (feeRecords || []).map((r: any) => ({
        id: r.id,
        feeType: r.fee_type,
        feeMonth: r.fee_month,
        examName: r.exams?.name_bn || r.exams?.name || null,
        amountDue: r.amount_due,
        amountPaid: r.amount_paid,
        lateFine: r.late_fine,
        remaining: r.amount_due + r.late_fine - r.amount_paid,
        status: r.status,
        receiptNumber: r.receipt_number,
        paymentDate: r.payment_date,
        createdAt: r.created_at,
      }));

      const summary: StudentFeeHistorySummary = {
        studentId: student.id,
        studentName: student.name,
        studentNameBn: student.name_bn,
        studentIdNumber: student.student_id_number,
        className: (student.classes as any)?.name || '',
        classNameBn: (student.classes as any)?.name_bn || null,
        sectionName: (student.sections as any)?.name || null,
        guardianMobile: student.guardian_mobile,
        photoUrl: student.photo_url,
        totalDue: records.reduce((sum, r) => sum + r.amountDue, 0),
        totalPaid: records.reduce((sum, r) => sum + r.amountPaid, 0),
        totalLateFine: records.reduce((sum, r) => sum + r.lateFine, 0),
        totalRemaining: records.reduce((sum, r) => sum + r.remaining, 0),
        records,
      };

      return summary;
    },
    enabled: !!activeYear?.id && !!studentId,
  });
}

// Search students by ID number or name
export function useSearchStudentsForFee(searchTerm: string) {
  const { activeYear } = useAcademicYear();

  return useQuery({
    queryKey: ['search-students-fee', activeYear?.id, searchTerm],
    queryFn: async () => {
      if (!activeYear?.id || searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          name,
          name_bn,
          student_id_number,
          classes(name, name_bn),
          sections(name)
        `)
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true)
        .or(`student_id_number.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,name_bn.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      return (data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        nameBn: s.name_bn,
        studentIdNumber: s.student_id_number,
        className: s.classes?.name_bn || s.classes?.name || '',
        sectionName: s.sections?.name || null,
      }));
    },
    enabled: !!activeYear?.id && searchTerm.length >= 2,
  });
}
