// New CMS hooks for Programs, Facilities, Home Sections, About Content, Admissions
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// ============ TYPES ============
export interface WebsiteProgram {
  id: string;
  level: string;
  level_bn: string | null;
  grades: string | null;
  grades_bn: string | null;
  description: string | null;
  description_bn: string | null;
  color_from: string | null;
  color_to: string | null;
  icon: string | null;
  display_order: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebsiteFacility {
  id: string;
  title: string;
  title_bn: string | null;
  description: string | null;
  description_bn: string | null;
  icon: string | null;
  display_order: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebsiteMethodology {
  id: string;
  title: string;
  title_bn: string | null;
  description: string | null;
  description_bn: string | null;
  icon: string | null;
  display_order: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebsiteHomeSection {
  id: string;
  section_key: string;
  section_name: string;
  section_name_bn: string | null;
  display_order: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebsiteAboutContent {
  id: string;
  section_key: string;
  title: string | null;
  title_bn: string | null;
  content: string | null;
  content_bn: string | null;
  image_url: string | null;
  display_order: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebsiteAdmissionInfo {
  id: string;
  section_key: string;
  title: string;
  title_bn: string | null;
  content: string | null;
  content_bn: string | null;
  icon: string | null;
  display_order: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ============ PROGRAMS ============
export function useWebsitePrograms(enabledOnly = false) {
  return useQuery({
    queryKey: ['website-programs', enabledOnly],
    queryFn: async () => {
      let query = supabase
        .from('website_programs')
        .select('*')
        .order('display_order');
      
      if (enabledOnly) {
        query = query.eq('is_enabled', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WebsiteProgram[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWebsiteProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (program: Omit<WebsiteProgram, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('website_programs')
        .insert(program)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-programs'] });
      toast({ title: 'প্রোগ্রাম যোগ হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateWebsiteProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsiteProgram> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_programs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-programs'] });
      toast({ title: 'প্রোগ্রাম আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteWebsiteProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('website_programs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-programs'] });
      toast({ title: 'প্রোগ্রাম মুছে ফেলা হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ FACILITIES ============
export function useWebsiteFacilities(enabledOnly = false) {
  return useQuery({
    queryKey: ['website-facilities', enabledOnly],
    queryFn: async () => {
      let query = supabase
        .from('website_facilities')
        .select('*')
        .order('display_order');
      
      if (enabledOnly) {
        query = query.eq('is_enabled', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WebsiteFacility[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWebsiteFacility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (facility: Omit<WebsiteFacility, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('website_facilities')
        .insert(facility)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-facilities'] });
      toast({ title: 'সুবিধা যোগ হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateWebsiteFacility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsiteFacility> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_facilities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-facilities'] });
      toast({ title: 'সুবিধা আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteWebsiteFacility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('website_facilities')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-facilities'] });
      toast({ title: 'সুবিধা মুছে ফেলা হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ METHODOLOGIES ============
export function useWebsiteMethodologies(enabledOnly = false) {
  return useQuery({
    queryKey: ['website-methodologies', enabledOnly],
    queryFn: async () => {
      let query = supabase
        .from('website_methodologies')
        .select('*')
        .order('display_order');
      
      if (enabledOnly) {
        query = query.eq('is_enabled', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WebsiteMethodology[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWebsiteMethodology() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (methodology: Omit<WebsiteMethodology, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('website_methodologies')
        .insert(methodology)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-methodologies'] });
      toast({ title: 'পদ্ধতি যোগ হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateWebsiteMethodology() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsiteMethodology> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_methodologies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-methodologies'] });
      toast({ title: 'পদ্ধতি আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteWebsiteMethodology() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('website_methodologies')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-methodologies'] });
      toast({ title: 'পদ্ধতি মুছে ফেলা হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ HOME SECTIONS ============
export function useWebsiteHomeSections() {
  return useQuery({
    queryKey: ['website-home-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_home_sections')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as WebsiteHomeSection[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateWebsiteHomeSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsiteHomeSection> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_home_sections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-home-sections'] });
      toast({ title: 'হোম সেকশন আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ ABOUT CONTENT ============
export function useWebsiteAboutContent() {
  return useQuery({
    queryKey: ['website-about-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_about_content')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as WebsiteAboutContent[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateWebsiteAboutContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsiteAboutContent> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_about_content')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-about-content'] });
      toast({ title: 'বিষয়বস্তু আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ ADMISSION INFO ============
export function useWebsiteAdmissionInfo() {
  return useQuery({
    queryKey: ['website-admission-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_admission_info')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as WebsiteAdmissionInfo[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWebsiteAdmissionInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (info: Omit<WebsiteAdmissionInfo, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('website_admission_info')
        .insert(info)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-admission-info'] });
      toast({ title: 'তথ্য যোগ হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateWebsiteAdmissionInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsiteAdmissionInfo> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_admission_info')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-admission-info'] });
      toast({ title: 'তথ্য আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteWebsiteAdmissionInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('website_admission_info')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-admission-info'] });
      toast({ title: 'তথ্য মুছে ফেলা হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}
