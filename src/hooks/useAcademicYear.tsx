import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  refetch: () => Promise<void>;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

export function AcademicYearProvider({ children }: { children: ReactNode }) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [activeYear, setActiveYear] = useState<AcademicYear | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAcademicYears = async () => {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;

      setAcademicYears(data || []);
      const active = data?.find((y) => y.is_active) || null;
      setActiveYear(active);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  return (
    <AcademicYearContext.Provider
      value={{
        academicYears,
        activeYear,
        loading,
        refetch: fetchAcademicYears,
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
