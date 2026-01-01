import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Teacher {
  id: string;
  name: string;
  name_bn: string | null;
  designation: string;
  mobile: string;
  blood_group: string | null;
  photo_url: string | null;
  is_active: boolean;
  shift: { id: string; name: string } | null;
  rfid_card: { card_number: string } | null;
}

export function useTeachersQuery(academicYearId: string | undefined) {
  return useQuery({
    queryKey: ['teachers', academicYearId],
    queryFn: async () => {
      if (!academicYearId) return [];

      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id, name, name_bn, designation, mobile, blood_group, photo_url, is_active,
          shift:shifts(id, name),
          rfid_card:rfid_cards_teachers(card_number)
        `)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Transform data to handle array returns from joins
      return (data || []).map(teacher => ({
        ...teacher,
        shift: Array.isArray(teacher.shift) ? teacher.shift[0] : teacher.shift,
        rfid_card: Array.isArray(teacher.rfid_card) ? teacher.rfid_card[0] : teacher.rfid_card,
      })) as Teacher[];
    },
    enabled: !!academicYearId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    placeholderData: (previousData) => previousData,
  });
}
