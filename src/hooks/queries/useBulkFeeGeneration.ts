import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { toast } from 'sonner';

interface BulkGenerateParams {
  month: string;
  classId?: string; // Optional - if not provided, generate for all classes
}

interface AutoFeeGenerationParams {
  studentId: string;
  classId: string;
}

// Generate monthly fees for all/selected students
export function useBulkGenerateMonthlyFees() {
  const queryClient = useQueryClient();
  const { activeYear } = useAcademicYear();

  return useMutation({
    mutationFn: async ({ month, classId }: BulkGenerateParams) => {
      if (!activeYear?.id) throw new Error('No active academic year');

      // Get class monthly fees
      let feeQuery = supabase
        .from('class_monthly_fees')
        .select('class_id, amount')
        .eq('academic_year_id', activeYear.id);

      if (classId) {
        feeQuery = feeQuery.eq('class_id', classId);
      }

      const { data: classFees, error: feesError } = await feeQuery;
      if (feesError) throw feesError;

      if (!classFees || classFees.length === 0) {
        throw new Error('শ্রেণী ফি সেটআপ করা হয়নি');
      }

      // Create a map of class_id to amount
      const feeMap = new Map(classFees.map(f => [f.class_id, f.amount]));

      // Get all active students
      let studentsQuery = supabase
        .from('students')
        .select('id, class_id')
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true);

      if (classId) {
        studentsQuery = studentsQuery.eq('class_id', classId);
      }

      const { data: students, error: studentsError } = await studentsQuery;
      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        throw new Error('কোনো শিক্ষার্থী পাওয়া যায়নি');
      }

      // Check existing records for this month to avoid duplicates
      const { data: existingRecords } = await supabase
        .from('student_fee_records')
        .select('student_id')
        .eq('academic_year_id', activeYear.id)
        .eq('fee_type', 'monthly')
        .eq('fee_month', month);

      const existingStudentIds = new Set((existingRecords || []).map(r => r.student_id));

      // Filter out students who already have records
      const studentsToCreate = students.filter(s => !existingStudentIds.has(s.id));

      if (studentsToCreate.length === 0) {
        throw new Error('এই মাসের জন্য সব শিক্ষার্থীর ফি ইতিমধ্যে তৈরি আছে');
      }

      // Create fee records
      const feeRecords = studentsToCreate
        .filter(s => feeMap.has(s.class_id))
        .map(student => ({
          student_id: student.id,
          academic_year_id: activeYear.id,
          fee_type: 'monthly',
          fee_month: month,
          amount_due: feeMap.get(student.class_id) || 0,
          amount_paid: 0,
          late_fine: 0,
          status: 'unpaid',
        }));

      if (feeRecords.length === 0) {
        throw new Error('শ্রেণী ফি সেট করা হয়নি');
      }

      const { error: insertError } = await supabase
        .from('student_fee_records')
        .insert(feeRecords);

      if (insertError) throw insertError;

      return { count: feeRecords.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-fee-records'] });
      queryClient.invalidateQueries({ queryKey: ['fee-collection-stats'] });
      toast.success(`${data.count} জন শিক্ষার্থীর মাসিক ফি তৈরি হয়েছে`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'মাসিক ফি তৈরিতে সমস্যা হয়েছে');
      console.error(error);
    },
  });
}

// Auto-generate admission + session fees for a new student
export function useAutoGenerateAdmissionFees() {
  const queryClient = useQueryClient();
  const { activeYear } = useAcademicYear();

  return useMutation({
    mutationFn: async ({ studentId, classId }: AutoFeeGenerationParams) => {
      if (!activeYear?.id) throw new Error('No active academic year');

      // Get class fee settings
      const { data: classFee, error: feeError } = await supabase
        .from('class_monthly_fees')
        .select('admission_fee, session_charge')
        .eq('academic_year_id', activeYear.id)
        .eq('class_id', classId)
        .maybeSingle();

      if (feeError) throw feeError;

      // If no fee settings, skip (don't throw error as it might not be configured yet)
      if (!classFee) {
        console.log('No class fee settings found, skipping auto fee generation');
        return { created: 0 };
      }

      const records = [];

      // Create admission fee record if amount > 0
      if (classFee.admission_fee > 0) {
        records.push({
          student_id: studentId,
          academic_year_id: activeYear.id,
          fee_type: 'admission',
          amount_due: classFee.admission_fee,
          amount_paid: 0,
          late_fine: 0,
          status: 'unpaid',
        });
      }

      // Create session charge record if amount > 0
      if (classFee.session_charge > 0) {
        records.push({
          student_id: studentId,
          academic_year_id: activeYear.id,
          fee_type: 'session',
          amount_due: classFee.session_charge,
          amount_paid: 0,
          late_fine: 0,
          status: 'unpaid',
        });
      }

      if (records.length > 0) {
        const { error: insertError } = await supabase
          .from('student_fee_records')
          .insert(records);

        if (insertError) throw insertError;
      }

      return { created: records.length };
    },
    onSuccess: (data) => {
      if (data.created > 0) {
        queryClient.invalidateQueries({ queryKey: ['student-fee-records'] });
        toast.success('ভর্তি ফি ও সেশন চার্জ স্বয়ংক্রিয়ভাবে তৈরি হয়েছে');
      }
    },
    onError: (error) => {
      console.error('Auto fee generation error:', error);
      // Don't show toast error as this is background operation
    },
  });
}

// Generate exam fees for all students
export function useBulkGenerateExamFees() {
  const queryClient = useQueryClient();
  const { activeYear } = useAcademicYear();

  return useMutation({
    mutationFn: async ({ examId, classId }: { examId: string; classId?: string }) => {
      if (!activeYear?.id) throw new Error('No active academic year');

      // Get exam details
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .select('id, exam_fee_amount')
        .eq('id', examId)
        .single();

      if (examError) throw examError;
      if (!exam) throw new Error('পরীক্ষা পাওয়া যায়নি');

      // Get students
      let studentsQuery = supabase
        .from('students')
        .select('id')
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true);

      if (classId) {
        studentsQuery = studentsQuery.eq('class_id', classId);
      }

      const { data: students, error: studentsError } = await studentsQuery;
      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        throw new Error('কোনো শিক্ষার্থী পাওয়া যায়নি');
      }

      // Check existing records
      const { data: existingRecords } = await supabase
        .from('student_fee_records')
        .select('student_id')
        .eq('academic_year_id', activeYear.id)
        .eq('fee_type', 'exam')
        .eq('exam_id', examId);

      const existingStudentIds = new Set((existingRecords || []).map(r => r.student_id));
      const studentsToCreate = students.filter(s => !existingStudentIds.has(s.id));

      if (studentsToCreate.length === 0) {
        throw new Error('এই পরীক্ষার জন্য সব শিক্ষার্থীর ফি ইতিমধ্যে তৈরি আছে');
      }

      const records = studentsToCreate.map(student => ({
        student_id: student.id,
        academic_year_id: activeYear.id,
        fee_type: 'exam',
        exam_id: examId,
        amount_due: exam.exam_fee_amount,
        amount_paid: 0,
        late_fine: 0,
        status: 'unpaid',
      }));

      const { error: insertError } = await supabase
        .from('student_fee_records')
        .insert(records);

      if (insertError) throw insertError;

      return { count: records.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-fee-records'] });
      queryClient.invalidateQueries({ queryKey: ['fee-collection-stats'] });
      toast.success(`${data.count} জন শিক্ষার্থীর পরীক্ষা ফি তৈরি হয়েছে`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'পরীক্ষা ফি তৈরিতে সমস্যা হয়েছে');
      console.error(error);
    },
  });
}
