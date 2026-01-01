import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Shift {
  id: string;
  name: string;
  name_bn: string | null;
  start_time: string;
  end_time: string;
  late_threshold_time: string | null;
  absent_cutoff_time: string | null;
}

export function useShiftsQuery(academicYearId: string | undefined) {
  return useQuery({
    queryKey: ['shifts', academicYearId],
    queryFn: async () => {
      if (!academicYearId) return [];

      const { data, error } = await supabase
        .from('shifts')
        .select('id, name, name_bn, start_time, end_time, late_threshold_time, absent_cutoff_time')
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .order('start_time');

      if (error) throw error;
      return data as Shift[];
    },
    enabled: !!academicYearId,
    staleTime: 10 * 60 * 1000, // 10 minutes - shifts rarely change
    placeholderData: (previousData) => previousData,
  });
}
