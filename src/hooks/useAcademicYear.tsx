import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_archived: boolean;
}

interface AcademicYearContextType {
  academicYears: AcademicYear[];
  activeYear: AcademicYear | null;
  loading: boolean;
  refetch: () => void;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

export function AcademicYearProvider({ children }: { children: ReactNode }) {
  const { data: academicYears = [], isLoading, refetch } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as AcademicYear[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes cache - academic years rarely change
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    placeholderData: (previousData) => previousData, // Keep showing old data while refetching
  });

  const activeYear = academicYears.find((y) => y.is_active) || null;

  return (
    <AcademicYearContext.Provider
      value={{
        academicYears,
        activeYear,
        loading: isLoading,
        refetch,
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const context = useContext(AcademicYearContext);
  if (context === undefined) {
    throw new Error('useAcademicYear must be used within an AcademicYearProvider');
  }
  return context;
}
