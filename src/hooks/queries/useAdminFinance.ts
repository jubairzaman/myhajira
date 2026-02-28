import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';

export function useRecentTransactions(limit = 20) {
  return useQuery({
    queryKey: ['admin-recent-transactions', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_fee_records')
        .select(`
          id, fee_type, fee_month, amount_paid, payment_date, receipt_number, status,
          student:students(id, name, name_bn, class:classes(name), section:sections(name))
        `)
        .in('status', ['paid', 'partial'])
        .not('payment_date', 'is', null)
        .order('payment_date', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}

export function useAllExpenses(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['admin-all-expenses', dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (dateFrom) query = query.gte('expense_date', dateFrom);
      if (dateTo) query = query.lte('expense_date', dateTo);

      const { data, error } = await query.limit(500);
      if (error) throw error;
      return data;
    },
  });
}

export function useMonthlyRevenue(academicYearId?: string) {
  return useQuery({
    queryKey: ['admin-monthly-revenue', academicYearId],
    enabled: !!academicYearId,
    queryFn: async () => {
      // Get all paid fee records for the academic year
      const { data: feeRecords, error: feeError } = await supabase
        .from('student_fee_records')
        .select('fee_type, amount_paid, payment_date')
        .eq('academic_year_id', academicYearId!)
        .in('status', ['paid', 'partial'])
        .not('payment_date', 'is', null);
      if (feeError) throw feeError;

      // Get all expenses
      const { data: expenses, error: expError } = await supabase
        .from('expenses')
        .select('amount, category, expense_date');
      if (expError) throw expError;

      // Group by month
      const monthlyData: Record<string, { income: number; expense: number; sources: Record<string, number>; categories: Record<string, number> }> = {};

      feeRecords?.forEach(r => {
        if (!r.payment_date) return;
        const month = r.payment_date.substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0, sources: {}, categories: {} };
        monthlyData[month].income += Number(r.amount_paid);
        const src = r.fee_type || 'other';
        monthlyData[month].sources[src] = (monthlyData[month].sources[src] || 0) + Number(r.amount_paid);
      });

      expenses?.forEach(e => {
        const month = e.expense_date.substring(0, 7);
        if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0, sources: {}, categories: {} };
        monthlyData[month].expense += Number(e.amount);
        const cat = e.category || 'other';
        monthlyData[month].categories[cat] = (monthlyData[month].categories[cat] || 0) + Number(e.amount);
      });

      return Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({ month, ...data, net: data.income - data.expense }));
    },
  });
}

export function useFeeSourceAnalysis(academicYearId?: string) {
  return useQuery({
    queryKey: ['admin-fee-source-analysis', academicYearId],
    enabled: !!academicYearId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_fee_records')
        .select('fee_type, amount_paid')
        .eq('academic_year_id', academicYearId!)
        .in('status', ['paid', 'partial']);
      if (error) throw error;

      const sources: Record<string, number> = {};
      let total = 0;
      data?.forEach(r => {
        const src = r.fee_type || 'other';
        sources[src] = (sources[src] || 0) + Number(r.amount_paid);
        total += Number(r.amount_paid);
      });

      // Add inventory sales
      const { data: invData } = await supabase
        .from('inventory_transactions')
        .select('total_amount')
        .eq('transaction_type', 'sale');
      const invTotal = invData?.reduce((s, t) => s + Number(t.total_amount), 0) || 0;
      if (invTotal > 0) {
        sources['product_sales'] = invTotal;
        total += invTotal;
      }

      return Object.entries(sources).map(([source, amount]) => ({
        source,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100 * 10) / 10 : 0,
      })).sort((a, b) => b.amount - a.amount);
    },
  });
}

export function useCollectionPerformance(academicYearId?: string) {
  return useQuery({
    queryKey: ['admin-collection-performance', academicYearId],
    enabled: !!academicYearId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_fee_records')
        .select('collected_by, amount_paid')
        .eq('academic_year_id', academicYearId!)
        .in('status', ['paid', 'partial'])
        .not('collected_by', 'is', null);
      if (error) throw error;

      const operators: Record<string, { total: number; count: number }> = {};
      data?.forEach(r => {
        const op = r.collected_by!;
        if (!operators[op]) operators[op] = { total: 0, count: 0 };
        operators[op].total += Number(r.amount_paid);
        operators[op].count += 1;
      });

      // Get profile names
      const operatorIds = Object.keys(operators);
      let profiles: Record<string, string> = {};
      if (operatorIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', operatorIds);
        profileData?.forEach(p => { profiles[p.user_id] = p.full_name; });
      }

      return operatorIds.map(id => ({
        operator_id: id,
        operator_name: profiles[id] || 'Unknown',
        total_amount: operators[id].total,
        transaction_count: operators[id].count,
        average: Math.round(operators[id].total / operators[id].count),
      })).sort((a, b) => b.total_amount - a.total_amount);
    },
  });
}

export function useOutstandingFees(academicYearId?: string) {
  return useQuery({
    queryKey: ['admin-outstanding-fees', academicYearId],
    enabled: !!academicYearId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_fee_records')
        .select(`
          id, fee_type, fee_month, amount_due, amount_paid, late_fine, status,
          student:students(id, name, name_bn, class:classes(id, name))
        `)
        .eq('academic_year_id', academicYearId!)
        .in('status', ['unpaid', 'partial']);
      if (error) throw error;

      // Total outstanding
      const totalDue = data?.reduce((s, r) => s + Number(r.amount_due) + Number(r.late_fine) - Number(r.amount_paid), 0) || 0;

      // Group by class
      const classDues: Record<string, { name: string; total: number; count: number }> = {};
      const studentDues: Record<string, { name: string; className: string; unpaidMonths: number; totalDue: number }> = {};

      data?.forEach(r => {
        const cls = (r.student as any)?.class;
        if (cls) {
          if (!classDues[cls.id]) classDues[cls.id] = { name: cls.name, total: 0, count: 0 };
          classDues[cls.id].total += Number(r.amount_due) + Number(r.late_fine) - Number(r.amount_paid);
          classDues[cls.id].count += 1;
        }

        const student = r.student as any;
        if (student) {
          if (!studentDues[student.id]) {
            studentDues[student.id] = { name: student.name, className: cls?.name || '', unpaidMonths: 0, totalDue: 0 };
          }
          studentDues[student.id].unpaidMonths += 1;
          studentDues[student.id].totalDue += Number(r.amount_due) + Number(r.late_fine) - Number(r.amount_paid);
        }
      });

      // Top defaulters (3+ unpaid months)
      const topDefaulters = Object.values(studentDues)
        .filter(s => s.unpaidMonths >= 3)
        .sort((a, b) => b.totalDue - a.totalDue)
        .slice(0, 20);

      return {
        totalDue,
        totalRecords: data?.length || 0,
        classDues: Object.values(classDues).sort((a, b) => b.total - a.total),
        topDefaulters,
      };
    },
  });
}

export function useExpensePattern(days = 30) {
  return useQuery({
    queryKey: ['admin-expense-pattern', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('expenses')
        .select('amount, category, expense_date')
        .gte('expense_date', startDate.toISOString().split('T')[0])
        .order('expense_date', { ascending: true });
      if (error) throw error;

      // Daily trend
      const dailyTrend: Record<string, number> = {};
      const categoryTotals: Record<string, number> = {};

      data?.forEach(e => {
        dailyTrend[e.expense_date] = (dailyTrend[e.expense_date] || 0) + Number(e.amount);
        const cat = e.category || 'other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount);
      });

      // Average daily expense
      const totalExpense = Object.values(dailyTrend).reduce((s, v) => s + v, 0);
      const avgDaily = Object.keys(dailyTrend).length > 0 ? totalExpense / Object.keys(dailyTrend).length : 0;

      // Spike detection (> 2x average)
      const spikes = Object.entries(dailyTrend)
        .filter(([, amount]) => amount > avgDaily * 2)
        .map(([date, amount]) => ({ date, amount, ratio: Math.round((amount / avgDaily) * 10) / 10 }));

      return {
        dailyTrend: Object.entries(dailyTrend).map(([date, amount]) => ({ date, amount })),
        categoryTotals: Object.entries(categoryTotals)
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount),
        avgDaily: Math.round(avgDaily),
        spikes,
      };
    },
  });
}
