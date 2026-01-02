import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Class {
  id: string;
  name: string;
  name_bn: string | null;
  grade_order: number;
}

interface Shift {
  id: string;
  name: string;
  name_bn: string | null;
}

interface Section {
  id: string;
  name: string;
  name_bn: string | null;
  class_id: string;
}

interface AppData {
  classes: Class[];
  shifts: Shift[];
  sections: Section[];
}

/**
 * Shared app data hook - fetches classes, shifts, and sections in parallel
 * with long cache time to avoid repeated API calls across components
 */
export function useAppData(academicYearId?: string) {
  return useQuery({
    queryKey: ['app-data', academicYearId],
    queryFn: async (): Promise<AppData> => {
      // Fetch all in parallel
      const [classesResult, shiftsResult, sectionsResult] = await Promise.all([
        supabase
          .from('classes')
          .select('id, name, name_bn, grade_order')
          .eq('is_active', true)
          .order('grade_order'),
        supabase
          .from('shifts')
          .select('id, name, name_bn')
          .eq('is_active', true)
          .eq('academic_year_id', academicYearId || '')
          .order('name'),
        supabase
          .from('sections')
          .select('id, name, name_bn, class_id')
          .eq('is_active', true)
          .order('name'),
      ]);

      if (classesResult.error) throw classesResult.error;
      if (shiftsResult.error) throw shiftsResult.error;
      if (sectionsResult.error) throw sectionsResult.error;

      return {
        classes: classesResult.data || [],
        shifts: shiftsResult.data || [],
        sections: sectionsResult.data || [],
      };
    },
    enabled: !!academicYearId,
    staleTime: 30 * 60 * 1000, // 30 minutes - structural data rarely changes
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    placeholderData: (previousData) => previousData,
  });
}

// Individual selectors for when you only need one type
export function useClassesData(academicYearId?: string) {
  const { data } = useAppData(academicYearId);
  return data?.classes || [];
}

export function useShiftsData(academicYearId?: string) {
  const { data } = useAppData(academicYearId);
  return data?.shifts || [];
}

export function useSectionsData(academicYearId?: string) {
  const { data } = useAppData(academicYearId);
  return data?.sections || [];
}
