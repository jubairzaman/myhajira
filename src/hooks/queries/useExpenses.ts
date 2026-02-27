import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  payment_method: string;
  category: string | null;
  notes: string | null;
  expense_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useTodayExpenses() {
  const today = new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: ['expenses', 'today', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('expense_date', today)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Expense[];
    },
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (expense: { title: string; amount: number; payment_method: string; category?: string; notes?: string }) => {
      const { error } = await supabase
        .from('expenses')
        .insert({
          ...expense,
          created_by: user!.id,
          expense_date: new Date().toISOString().split('T')[0],
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['daily-finance-summary'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; amount?: number; payment_method?: string; category?: string; notes?: string }) => {
      const { error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['daily-finance-summary'] });
    },
  });
}

export function useDailyFinanceSummary(date?: string) {
  const today = date || new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: ['daily-finance-summary', today],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_daily_finance_summary', { p_date: today });
      if (error) throw error;
      return data as {
        total_collection: number;
        total_expenses: number;
        net_balance: number;
        transaction_count: number;
        expense_count: number;
      };
    },
  });
}
