import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Class {
  id: string;
  name: string;
  name_bn: string | null;
  grade_order: number;
}

export function useClassesQuery() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, name_bn, grade_order')
        .eq('is_active', true)
        .order('grade_order');

      if (error) throw error;
      return data as Class[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - classes rarely change
    placeholderData: (previousData) => previousData,
  });
}
