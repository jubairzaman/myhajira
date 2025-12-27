export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          is_archived: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          is_archived?: boolean
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          is_archived?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string
          grade_order: number
          id: string
          is_active: boolean
          name: string
          name_bn: string | null
          panel_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade_order?: number
          id?: string
          is_active?: boolean
          name: string
          name_bn?: string | null
          panel_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade_order?: number
          id?: string
          is_active?: boolean
          name?: string
          name_bn?: string | null
          panel_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          ip_address: string
          is_active: boolean
          is_online: boolean
          last_sync_at: string | null
          location: string | null
          name: string
          port: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address: string
          is_active?: boolean
          is_online?: boolean
          last_sync_at?: string | null
          location?: string | null
          name: string
          port?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string
          is_active?: boolean
          is_online?: boolean
          last_sync_at?: string | null
          location?: string | null
          name?: string
          port?: number
          updated_at?: string
        }
        Relationships: []
      }
      panels: {
        Row: {
          absent_cutoff_time: string
          created_at: string
          id: string
          is_active: boolean
          late_threshold_time: string
          name: string
          name_bn: string | null
          shift_id: string
          sms_trigger_time: string
          start_time: string
          type: string
          updated_at: string
        }
        Insert: {
          absent_cutoff_time: string
          created_at?: string
          id?: string
          is_active?: boolean
          late_threshold_time: string
          name: string
          name_bn?: string | null
          shift_id: string
          sms_trigger_time: string
          start_time: string
          type: string
          updated_at?: string
        }
        Update: {
          absent_cutoff_time?: string
          created_at?: string
          id?: string
          is_active?: boolean
          late_threshold_time?: string
          name?: string
          name_bn?: string | null
          shift_id?: string
          sms_trigger_time?: string
          start_time?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "panels_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rfid_cards_students: {
        Row: {
          card_number: string
          created_at: string
          enrolled_at: string
          id: string
          is_active: boolean
          student_id: string
        }
        Insert: {
          card_number: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          student_id: string
        }
        Update: {
          card_number?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfid_cards_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      rfid_cards_teachers: {
        Row: {
          card_number: string
          created_at: string
          enrolled_at: string
          id: string
          is_active: boolean
          teacher_id: string
        }
        Insert: {
          card_number: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          teacher_id: string
        }
        Update: {
          card_number?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfid_cards_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: true
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          class_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          name_bn: string | null
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          name_bn?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          name_bn?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          academic_year_id: string
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          name: string
          name_bn: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          end_time: string
          id?: string
          is_active?: boolean
          name: string
          name_bn?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          name?: string
          name_bn?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message: string
          mobile_number: string
          retry_count: number | null
          sent_at: string | null
          sms_type: string
          status: string
          student_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          mobile_number: string
          retry_count?: number | null
          sent_at?: string | null
          sms_type: string
          status: string
          student_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          mobile_number?: string
          retry_count?: number | null
          sent_at?: string | null
          sms_type?: string
          status?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_settings: {
        Row: {
          absent_sms_enabled: boolean
          api_key: string | null
          balance: number | null
          created_at: string
          id: string
          is_enabled: boolean
          monthly_summary_enabled: boolean
          sender_id: string | null
          sms_template: string | null
          updated_at: string
        }
        Insert: {
          absent_sms_enabled?: boolean
          api_key?: string | null
          balance?: number | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          monthly_summary_enabled?: boolean
          sender_id?: string | null
          sms_template?: string | null
          updated_at?: string
        }
        Update: {
          absent_sms_enabled?: boolean
          api_key?: string | null
          balance?: number | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          monthly_summary_enabled?: boolean
          sender_id?: string | null
          sms_template?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_attendance: {
        Row: {
          academic_year_id: string
          attendance_date: string
          created_at: string
          device_id: string | null
          id: string
          is_manual: boolean
          manual_by: string | null
          manual_reason: string | null
          punch_time: string
          status: string
          student_id: string
        }
        Insert: {
          academic_year_id: string
          attendance_date: string
          created_at?: string
          device_id?: string | null
          id?: string
          is_manual?: boolean
          manual_by?: string | null
          manual_reason?: string | null
          punch_time: string
          status: string
          student_id: string
        }
        Update: {
          academic_year_id?: string
          attendance_date?: string
          created_at?: string
          device_id?: string | null
          id?: string
          is_manual?: boolean
          manual_by?: string | null
          manual_reason?: string | null
          punch_time?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_year_id: string
          blood_group: string | null
          class_id: string
          created_at: string
          guardian_mobile: string
          id: string
          is_active: boolean
          name: string
          name_bn: string | null
          panel_id: string
          photo_url: string | null
          section_id: string
          shift_id: string
          student_id_number: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          blood_group?: string | null
          class_id: string
          created_at?: string
          guardian_mobile: string
          id?: string
          is_active?: boolean
          name: string
          name_bn?: string | null
          panel_id: string
          photo_url?: string | null
          section_id: string
          shift_id: string
          student_id_number?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          blood_group?: string | null
          class_id?: string
          created_at?: string
          guardian_mobile?: string
          id?: string
          is_active?: boolean
          name?: string
          name_bn?: string | null
          panel_id?: string
          photo_url?: string | null
          section_id?: string
          shift_id?: string
          student_id_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          id: string
          school_logo_url: string | null
          school_name: string | null
          school_name_bn: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          school_logo_url?: string | null
          school_name?: string | null
          school_name_bn?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          school_logo_url?: string | null
          school_name?: string | null
          school_name_bn?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      teacher_attendance: {
        Row: {
          academic_year_id: string
          attendance_date: string
          created_at: string
          device_id: string | null
          id: string
          is_manual: boolean
          late_minutes: number | null
          manual_by: string | null
          manual_reason: string | null
          punch_in_time: string | null
          punch_out_time: string | null
          status: string
          teacher_id: string
        }
        Insert: {
          academic_year_id: string
          attendance_date: string
          created_at?: string
          device_id?: string | null
          id?: string
          is_manual?: boolean
          late_minutes?: number | null
          manual_by?: string | null
          manual_reason?: string | null
          punch_in_time?: string | null
          punch_out_time?: string | null
          status: string
          teacher_id: string
        }
        Update: {
          academic_year_id?: string
          attendance_date?: string
          created_at?: string
          device_id?: string | null
          id?: string
          is_manual?: boolean
          late_minutes?: number | null
          manual_by?: string | null
          manual_reason?: string | null
          punch_in_time?: string | null
          punch_out_time?: string | null
          status?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_attendance_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_attendance_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          academic_year_id: string
          blood_group: string | null
          created_at: string
          designation: string
          id: string
          is_active: boolean
          mobile: string
          name: string
          name_bn: string | null
          panel_id: string
          photo_url: string | null
          shift_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          blood_group?: string | null
          created_at?: string
          designation: string
          id?: string
          is_active?: boolean
          mobile: string
          name: string
          name_bn?: string | null
          panel_id: string
          photo_url?: string | null
          shift_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          blood_group?: string | null
          created_at?: string
          designation?: string
          id?: string
          is_active?: boolean
          mobile?: string
          name?: string
          name_bn?: string | null
          panel_id?: string
          photo_url?: string | null
          shift_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teachers_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teachers_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "teacher" | "operator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "teacher", "operator"],
    },
  },
} as const
