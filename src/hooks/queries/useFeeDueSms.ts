import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeeDueSmsParams {
  studentId: string;
  studentName: string;
  className: string;
  dueAmount: number;
  guardianMobile: string;
}

interface BulkFeeDueSmsParams {
  students: FeeDueSmsParams[];
}

// Send fee due SMS to a single student's guardian
export function useSendFeeDueSms() {
  return useMutation({
    mutationFn: async (params: FeeDueSmsParams) => {
      const message = `প্রিয় অভিভাবক, আপনার সন্তান ${params.studentName} (${params.className}) এর ৳${params.dueAmount.toLocaleString()} টাকা ফি বকেয়া আছে। দ্রুত পরিশোধ করুন।`;

      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          mobile_number: params.guardianMobile,
          message,
          student_id: params.studentId,
          sms_type: 'fee_due',
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('বকেয়া SMS পাঠানো হয়েছে');
    },
    onError: (error: any) => {
      toast.error(error.message || 'SMS পাঠাতে সমস্যা হয়েছে');
      console.error(error);
    },
  });
}

// Send fee due SMS to multiple students' guardians
export function useSendBulkFeeDueSms() {
  return useMutation({
    mutationFn: async ({ students }: BulkFeeDueSmsParams) => {
      let sentCount = 0;
      let failedCount = 0;

      for (const student of students) {
        try {
          const message = `প্রিয় অভিভাবক, আপনার সন্তান ${student.studentName} (${student.className}) এর ৳${student.dueAmount.toLocaleString()} টাকা ফি বকেয়া আছে। দ্রুত পরিশোধ করুন।`;

          const { error } = await supabase.functions.invoke('send-sms', {
            body: {
              mobile_number: student.guardianMobile,
              message,
              student_id: student.studentId,
              sms_type: 'fee_due',
            },
          });

          if (error) {
            failedCount++;
          } else {
            sentCount++;
          }
        } catch {
          failedCount++;
        }
      }

      return { sentCount, failedCount, total: students.length };
    },
    onSuccess: (data) => {
      toast.success(`${data.sentCount}/${data.total} জনের কাছে বকেয়া SMS পাঠানো হয়েছে`);
      if (data.failedCount > 0) {
        toast.warning(`${data.failedCount} জনের কাছে SMS পাঠাতে সমস্যা হয়েছে`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'SMS পাঠাতে সমস্যা হয়েছে');
      console.error(error);
    },
  });
}
