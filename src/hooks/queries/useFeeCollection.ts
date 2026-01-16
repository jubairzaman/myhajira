import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { toast } from 'sonner';

export interface StudentFeeRecord {
  id: string;
  student_id: string;
  academic_year_id: string;
  fee_type: 'monthly' | 'admission' | 'session' | 'exam';
  fee_month: string | null;
  exam_id: string | null;
  amount_due: number;
  amount_paid: number;
  late_fine: number;
  status: 'unpaid' | 'partial' | 'paid';
  payment_date: string | null;
  receipt_number: string | null;
  collected_by: string | null;
  exam?: {
    id: string;
    name: string;
    name_bn: string | null;
  } | null;
}

export interface StudentWithFees {
  id: string;
  name: string;
  name_bn: string | null;
  student_id_number: string | null;
  guardian_mobile: string;
  photo_url: string | null;
  class: { id: string; name: string; name_bn: string | null } | null;
  section: { id: string; name: string } | null;
  shift: { id: string; name: string } | null;
  rfid_card: { card_number: string } | null;
}

// Search student by ID or RFID
export function useSearchStudent() {
  const { activeYear } = useAcademicYear();

  return useMutation({
    mutationFn: async (searchTerm: string) => {
      if (!activeYear?.id || !searchTerm.trim()) return null;

      // First try to find by RFID card number
      const { data: rfidData } = await supabase
        .from('rfid_cards_students')
        .select('student_id')
        .eq('card_number', searchTerm.trim())
        .eq('is_active', true)
        .maybeSingle();

      let studentQuery = supabase
        .from('students')
        .select(`
          id, name, name_bn, student_id_number, guardian_mobile, photo_url,
          class:classes(id, name, name_bn),
          section:sections(id, name),
          shift:shifts(id, name),
          rfid_card:rfid_cards_students(card_number)
        `)
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true);

      if (rfidData?.student_id) {
        studentQuery = studentQuery.eq('id', rfidData.student_id);
      } else {
        // Search by student_id_number
        studentQuery = studentQuery.eq('student_id_number', searchTerm.trim());
      }

      const { data, error } = await studentQuery.maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Transform the data
      return {
        ...data,
        class: Array.isArray(data.class) ? data.class[0] : data.class,
        section: Array.isArray(data.section) ? data.section[0] : data.section,
        shift: Array.isArray(data.shift) ? data.shift[0] : data.shift,
        rfid_card: Array.isArray(data.rfid_card) ? data.rfid_card[0] : data.rfid_card,
      } as StudentWithFees;
    },
  });
}

// Get student fee records
export function useStudentFeeRecords(studentId: string | undefined) {
  const { activeYear } = useAcademicYear();

  return useQuery({
    queryKey: ['student-fee-records', studentId, activeYear?.id],
    queryFn: async () => {
      if (!studentId || !activeYear?.id) return [];

      const { data, error } = await supabase
        .from('student_fee_records')
        .select(`
          *,
          exam:exams(id, name, name_bn)
        `)
        .eq('student_id', studentId)
        .eq('academic_year_id', activeYear.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(record => ({
        ...record,
        exam: Array.isArray(record.exam) ? record.exam[0] : record.exam,
      })) as StudentFeeRecord[];
    },
    enabled: !!studentId && !!activeYear?.id,
  });
}

// Generate receipt number
function generateReceiptNumber(): string {
  const date = new Date();
  const prefix = 'RCP';
  const timestamp = date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Collect fee mutation
export function useCollectFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      amountPaid,
      lateFine = 0,
    }: {
      recordId: string;
      amountPaid: number;
      lateFine?: number;
    }) => {
      // Get current record
      const { data: record, error: fetchError } = await supabase
        .from('student_fee_records')
        .select('*')
        .eq('id', recordId)
        .single();

      if (fetchError) throw fetchError;

      const totalPaid = Number(record.amount_paid) + amountPaid;
      const totalDue = Number(record.amount_due) + lateFine;
      const newStatus = totalPaid >= totalDue ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
      const receiptNumber = generateReceiptNumber();

      const { data: updatedRecord, error } = await supabase
        .from('student_fee_records')
        .update({
          amount_paid: totalPaid,
          late_fine: lateFine,
          status: newStatus,
          payment_date: new Date().toISOString(),
          receipt_number: receiptNumber,
        })
        .eq('id', recordId)
        .select()
        .single();

      if (error) throw error;

      return updatedRecord as StudentFeeRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fee-records'] });
      toast.success('ফি আদায় সম্পন্ন হয়েছে');
    },
    onError: (error) => {
      toast.error('ফি আদায়ে সমস্যা হয়েছে');
      console.error(error);
    },
  });
}

// Create fee record for a student
export function useCreateFeeRecord() {
  const queryClient = useQueryClient();
  const { activeYear } = useAcademicYear();

  return useMutation({
    mutationFn: async ({
      studentId,
      feeType,
      amountDue,
      feeMonth,
      examId,
    }: {
      studentId: string;
      feeType: 'monthly' | 'admission' | 'session' | 'exam';
      amountDue: number;
      feeMonth?: string;
      examId?: string;
    }) => {
      if (!activeYear?.id) throw new Error('No active academic year');

      const { error } = await supabase
        .from('student_fee_records')
        .insert({
          student_id: studentId,
          academic_year_id: activeYear.id,
          fee_type: feeType,
          amount_due: amountDue,
          fee_month: feeMonth || null,
          exam_id: examId || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fee-records'] });
      toast.success('ফি রেকর্ড তৈরি হয়েছে');
    },
    onError: (error) => {
      toast.error('ফি রেকর্ড তৈরিতে সমস্যা হয়েছে');
      console.error(error);
    },
  });
}
