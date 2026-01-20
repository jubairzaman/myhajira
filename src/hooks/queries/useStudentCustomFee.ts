import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudentCustomFee {
  id: string;
  student_id: string;
  custom_monthly_fee: number | null;
  custom_admission_fee: number | null;
  effective_from: string;
  created_at: string;
  updated_at: string;
}

// Fetch student's custom fee
export function useStudentCustomFee(studentId: string | undefined) {
  return useQuery({
    queryKey: ['student-custom-fee', studentId],
    queryFn: async () => {
      if (!studentId) return null;

      const { data, error } = await supabase
        .from('student_custom_fees')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) throw error;
      return data as StudentCustomFee | null;
    },
    enabled: !!studentId,
  });
}

// Upsert student's custom fee
export function useUpsertStudentCustomFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      customMonthlyFee,
      customAdmissionFee,
      effectiveFrom,
    }: {
      studentId: string;
      customMonthlyFee: number | null;
      customAdmissionFee?: number | null;
      effectiveFrom?: string;
    }) => {
      // If both fees are null or 0, delete the record
      if ((!customMonthlyFee || customMonthlyFee <= 0) && (!customAdmissionFee || customAdmissionFee <= 0)) {
        const { error } = await supabase
          .from('student_custom_fees')
          .delete()
          .eq('student_id', studentId);
        
        if (error) throw error;
        return null;
      }

      // Check if record exists
      const { data: existing } = await supabase
        .from('student_custom_fees')
        .select('id')
        .eq('student_id', studentId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('student_custom_fees')
          .update({
            custom_monthly_fee: customMonthlyFee || null,
            custom_admission_fee: customAdmissionFee || null,
            effective_from: effectiveFrom || new Date().toISOString().split('T')[0],
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('student_custom_fees')
          .insert({
            student_id: studentId,
            custom_monthly_fee: customMonthlyFee || null,
            custom_admission_fee: customAdmissionFee || null,
            effective_from: effectiveFrom || new Date().toISOString().split('T')[0],
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-custom-fee', variables.studentId] });
      toast.success('কাস্টম মাসিক ফি সংরক্ষিত হয়েছে');
    },
    onError: (error) => {
      toast.error('সংরক্ষণে সমস্যা হয়েছে');
      console.error(error);
    },
  });
}

// Get effective monthly fee for a student (custom or class default)
export async function getEffectiveMonthlyFee(
  studentId: string,
  classId: string,
  academicYearId: string,
  feeMonth?: string
): Promise<number> {
  // First check for custom fee
  const { data: customFee } = await supabase
    .from('student_custom_fees')
    .select('custom_monthly_fee, effective_from')
    .eq('student_id', studentId)
    .maybeSingle();

  if (customFee?.custom_monthly_fee) {
    // If feeMonth is provided, check if custom fee is effective for that month
    if (feeMonth) {
      const effectiveDate = new Date(customFee.effective_from);
      const feeDate = new Date(feeMonth);
      if (feeDate >= effectiveDate) {
        return customFee.custom_monthly_fee;
      }
    } else {
      return customFee.custom_monthly_fee;
    }
  }

  // Fall back to class fee
  const { data: classFee } = await supabase
    .from('class_monthly_fees')
    .select('amount')
    .eq('class_id', classId)
    .eq('academic_year_id', academicYearId)
    .maybeSingle();

  return classFee?.amount || 0;
}
