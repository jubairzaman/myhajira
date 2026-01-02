import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Student {
  id: string;
  name: string;
  name_bn: string | null;
  student_id_number: string | null;
  guardian_mobile: string;
  blood_group: string | null;
  photo_url: string | null;
  is_active: boolean;
  shift: { id: string; name: string } | null;
  class: { id: string; name: string } | null;
  section: { id: string; name: string } | null;
  rfid_card: { card_number: string } | null;
}

const PAGE_SIZE = 50;

export function useStudentsQuery(academicYearId: string | undefined) {
  return useQuery({
    queryKey: ['students', academicYearId],
    queryFn: async () => {
      if (!academicYearId) return [];

      const { data, error } = await supabase
        .from('students')
        .select(`
          id, name, name_bn, student_id_number, guardian_mobile, blood_group, photo_url, is_active,
          shift:shifts(id, name),
          class:classes(id, name),
          section:sections(id, name),
          rfid_card:rfid_cards_students(card_number)
        `)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Transform data to handle array returns from joins
      return (data || []).map(student => ({
        ...student,
        shift: Array.isArray(student.shift) ? student.shift[0] : student.shift,
        class: Array.isArray(student.class) ? student.class[0] : student.class,
        section: Array.isArray(student.section) ? student.section[0] : student.section,
        rfid_card: Array.isArray(student.rfid_card) ? student.rfid_card[0] : student.rfid_card,
      })) as Student[];
    },
    enabled: !!academicYearId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    placeholderData: (previousData) => previousData, // Show old data while refetching
  });
}

// Lightweight count query for dashboard
export function useStudentCountQuery(academicYearId: string | undefined) {
  return useQuery({
    queryKey: ['students-count', academicYearId],
    queryFn: async () => {
      if (!academicYearId) return 0;

      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!academicYearId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useStudentsInfiniteQuery(academicYearId: string | undefined, classFilter?: string) {
  return useInfiniteQuery({
    queryKey: ['students-infinite', academicYearId, classFilter],
    queryFn: async ({ pageParam = 0 }) => {
      if (!academicYearId) return [];

      let query = supabase
        .from('students')
        .select(`
          id, name, name_bn, student_id_number, guardian_mobile, blood_group, photo_url, is_active,
          shift:shifts(id, name),
          class:classes(id, name),
          section:sections(id, name),
          rfid_card:rfid_cards_students(card_number)
        `)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .order('name')
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (classFilter && classFilter !== 'all') {
        query = query.eq('class_id', classFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data
      return (data || []).map(student => ({
        ...student,
        shift: Array.isArray(student.shift) ? student.shift[0] : student.shift,
        class: Array.isArray(student.class) ? student.class[0] : student.class,
        section: Array.isArray(student.section) ? student.section[0] : student.section,
        rfid_card: Array.isArray(student.rfid_card) ? student.rfid_card[0] : student.rfid_card,
      })) as Student[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined;
    },
    enabled: !!academicYearId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClassesQuery() {
  return useQuery({
    queryKey: ['classes-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('is_active', true)
        .order('grade_order');

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache - classes don't change often
  });
}
