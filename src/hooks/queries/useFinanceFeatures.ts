import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlag {
  id: string;
  feature_key: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceMode {
  id: string;
  mode: 'SIMPLE_MODE' | 'STANDARD_MODE' | 'PRO_MODE';
  updated_at: string;
  updated_by: string | null;
}

const MODE_FEATURES: Record<string, string[]> = {
  SIMPLE_MODE: ['fine_system', 'sms_module', 'inventory_sales'],
  STANDARD_MODE: ['fine_system', 'sms_module', 'inventory_sales', 'bank_payment', 'mobile_payment', 'revenue_dashboard'],
  PRO_MODE: ['fine_system', 'sms_module', 'inventory_sales', 'bank_payment', 'mobile_payment', 'revenue_dashboard', 'online_payment', 'ledger_system', 'audit_log'],
};

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['finance-feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finance_feature_flags')
        .select('*')
        .order('feature_key');
      if (error) throw error;
      return data as FeatureFlag[];
    },
  });
}

export function useFinanceMode() {
  return useQuery({
    queryKey: ['finance-mode'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finance_mode')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data as FinanceMode;
    },
  });
}

export function useToggleFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('finance_feature_flags')
        .update({ enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-feature-flags'] });
    },
  });
}

export function useSetFinanceMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, mode }: { id: string; mode: string }) => {
      // Update mode
      const { error: modeError } = await supabase
        .from('finance_mode')
        .update({ mode })
        .eq('id', id);
      if (modeError) throw modeError;

      // Auto-toggle features based on mode
      const enabledFeatures = MODE_FEATURES[mode] || [];
      const { data: allFlags } = await supabase
        .from('finance_feature_flags')
        .select('id, feature_key');

      if (allFlags) {
        for (const flag of allFlags) {
          const shouldEnable = enabledFeatures.includes(flag.feature_key);
          await supabase
            .from('finance_feature_flags')
            .update({ enabled: shouldEnable })
            .eq('id', flag.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-feature-flags'] });
      queryClient.invalidateQueries({ queryKey: ['finance-mode'] });
    },
  });
}

export function useIsFeatureEnabled(featureKey: string): boolean {
  const { data: flags } = useFeatureFlags();
  if (!flags) return false;
  const flag = flags.find(f => f.feature_key === featureKey);
  return flag?.enabled ?? false;
}
