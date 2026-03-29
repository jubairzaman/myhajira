import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';

// ============ GRADING SCALES ============
export function useGradingScales() {
  const { activeYear } = useAcademicYear();
  return useQuery({
    queryKey: ['grading-scales', activeYear?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grading_scales')
        .select('*, grade_points(*)')
        .eq('academic_year_id', activeYear!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!activeYear?.id,
  });
}

export function useCreateGradingScale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { academic_year_id: string; name: string; name_bn?: string; grades: Array<{ grade: string; grade_bn?: string; min_marks: number; max_marks: number; point: number; remarks?: string; remarks_bn?: string; display_order: number }> }) => {
      const { grades, ...scaleData } = input;
      const { data: scale, error } = await supabase
        .from('grading_scales')
        .insert(scaleData)
        .select()
        .single();
      if (error) throw error;

      if (grades.length > 0) {
        const { error: gpError } = await supabase
          .from('grade_points')
          .insert(grades.map(g => ({ ...g, grading_scale_id: scale.id })));
        if (gpError) throw gpError;
      }
      return scale;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grading-scales'] }),
  });
}

export function useDeleteGradingScale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('grading_scales').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grading-scales'] }),
  });
}

// ============ SUBJECTS ============
export function useSubjects(classId?: string) {
  const { activeYear } = useAcademicYear();
  return useQuery({
    queryKey: ['subjects', activeYear?.id, classId],
    queryFn: async () => {
      let query = supabase
        .from('subjects')
        .select('*, subject_components(*), class:classes(id, name, name_bn)')
        .eq('academic_year_id', activeYear!.id)
        .order('display_order');
      if (classId) query = query.eq('class_id', classId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!activeYear?.id,
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { academic_year_id: string; class_id: string; name: string; name_bn?: string; subject_code?: string; subject_type?: string; full_marks: number; pass_marks: number; has_components?: boolean; components?: Array<{ name: string; name_bn?: string; full_marks: number; pass_marks: number; is_required_for_pass?: boolean; display_order: number }> }) => {
      const { components, ...subjectData } = input;
      const { data: subject, error } = await supabase
        .from('subjects')
        .insert(subjectData)
        .select()
        .single();
      if (error) throw error;

      if (components && components.length > 0) {
        const { error: cError } = await supabase
          .from('subject_components')
          .insert(components.map(c => ({ ...c, subject_id: subject.id })));
        if (cError) throw cError;
      }
      return subject;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; name_bn?: string; subject_code?: string; subject_type?: string; full_marks?: number; pass_marks?: number; is_active?: boolean }) => {
      const { error } = await supabase.from('subjects').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  });
}

// ============ EXAM PATTERNS ============
export function useExamPatterns(classId?: string) {
  const { activeYear } = useAcademicYear();
  return useQuery({
    queryKey: ['exam-patterns', activeYear?.id, classId],
    queryFn: async () => {
      let query = supabase
        .from('exam_patterns')
        .select('*, exam_terms(*, term_exams(*, exam:exams(id, name, name_bn))), class:classes(id, name, name_bn)')
        .eq('academic_year_id', activeYear!.id)
        .order('created_at', { ascending: false });
      if (classId) query = query.eq('class_id', classId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!activeYear?.id,
  });
}

export function useCreateExamPattern() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { academic_year_id: string; class_id: string; name: string; name_bn?: string; pattern_type: string }) => {
      const { error, data } = await supabase.from('exam_patterns').insert({
        academic_year_id: input.academic_year_id,
        class_id: input.class_id,
        name: input.name,
        name_bn: input.name_bn,
        pattern_type: input.pattern_type,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-patterns'] }),
  });
}

export function useDeleteExamPattern() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('exam_patterns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-patterns'] }),
  });
}

// ============ EXAM TERMS ============
export function useCreateExamTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { exam_pattern_id: string; name: string; name_bn?: string; weight: number; display_order?: number }) => {
      const { error, data } = await supabase.from('exam_terms').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-patterns'] }),
  });
}

export function useCreateTermExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { term_id: string; exam_id: string; weight?: number; display_order?: number }) => {
      const { error, data } = await supabase.from('term_exams').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-patterns'] }),
  });
}

// ============ RESULT CONFIG ============
export function useResultConfig(classId?: string) {
  const { activeYear } = useAcademicYear();
  return useQuery({
    queryKey: ['result-config', activeYear?.id, classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('result_configs')
        .select('*, grading_scale:grading_scales(id, name)')
        .eq('academic_year_id', activeYear!.id)
        .eq('class_id', classId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!activeYear?.id && !!classId,
  });
}

export function useUpsertResultConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { academic_year_id: string; class_id: string; grading_scale_id?: string; absent_as_zero?: boolean; grace_marks?: number; grace_marks_enabled?: boolean; practical_must_pass?: boolean; optional_subject_bonus?: boolean; ranking_priority?: string[] }) => {
      const { data, error } = await supabase
        .from('result_configs')
        .upsert(input, { onConflict: 'academic_year_id,class_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['result-config'] }),
  });
}

// ============ MARKS ENTRIES ============
export function useMarksEntries(examId?: string, classId?: string, sectionId?: string, subjectId?: string) {
  return useQuery({
    queryKey: ['marks-entries', examId, classId, sectionId, subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marks_entries')
        .select('*, student:students(id, name, name_bn, student_id_number), subject:subjects(id, name, name_bn), component:subject_components(id, name)')
        .eq('exam_id', examId!)
        .eq('class_id', classId!)
        .eq('section_id', sectionId!)
        .eq('subject_id', subjectId!)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!examId && !!classId && !!sectionId && !!subjectId,
  });
}

export function useBulkUpsertMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entries: Array<{ academic_year_id: string; exam_id: string; class_id: string; section_id: string; subject_id: string; student_id: string; component_id?: string | null; marks?: number | null; is_absent?: boolean; entered_by: string; status: string }>) => {
      const { error } = await supabase
        .from('marks_entries')
        .upsert(entries, { onConflict: 'exam_id,subject_id,student_id,component_id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marks-entries'] }),
  });
}

export function useSubmitMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ examId, subjectId, classId, sectionId }: { examId: string; subjectId: string; classId: string; sectionId: string }) => {
      const { error } = await supabase
        .from('marks_entries')
        .update({ status: 'submitted', updated_at: new Date().toISOString() })
        .eq('exam_id', examId)
        .eq('subject_id', subjectId)
        .eq('class_id', classId)
        .eq('section_id', sectionId)
        .eq('status', 'draft');
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marks-entries'] }),
  });
}

export function useApproveMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ examId, subjectId, classId, sectionId, approvedBy }: { examId: string; subjectId: string; classId: string; sectionId: string; approvedBy: string }) => {
      const { error } = await supabase
        .from('marks_entries')
        .update({ status: 'approved', approved_by: approvedBy, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('exam_id', examId)
        .eq('subject_id', subjectId)
        .eq('class_id', classId)
        .eq('section_id', sectionId)
        .eq('status', 'submitted');
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marks-entries'] }),
  });
}

// ============ RESULT PUBLISH STATUS ============
export function useResultPublishStatus(examId?: string, classId?: string) {
  const { activeYear } = useAcademicYear();
  return useQuery({
    queryKey: ['result-publish-status', activeYear?.id, examId, classId],
    queryFn: async () => {
      let query = supabase
        .from('result_publish_status')
        .select('*')
        .eq('academic_year_id', activeYear!.id);
      if (examId) query = query.eq('exam_id', examId);
      if (classId) query = query.eq('class_id', classId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!activeYear?.id,
  });
}

export function useUpdatePublishStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { academic_year_id: string; exam_id: string; class_id: string; section_id?: string; status: string; published_by?: string }) => {
      const { error } = await supabase
        .from('result_publish_status')
        .upsert({
          ...input,
          published_at: input.status === 'published' ? new Date().toISOString() : null,
          locked: input.status === 'published',
        }, { onConflict: 'academic_year_id,exam_id,class_id,section_id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['result-publish-status'] }),
  });
}

// ============ PROMOTION OVERRIDES ============
export function usePromotionOverrides() {
  const { activeYear } = useAcademicYear();
  return useQuery({
    queryKey: ['promotion-overrides', activeYear?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotion_overrides')
        .select('*, student:students(id, name, name_bn)')
        .eq('academic_year_id', activeYear!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!activeYear?.id,
  });
}

export function useCreatePromotionOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { academic_year_id: string; student_id: string; original_status: string; override_status: string; reason?: string; overridden_by?: string }) => {
      const { error } = await supabase
        .from('promotion_overrides')
        .upsert(input, { onConflict: 'academic_year_id,student_id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promotion-overrides'] }),
  });
}

// ============ MARKS AUDIT ============
export function useMarksAuditLog(studentId?: string) {
  return useQuery({
    queryKey: ['marks-audit', studentId],
    queryFn: async () => {
      let query = supabase
        .from('marks_audit_log')
        .select('*, subject:subjects(name, name_bn), exam:exams(name, name_bn)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (studentId) query = query.eq('student_id', studentId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: true,
  });
}
