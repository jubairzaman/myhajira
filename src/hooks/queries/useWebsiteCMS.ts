import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types
export interface WebsiteSettings {
  id: string;
  school_name: string | null;
  school_name_bn: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  hero_title: string | null;
  hero_title_bn: string | null;
  hero_subtitle: string | null;
  hero_subtitle_bn: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  contact_address_bn: string | null;
  google_map_embed: string | null;
  office_hours: string | null;
  office_hours_bn: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  is_website_enabled: boolean;
  seo_title: string | null;
  seo_description: string | null;
}

export interface WebsitePage {
  id: string;
  slug: string;
  title: string;
  title_bn: string | null;
  is_enabled: boolean;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
}

export interface WebsiteSection {
  id: string;
  page_slug: string;
  section_type: string;
  title: string | null;
  title_bn: string | null;
  content: string | null;
  content_bn: string | null;
  image_url: string | null;
  video_url: string | null;
  display_order: number;
  is_enabled: boolean;
  metadata: unknown;
}

export interface WebsiteNotice {
  id: string;
  title: string;
  title_bn: string | null;
  content: string;
  content_bn: string | null;
  category: string;
  attachment_url: string | null;
  is_published: boolean;
  publish_date: string | null;
  is_pinned: boolean;
  created_by: string | null;
  created_at: string;
}

export interface WebsiteResult {
  id: string;
  academic_year_id: string;
  class_id: string;
  exam_id: string;
  pdf_url: string;
  title: string | null;
  is_published: boolean;
  published_at: string | null;
  uploaded_by: string | null;
  created_at: string;
  academic_year?: { name: string };
  class?: { name: string; name_bn: string | null };
  exam?: { name: string; name_bn: string | null };
}

export interface WebsiteAlumni {
  id: string;
  name: string;
  name_bn: string | null;
  passing_year: number;
  photo_url: string | null;
  current_position: string | null;
  current_position_bn: string | null;
  comment: string | null;
  comment_bn: string | null;
  is_featured: boolean;
  is_approved: boolean;
  show_in_bubble: boolean;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
}

export interface WebsiteAlumniPodcast {
  id: string;
  title: string;
  title_bn: string | null;
  description: string | null;
  description_bn: string | null;
  youtube_url: string;
  thumbnail_url: string | null;
  alumni_id: string | null;
  is_featured: boolean;
  is_enabled: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  alumni?: WebsiteAlumni;
}

export interface WebsiteContact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  replied_at: string | null;
  created_at: string;
}

export interface WebsiteTestimonial {
  id: string;
  name: string;
  name_bn: string | null;
  role: string | null;
  photo_url: string | null;
  content: string;
  content_bn: string | null;
  rating: number | null;
  is_enabled: boolean;
  display_order: number;
}

export interface WebsiteAcademic {
  id: string;
  title: string;
  title_bn: string | null;
  description: string | null;
  description_bn: string | null;
  syllabus_pdf_url: string | null;
  class_id: string | null;
  category: string | null;
  display_order: number;
  is_enabled: boolean;
}

// ============ SETTINGS ============
export function useWebsiteSettings() {
  return useQuery({
    queryKey: ['website-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .single();
      if (error) throw error;
      return data as WebsiteSettings;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateWebsiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<WebsiteSettings> & { id: string }) => {
      const { id, ...updateData } = settings;
      const { data, error } = await supabase
        .from('website_settings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-settings'] });
      toast({ title: 'সেটিংস সংরক্ষিত হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ PAGES ============
export function useWebsitePages() {
  return useQuery({
    queryKey: ['website-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_pages')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as WebsitePage[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateWebsitePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsitePage> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-pages'] });
      toast({ title: 'পেজ আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ SECTIONS ============
export function useWebsiteSections(pageSlug?: string) {
  return useQuery({
    queryKey: ['website-sections', pageSlug],
    queryFn: async () => {
      let query = supabase
        .from('website_sections')
        .select('*')
        .order('display_order');
      
      if (pageSlug) {
        query = query.eq('page_slug', pageSlug);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WebsiteSection[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateWebsiteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Omit<WebsiteSection, 'metadata'>> & { id: string; metadata?: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from('website_sections')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-sections'] });
      toast({ title: 'সেকশন আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ NOTICES ============
export function useWebsiteNotices(publishedOnly = false) {
  return useQuery({
    queryKey: ['website-notices', publishedOnly],
    queryFn: async () => {
      let query = supabase
        .from('website_notices')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('publish_date', { ascending: false });
      
      if (publishedOnly) {
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WebsiteNotice[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useWebsiteNotice(id: string) {
  return useQuery({
    queryKey: ['website-notice', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_notices')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as WebsiteNotice;
    },
    enabled: !!id,
  });
}

export function useCreateWebsiteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notice: Omit<WebsiteNotice, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('website_notices')
        .insert(notice)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-notices'] });
      toast({ title: 'নোটিশ তৈরি হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateWebsiteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsiteNotice> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_notices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-notices'] });
      toast({ title: 'নোটিশ আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteWebsiteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('website_notices')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-notices'] });
      toast({ title: 'নোটিশ মুছে ফেলা হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ RESULTS ============
export function useWebsiteResults(publishedOnly = false) {
  return useQuery({
    queryKey: ['website-results', publishedOnly],
    queryFn: async () => {
      let query = supabase
        .from('website_results')
        .select(`
          *,
          academic_year:academic_years(name),
          class:classes(name, name_bn),
          exam:exams(name, name_bn)
        `)
        .order('created_at', { ascending: false });
      
      if (publishedOnly) {
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WebsiteResult[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateWebsiteResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (result: { academic_year_id: string; class_id: string; exam_id: string; pdf_url: string; title?: string }) => {
      const { data, error } = await supabase
        .from('website_results')
        .insert(result)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-results'] });
      toast({ title: 'রেজাল্ট আপলোড হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateWebsiteResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsiteResult> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_results')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-results'] });
      toast({ title: 'রেজাল্ট আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteWebsiteResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('website_results')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-results'] });
      toast({ title: 'রেজাল্ট মুছে ফেলা হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ ALUMNI ============
export function useWebsiteAlumni(approvedOnly = false) {
  return useQuery({
    queryKey: ['website-alumni', approvedOnly],
    queryFn: async () => {
      let query = supabase
        .from('website_alumni')
        .select('*')
        .order('passing_year', { ascending: false });
      
      if (approvedOnly) {
        query = query.eq('is_approved', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WebsiteAlumni[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useSubmitAlumniApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alumni: { name: string; name_bn?: string; passing_year: number; photo_url?: string; current_position?: string; comment?: string }) => {
      const { data, error } = await supabase
        .from('website_alumni')
        .insert({
          ...alumni,
          is_approved: false,
          is_featured: false,
          show_in_bubble: false,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-alumni'] });
      toast({ title: 'আবেদন সফলভাবে জমা হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useApproveWebsiteAlumni() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('website_alumni')
        .update({ is_approved: true, approved_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-alumni'] });
      toast({ title: 'প্রাক্তন ছাত্র অনুমোদিত হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateWebsiteAlumni() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsiteAlumni> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_alumni')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-alumni'] });
      toast({ title: 'প্রাক্তন ছাত্র আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteWebsiteAlumni() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('website_alumni')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-alumni'] });
      toast({ title: 'প্রাক্তন ছাত্র মুছে ফেলা হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ CONTACTS ============
export function useWebsiteContacts() {
  return useQuery({
    queryKey: ['website-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_contacts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as WebsiteContact[];
    },
    staleTime: 1 * 60 * 1000,
  });
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: async (contact: { name: string; email?: string; phone?: string; subject?: string; message: string }) => {
      const { data, error } = await supabase
        .from('website_contacts')
        .insert(contact)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'বার্তা সফলভাবে পাঠানো হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useMarkWebsiteContactRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('website_contacts')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-contacts'] });
    },
  });
}

export function useUpdateWebsiteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsiteContact> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-contacts'] });
    },
  });
}

export function useDeleteWebsiteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('website_contacts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-contacts'] });
      toast({ title: 'বার্তা মুছে ফেলা হয়েছে' });
    },
  });
}

// ============ TESTIMONIALS ============
export function useWebsiteTestimonials(enabledOnly = false) {
  return useQuery({
    queryKey: ['website-testimonials', enabledOnly],
    queryFn: async () => {
      let query = supabase
        .from('website_testimonials')
        .select('*')
        .order('display_order');
      
      if (enabledOnly) {
        query = query.eq('is_enabled', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WebsiteTestimonial[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWebsiteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (testimonial: Omit<WebsiteTestimonial, 'id'>) => {
      const { data, error } = await supabase
        .from('website_testimonials')
        .insert(testimonial)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-testimonials'] });
      toast({ title: 'প্রশংসাপত্র যোগ হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateWebsiteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsiteTestimonial> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_testimonials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-testimonials'] });
      toast({ title: 'প্রশংসাপত্র আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteWebsiteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('website_testimonials')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-testimonials'] });
      toast({ title: 'প্রশংসাপত্র মুছে ফেলা হয়েছে' });
    },
  });
}

// ============ ACADEMICS ============
export function useWebsiteAcademics(enabledOnly = false) {
  return useQuery({
    queryKey: ['website-academics', enabledOnly],
    queryFn: async () => {
      let query = supabase
        .from('website_academics')
        .select('*')
        .order('display_order');
      
      if (enabledOnly) {
        query = query.eq('is_enabled', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WebsiteAcademic[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWebsiteAcademic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (academic: Omit<WebsiteAcademic, 'id'>) => {
      const { data, error } = await supabase
        .from('website_academics')
        .insert(academic)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-academics'] });
      toast({ title: 'একাডেমিক আইটেম যোগ হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateWebsiteAcademic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsiteAcademic> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_academics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-academics'] });
      toast({ title: 'একাডেমিক আইটেম আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ ALUMNI PODCASTS ============
export function useWebsiteAlumniPodcasts(enabledOnly = false) {
  return useQuery({
    queryKey: ['website-alumni-podcasts', enabledOnly],
    queryFn: async () => {
      let query = supabase
        .from('website_alumni_podcasts')
        .select(`
          *,
          alumni:website_alumni(id, name, name_bn, photo_url)
        `)
        .order('display_order');
      
      if (enabledOnly) {
        query = query.eq('is_enabled', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as (WebsiteAlumniPodcast & { alumni: WebsiteAlumni | null })[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWebsiteAlumniPodcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (podcast: { 
      title: string; 
      title_bn?: string; 
      description?: string;
      description_bn?: string;
      youtube_url: string; 
      thumbnail_url?: string;
      alumni_id?: string;
      is_featured?: boolean;
      display_order?: number;
    }) => {
      const { data, error } = await supabase
        .from('website_alumni_podcasts')
        .insert(podcast)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-alumni-podcasts'] });
      toast({ title: 'পডকাস্ট যোগ হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateWebsiteAlumniPodcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WebsiteAlumniPodcast> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_alumni_podcasts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-alumni-podcasts'] });
      toast({ title: 'পডকাস্ট আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteWebsiteAlumniPodcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('website_alumni_podcasts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-alumni-podcasts'] });
      toast({ title: 'পডকাস্ট মুছে ফেলা হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteWebsiteAcademic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('website_academics')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-academics'] });
      toast({ title: 'একাডেমিক আইটেম মুছে ফেলা হয়েছে' });
    },
  });
}

// ============ ALUMNI FORM FIELDS ============
export interface AlumniFormField {
  id: string;
  field_name: string;
  field_label: string;
  field_label_bn: string | null;
  field_type: 'text' | 'textarea' | 'number' | 'select' | 'email' | 'phone';
  is_required: boolean;
  display_order: number;
  is_enabled: boolean;
  options: { value: string; label: string }[] | null;
  placeholder: string | null;
  placeholder_bn: string | null;
}

export function useAlumniFormFields() {
  return useQuery({
    queryKey: ['alumni-form-fields'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_alumni_form_fields')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        field_type: item.field_type as AlumniFormField['field_type'],
        options: item.options as AlumniFormField['options'],
      })) as AlumniFormField[];
    },
  });
}

export function useCreateAlumniFormField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (field: Omit<AlumniFormField, 'id'>) => {
      const { data, error } = await supabase
        .from('website_alumni_form_fields')
        .insert(field)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni-form-fields'] });
      toast({ title: 'ফিল্ড যোগ করা হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateAlumniFormField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AlumniFormField> & { id: string }) => {
      const { data, error } = await supabase
        .from('website_alumni_form_fields')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni-form-fields'] });
      toast({ title: 'ফিল্ড আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteAlumniFormField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('website_alumni_form_fields')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni-form-fields'] });
      toast({ title: 'ফিল্ড মুছে ফেলা হয়েছে' });
    },
  });
}
