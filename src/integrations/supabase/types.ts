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
      calendar_class_entries: {
        Row: {
          calendar_id: string
          class_id: string
          created_at: string
          entry_type: string
          id: string
        }
        Insert: {
          calendar_id: string
          class_id: string
          created_at?: string
          entry_type: string
          id?: string
        }
        Update: {
          calendar_id?: string
          class_id?: string
          created_at?: string
          entry_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_class_entries_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "school_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_class_entries_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_monthly_fees: {
        Row: {
          academic_year_id: string
          admission_fee: number
          amount: number
          class_id: string
          created_at: string
          id: string
          session_charge: number
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          admission_fee?: number
          amount?: number
          class_id: string
          created_at?: string
          id?: string
          session_charge?: number
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          admission_fee?: number
          amount?: number
          class_id?: string
          created_at?: string
          id?: string
          session_charge?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_monthly_fees_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_monthly_fees_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          grade_order: number
          id: string
          is_active: boolean
          name: string
          name_bn: string | null
          panel_id: string | null
          shift_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade_order?: number
          id?: string
          is_active?: boolean
          name: string
          name_bn?: string | null
          panel_id?: string | null
          shift_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade_order?: number
          id?: string
          is_active?: boolean
          name?: string
          name_bn?: string | null
          panel_id?: string | null
          shift_id?: string | null
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
          {
            foreignKeyName: "classes_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
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
      exams: {
        Row: {
          academic_year_id: string
          created_at: string
          exam_fee_amount: number
          id: string
          is_active: boolean
          name: string
          name_bn: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          exam_fee_amount?: number
          id?: string
          is_active?: boolean
          name: string
          name_bn?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          exam_fee_amount?: number
          id?: string
          is_active?: boolean
          name?: string
          name_bn?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_settings: {
        Row: {
          academic_year_id: string
          created_at: string
          id: string
          late_fine_amount: number
          late_fine_enabled: boolean
          monthly_due_date: number
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          id?: string
          late_fine_amount?: number
          late_fine_enabled?: boolean
          monthly_due_date?: number
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          id?: string
          late_fine_amount?: number
          late_fine_enabled?: boolean
          monthly_due_date?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_settings_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: true
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_products: {
        Row: {
          academic_year_id: string | null
          category: string
          created_at: string
          id: string
          is_active: boolean
          min_stock_alert: number | null
          name: string
          name_bn: string | null
          sku: string | null
          stock_quantity: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          min_stock_alert?: number | null
          name: string
          name_bn?: string | null
          sku?: string | null
          stock_quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          min_stock_alert?: number | null
          name?: string
          name_bn?: string | null
          sku?: string | null
          stock_quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_products_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          academic_year_id: string | null
          created_at: string
          fee_record_id: string | null
          id: string
          notes: string | null
          product_id: string
          quantity: number
          sold_by: string | null
          student_id: string | null
          total_amount: number
          transaction_type: string
          unit_price: number
        }
        Insert: {
          academic_year_id?: string | null
          created_at?: string
          fee_record_id?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          sold_by?: string | null
          student_id?: string | null
          total_amount?: number
          transaction_type: string
          unit_price?: number
        }
        Update: {
          academic_year_id?: string | null
          created_at?: string
          fee_record_id?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          sold_by?: string | null
          student_id?: string | null
          total_amount?: number
          transaction_type?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_fee_record_id_fkey"
            columns: ["fee_record_id"]
            isOneToOne: false
            referencedRelation: "student_fee_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_attendance_logs: {
        Row: {
          admin_id: string
          attendance_date: string
          created_at: string
          id: string
          new_status: string
          old_status: string | null
          person_id: string
          person_type: string
          reason: string | null
        }
        Insert: {
          admin_id: string
          attendance_date: string
          created_at?: string
          id?: string
          new_status: string
          old_status?: string | null
          person_id: string
          person_type: string
          reason?: string | null
        }
        Update: {
          admin_id?: string
          attendance_date?: string
          created_at?: string
          id?: string
          new_status?: string
          old_status?: string | null
          person_id?: string
          person_type?: string
          reason?: string | null
        }
        Relationships: []
      }
      monitor_news: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          title: string
          title_bn: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          title: string
          title_bn?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          title?: string
          title_bn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      monitor_videos: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          video_url?: string
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
      punch_logs: {
        Row: {
          card_number: string | null
          created_at: string
          device_id: string | null
          id: string
          person_id: string
          person_type: string
          punch_date: string
          punch_time: string
        }
        Insert: {
          card_number?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          person_id: string
          person_type: string
          punch_date: string
          punch_time?: string
        }
        Update: {
          card_number?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          person_id?: string
          person_type?: string
          punch_date?: string
          punch_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "punch_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      required_documents: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          is_mandatory: boolean
          name: string
          name_bn: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_mandatory?: boolean
          name: string
          name_bn?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_mandatory?: boolean
          name?: string
          name_bn?: string | null
          updated_at?: string
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
      school_calendar: {
        Row: {
          academic_year_id: string
          applies_to_all_classes: boolean
          calendar_date: string
          created_at: string
          created_by: string | null
          day_type: string
          description: string | null
          id: string
          title: string | null
          title_bn: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          applies_to_all_classes?: boolean
          calendar_date: string
          created_at?: string
          created_by?: string | null
          day_type: string
          description?: string | null
          id?: string
          title?: string | null
          title_bn?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          applies_to_all_classes?: boolean
          calendar_date?: string
          created_at?: string
          created_by?: string | null
          day_type?: string
          description?: string | null
          id?: string
          title?: string | null
          title_bn?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_calendar_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
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
          absent_cutoff_time: string | null
          academic_year_id: string
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          late_threshold_time: string | null
          name: string
          name_bn: string | null
          sms_trigger_time: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          absent_cutoff_time?: string | null
          academic_year_id: string
          created_at?: string
          end_time: string
          id?: string
          is_active?: boolean
          late_threshold_time?: string | null
          name: string
          name_bn?: string | null
          sms_trigger_time?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          absent_cutoff_time?: string | null
          academic_year_id?: string
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          late_threshold_time?: string | null
          name?: string
          name_bn?: string | null
          sms_trigger_time?: string | null
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
          channel: string | null
          created_at: string
          error_message: string | null
          fallback_used: boolean | null
          id: string
          message: string
          mobile_number: string
          provider_name: string | null
          response_code: string | null
          response_message: string | null
          retry_count: number | null
          sent_at: string | null
          sent_by: string | null
          sms_type: string
          status: string
          student_id: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string
          error_message?: string | null
          fallback_used?: boolean | null
          id?: string
          message: string
          mobile_number: string
          provider_name?: string | null
          response_code?: string | null
          response_message?: string | null
          retry_count?: number | null
          sent_at?: string | null
          sent_by?: string | null
          sms_type: string
          status: string
          student_id?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string
          error_message?: string | null
          fallback_used?: boolean | null
          id?: string
          message?: string
          mobile_number?: string
          provider_name?: string | null
          response_code?: string | null
          response_message?: string | null
          retry_count?: number | null
          sent_at?: string | null
          sent_by?: string | null
          sms_type?: string
          status?: string
          student_id?: string | null
          whatsapp_message_id?: string | null
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
          active_sms_provider: string | null
          api_key: string | null
          balance: number | null
          bulksmsbd_api_key: string | null
          bulksmsbd_balance: number | null
          bulksmsbd_balance_updated_at: string | null
          bulksmsbd_sender_id: string | null
          created_at: string
          id: string
          is_enabled: boolean
          late_sms_enabled: boolean | null
          late_sms_template: string | null
          monthly_summary_enabled: boolean
          preferred_channel: string | null
          punch_sms_enabled: boolean | null
          punch_sms_template: string | null
          sender_id: string | null
          sms_template: string | null
          updated_at: string
          whatsapp_access_token: string | null
          whatsapp_business_account_id: string | null
          whatsapp_enabled: boolean | null
          whatsapp_fallback_to_sms: boolean | null
          whatsapp_phone_number_id: string | null
        }
        Insert: {
          absent_sms_enabled?: boolean
          active_sms_provider?: string | null
          api_key?: string | null
          balance?: number | null
          bulksmsbd_api_key?: string | null
          bulksmsbd_balance?: number | null
          bulksmsbd_balance_updated_at?: string | null
          bulksmsbd_sender_id?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          late_sms_enabled?: boolean | null
          late_sms_template?: string | null
          monthly_summary_enabled?: boolean
          preferred_channel?: string | null
          punch_sms_enabled?: boolean | null
          punch_sms_template?: string | null
          sender_id?: string | null
          sms_template?: string | null
          updated_at?: string
          whatsapp_access_token?: string | null
          whatsapp_business_account_id?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_fallback_to_sms?: boolean | null
          whatsapp_phone_number_id?: string | null
        }
        Update: {
          absent_sms_enabled?: boolean
          active_sms_provider?: string | null
          api_key?: string | null
          balance?: number | null
          bulksmsbd_api_key?: string | null
          bulksmsbd_balance?: number | null
          bulksmsbd_balance_updated_at?: string | null
          bulksmsbd_sender_id?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          late_sms_enabled?: boolean | null
          late_sms_template?: string | null
          monthly_summary_enabled?: boolean
          preferred_channel?: string | null
          punch_sms_enabled?: boolean | null
          punch_sms_template?: string | null
          sender_id?: string | null
          sms_template?: string | null
          updated_at?: string
          whatsapp_access_token?: string | null
          whatsapp_business_account_id?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_fallback_to_sms?: boolean | null
          whatsapp_phone_number_id?: string | null
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
      student_custom_fees: {
        Row: {
          created_at: string
          custom_admission_fee: number | null
          custom_monthly_fee: number | null
          effective_from: string
          id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_admission_fee?: number | null
          custom_monthly_fee?: number | null
          effective_from?: string
          id?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_admission_fee?: number | null
          custom_monthly_fee?: number | null
          effective_from?: string
          id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_custom_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          created_at: string
          document_id: string
          file_url: string | null
          id: string
          is_submitted: boolean
          notes: string | null
          student_id: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_id: string
          file_url?: string | null
          id?: string
          is_submitted?: boolean
          notes?: string | null
          student_id: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          file_url?: string | null
          id?: string
          is_submitted?: boolean
          notes?: string | null
          student_id?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "required_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fee_records: {
        Row: {
          academic_year_id: string
          amount_due: number
          amount_paid: number
          collected_by: string | null
          created_at: string
          exam_id: string | null
          fee_month: string | null
          fee_type: string
          id: string
          late_fine: number
          payment_date: string | null
          receipt_number: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          amount_due?: number
          amount_paid?: number
          collected_by?: string | null
          created_at?: string
          exam_id?: string | null
          fee_month?: string | null
          fee_type: string
          id?: string
          late_fine?: number
          payment_date?: string | null
          receipt_number?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          amount_due?: number
          amount_paid?: number
          collected_by?: string | null
          created_at?: string
          exam_id?: string | null
          fee_month?: string | null
          fee_type?: string
          id?: string
          late_fine?: number
          payment_date?: string | null
          receipt_number?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_fee_records_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_records_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_records_student_id_fkey"
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
          admission_date: string | null
          blood_group: string | null
          class_id: string
          created_at: string
          guardian_mobile: string
          id: string
          is_active: boolean
          name: string
          name_bn: string | null
          panel_id: string | null
          photo_url: string | null
          section_id: string
          shift_id: string
          student_id_number: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          admission_date?: string | null
          blood_group?: string | null
          class_id: string
          created_at?: string
          guardian_mobile: string
          id?: string
          is_active?: boolean
          name: string
          name_bn?: string | null
          panel_id?: string | null
          photo_url?: string | null
          section_id: string
          shift_id: string
          student_id_number?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          admission_date?: string | null
          blood_group?: string | null
          class_id?: string
          created_at?: string
          guardian_mobile?: string
          id?: string
          is_active?: boolean
          name?: string
          name_bn?: string | null
          panel_id?: string | null
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
          monitor_logo_url: string | null
          school_logo_url: string | null
          school_name: string | null
          school_name_bn: string | null
          scroller_bg_color: string | null
          scroller_bullet_color: string | null
          scroller_font_family: string | null
          scroller_font_size: number | null
          scroller_speed: number | null
          scroller_text_color: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          monitor_logo_url?: string | null
          school_logo_url?: string | null
          school_name?: string | null
          school_name_bn?: string | null
          scroller_bg_color?: string | null
          scroller_bullet_color?: string | null
          scroller_font_family?: string | null
          scroller_font_size?: number | null
          scroller_speed?: number | null
          scroller_text_color?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          monitor_logo_url?: string | null
          school_logo_url?: string | null
          school_name?: string | null
          school_name_bn?: string | null
          scroller_bg_color?: string | null
          scroller_bullet_color?: string | null
          scroller_font_family?: string | null
          scroller_font_size?: number | null
          scroller_speed?: number | null
          scroller_text_color?: string | null
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
          panel_id: string | null
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
          panel_id?: string | null
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
          panel_id?: string | null
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
      website_about_content: {
        Row: {
          content: string | null
          content_bn: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string | null
          is_enabled: boolean | null
          section_key: string
          title: string | null
          title_bn: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          content_bn?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_enabled?: boolean | null
          section_key: string
          title?: string | null
          title_bn?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          content_bn?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_enabled?: boolean | null
          section_key?: string
          title?: string | null
          title_bn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      website_academics: {
        Row: {
          category: string | null
          class_id: string | null
          created_at: string
          description: string | null
          description_bn: string | null
          display_order: number
          id: string
          is_enabled: boolean
          syllabus_pdf_url: string | null
          title: string
          title_bn: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          class_id?: string | null
          created_at?: string
          description?: string | null
          description_bn?: string | null
          display_order?: number
          id?: string
          is_enabled?: boolean
          syllabus_pdf_url?: string | null
          title: string
          title_bn?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          class_id?: string | null
          created_at?: string
          description?: string | null
          description_bn?: string | null
          display_order?: number
          id?: string
          is_enabled?: boolean
          syllabus_pdf_url?: string | null
          title?: string
          title_bn?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_academics_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      website_admission_info: {
        Row: {
          content: string | null
          content_bn: string | null
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          is_enabled: boolean | null
          section_key: string
          title: string
          title_bn: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          content_bn?: string | null
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_enabled?: boolean | null
          section_key: string
          title: string
          title_bn?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          content_bn?: string | null
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_enabled?: boolean | null
          section_key?: string
          title?: string
          title_bn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      website_alumni: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          comment: string | null
          comment_bn: string | null
          created_at: string
          current_position: string | null
          current_position_bn: string | null
          custom_fields: Json | null
          id: string
          is_approved: boolean
          is_featured: boolean
          name: string
          name_bn: string | null
          passing_year: number
          photo_url: string | null
          show_in_bubble: boolean
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          comment?: string | null
          comment_bn?: string | null
          created_at?: string
          current_position?: string | null
          current_position_bn?: string | null
          custom_fields?: Json | null
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          name: string
          name_bn?: string | null
          passing_year: number
          photo_url?: string | null
          show_in_bubble?: boolean
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          comment?: string | null
          comment_bn?: string | null
          created_at?: string
          current_position?: string | null
          current_position_bn?: string | null
          custom_fields?: Json | null
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          name?: string
          name_bn?: string | null
          passing_year?: number
          photo_url?: string | null
          show_in_bubble?: boolean
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      website_alumni_form_fields: {
        Row: {
          created_at: string | null
          display_order: number | null
          field_label: string
          field_label_bn: string | null
          field_name: string
          field_type: string | null
          id: string
          is_enabled: boolean | null
          is_required: boolean | null
          options: Json | null
          placeholder: string | null
          placeholder_bn: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          field_label: string
          field_label_bn?: string | null
          field_name: string
          field_type?: string | null
          id?: string
          is_enabled?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          placeholder?: string | null
          placeholder_bn?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          field_label?: string
          field_label_bn?: string | null
          field_name?: string
          field_type?: string | null
          id?: string
          is_enabled?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          placeholder?: string | null
          placeholder_bn?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      website_alumni_podcasts: {
        Row: {
          alumni_id: string | null
          created_at: string | null
          description: string | null
          description_bn: string | null
          display_order: number | null
          id: string
          is_enabled: boolean | null
          is_featured: boolean | null
          thumbnail_url: string | null
          title: string
          title_bn: string | null
          updated_at: string | null
          youtube_url: string
        }
        Insert: {
          alumni_id?: string | null
          created_at?: string | null
          description?: string | null
          description_bn?: string | null
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          is_featured?: boolean | null
          thumbnail_url?: string | null
          title: string
          title_bn?: string | null
          updated_at?: string | null
          youtube_url: string
        }
        Update: {
          alumni_id?: string | null
          created_at?: string | null
          description?: string | null
          description_bn?: string | null
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          is_featured?: boolean | null
          thumbnail_url?: string | null
          title?: string
          title_bn?: string | null
          updated_at?: string | null
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_alumni_podcasts_alumni_id_fkey"
            columns: ["alumni_id"]
            isOneToOne: false
            referencedRelation: "website_alumni"
            referencedColumns: ["id"]
          },
        ]
      }
      website_available_sections: {
        Row: {
          component_name: string | null
          created_at: string
          description: string | null
          id: string
          section_key: string
          section_name: string
          section_name_bn: string | null
          source_page: string | null
        }
        Insert: {
          component_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          section_key: string
          section_name: string
          section_name_bn?: string | null
          source_page?: string | null
        }
        Update: {
          component_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          section_key?: string
          section_name?: string
          section_name_bn?: string | null
          source_page?: string | null
        }
        Relationships: []
      }
      website_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
          replied_at: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          replied_at?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          replied_at?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      website_cta_buttons: {
        Row: {
          button_key: string
          created_at: string
          display_order: number | null
          id: string
          is_enabled: boolean | null
          label: string
          label_bn: string | null
          link_url: string
          updated_at: string
        }
        Insert: {
          button_key: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          label: string
          label_bn?: string | null
          link_url?: string
          updated_at?: string
        }
        Update: {
          button_key?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          label?: string
          label_bn?: string | null
          link_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      website_facilities: {
        Row: {
          created_at: string
          description: string | null
          description_bn: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_enabled: boolean | null
          title: string
          title_bn: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_bn?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_enabled?: boolean | null
          title: string
          title_bn?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_bn?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_enabled?: boolean | null
          title?: string
          title_bn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      website_hero_slides: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_enabled: boolean | null
          link_url: string | null
          subtitle: string | null
          subtitle_bn: string | null
          title: string | null
          title_bn: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_enabled?: boolean | null
          link_url?: string | null
          subtitle?: string | null
          subtitle_bn?: string | null
          title?: string | null
          title_bn?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_enabled?: boolean | null
          link_url?: string | null
          subtitle?: string | null
          subtitle_bn?: string | null
          title?: string | null
          title_bn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      website_home_sections: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_enabled: boolean | null
          section_key: string
          section_name: string
          section_name_bn: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          section_key: string
          section_name: string
          section_name_bn?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          section_key?: string
          section_name?: string
          section_name_bn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      website_methodologies: {
        Row: {
          created_at: string
          description: string | null
          description_bn: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_enabled: boolean | null
          title: string
          title_bn: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_bn?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_enabled?: boolean | null
          title: string
          title_bn?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_bn?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_enabled?: boolean | null
          title?: string
          title_bn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      website_notices: {
        Row: {
          attachment_url: string | null
          category: string
          content: string
          content_bn: string | null
          created_at: string
          created_by: string | null
          id: string
          is_pinned: boolean
          is_published: boolean
          publish_date: string | null
          title: string
          title_bn: string | null
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          category?: string
          content: string
          content_bn?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_pinned?: boolean
          is_published?: boolean
          publish_date?: string | null
          title: string
          title_bn?: string | null
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          category?: string
          content?: string
          content_bn?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_pinned?: boolean
          is_published?: boolean
          publish_date?: string | null
          title?: string
          title_bn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      website_pages: {
        Row: {
          created_at: string
          custom_content: string | null
          custom_content_bn: string | null
          display_order: number
          id: string
          is_custom_page: boolean | null
          is_enabled: boolean
          parent_page_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          title_bn: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_content?: string | null
          custom_content_bn?: string | null
          display_order?: number
          id?: string
          is_custom_page?: boolean | null
          is_enabled?: boolean
          parent_page_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          title_bn?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_content?: string | null
          custom_content_bn?: string | null
          display_order?: number
          id?: string
          is_custom_page?: boolean | null
          is_enabled?: boolean
          parent_page_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          title_bn?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_pages_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "website_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      website_parent_testimonials: {
        Row: {
          comment: string
          comment_bn: string | null
          created_at: string
          display_order: number | null
          id: string
          is_enabled: boolean | null
          name: string
          name_bn: string | null
          photo_url: string | null
          rating: number | null
          relation: string | null
          relation_bn: string | null
          student_class: string | null
          updated_at: string
        }
        Insert: {
          comment: string
          comment_bn?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          name: string
          name_bn?: string | null
          photo_url?: string | null
          rating?: number | null
          relation?: string | null
          relation_bn?: string | null
          student_class?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string
          comment_bn?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          name_bn?: string | null
          photo_url?: string | null
          rating?: number | null
          relation?: string | null
          relation_bn?: string | null
          student_class?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      website_popup_notice: {
        Row: {
          button_link: string | null
          button_text: string | null
          button_text_bn: string | null
          created_at: string
          description: string | null
          description_bn: string | null
          display_type: string | null
          id: string
          image_url: string | null
          is_enabled: boolean | null
          show_once_per_session: boolean | null
          title: string | null
          title_bn: string | null
          updated_at: string
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          button_text_bn?: string | null
          created_at?: string
          description?: string | null
          description_bn?: string | null
          display_type?: string | null
          id?: string
          image_url?: string | null
          is_enabled?: boolean | null
          show_once_per_session?: boolean | null
          title?: string | null
          title_bn?: string | null
          updated_at?: string
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          button_text_bn?: string | null
          created_at?: string
          description?: string | null
          description_bn?: string | null
          display_type?: string | null
          id?: string
          image_url?: string | null
          is_enabled?: boolean | null
          show_once_per_session?: boolean | null
          title?: string | null
          title_bn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      website_programs: {
        Row: {
          color_from: string | null
          color_to: string | null
          created_at: string
          description: string | null
          description_bn: string | null
          display_order: number | null
          grades: string | null
          grades_bn: string | null
          icon: string | null
          id: string
          is_enabled: boolean | null
          level: string
          level_bn: string | null
          updated_at: string
        }
        Insert: {
          color_from?: string | null
          color_to?: string | null
          created_at?: string
          description?: string | null
          description_bn?: string | null
          display_order?: number | null
          grades?: string | null
          grades_bn?: string | null
          icon?: string | null
          id?: string
          is_enabled?: boolean | null
          level: string
          level_bn?: string | null
          updated_at?: string
        }
        Update: {
          color_from?: string | null
          color_to?: string | null
          created_at?: string
          description?: string | null
          description_bn?: string | null
          display_order?: number | null
          grades?: string | null
          grades_bn?: string | null
          icon?: string | null
          id?: string
          is_enabled?: boolean | null
          level?: string
          level_bn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      website_results: {
        Row: {
          academic_year_id: string
          class_id: string
          created_at: string
          exam_id: string
          id: string
          is_published: boolean
          pdf_url: string
          published_at: string | null
          title: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          academic_year_id: string
          class_id: string
          created_at?: string
          exam_id: string
          id?: string
          is_published?: boolean
          pdf_url: string
          published_at?: string | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          academic_year_id?: string
          class_id?: string
          created_at?: string
          exam_id?: string
          id?: string
          is_published?: boolean
          pdf_url?: string
          published_at?: string | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_results_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_results_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      website_sections: {
        Row: {
          content: string | null
          content_bn: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_enabled: boolean
          metadata: Json | null
          page_slug: string
          section_type: string
          title: string | null
          title_bn: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          content_bn?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_enabled?: boolean
          metadata?: Json | null
          page_slug: string
          section_type: string
          title?: string | null
          title_bn?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          content_bn?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_enabled?: boolean
          metadata?: Json | null
          page_slug?: string
          section_type?: string
          title?: string | null
          title_bn?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_sections_page_slug_fkey"
            columns: ["page_slug"]
            isOneToOne: false
            referencedRelation: "website_pages"
            referencedColumns: ["slug"]
          },
        ]
      }
      website_settings: {
        Row: {
          contact_address: string | null
          contact_address_bn: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          cta_button_color: string | null
          facebook_url: string | null
          favicon_url: string | null
          google_map_embed: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_subtitle_bn: string | null
          hero_title: string | null
          hero_title_bn: string | null
          hero_video_url: string | null
          id: string
          instagram_url: string | null
          is_website_enabled: boolean
          logo_url: string | null
          office_hours: string | null
          office_hours_bn: string | null
          primary_color: string | null
          school_name: string | null
          school_name_bn: string | null
          secondary_button_color: string | null
          secondary_color: string | null
          seo_description: string | null
          seo_title: string | null
          twitter_url: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          contact_address?: string | null
          contact_address_bn?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          cta_button_color?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          google_map_embed?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_subtitle_bn?: string | null
          hero_title?: string | null
          hero_title_bn?: string | null
          hero_video_url?: string | null
          id?: string
          instagram_url?: string | null
          is_website_enabled?: boolean
          logo_url?: string | null
          office_hours?: string | null
          office_hours_bn?: string | null
          primary_color?: string | null
          school_name?: string | null
          school_name_bn?: string | null
          secondary_button_color?: string | null
          secondary_color?: string | null
          seo_description?: string | null
          seo_title?: string | null
          twitter_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          contact_address?: string | null
          contact_address_bn?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          cta_button_color?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          google_map_embed?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_subtitle_bn?: string | null
          hero_title?: string | null
          hero_title_bn?: string | null
          hero_video_url?: string | null
          id?: string
          instagram_url?: string | null
          is_website_enabled?: boolean
          logo_url?: string | null
          office_hours?: string | null
          office_hours_bn?: string | null
          primary_color?: string | null
          school_name?: string | null
          school_name_bn?: string | null
          secondary_button_color?: string | null
          secondary_color?: string | null
          seo_description?: string | null
          seo_title?: string | null
          twitter_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      website_testimonials: {
        Row: {
          content: string
          content_bn: string | null
          created_at: string
          display_order: number
          id: string
          is_enabled: boolean
          name: string
          name_bn: string | null
          photo_url: string | null
          rating: number | null
          role: string | null
          updated_at: string
        }
        Insert: {
          content: string
          content_bn?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_enabled?: boolean
          name: string
          name_bn?: string | null
          photo_url?: string | null
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          content_bn?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_enabled?: boolean
          name?: string
          name_bn?: string | null
          photo_url?: string | null
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      weekly_holidays: {
        Row: {
          academic_year_id: string
          created_at: string
          day_of_week: number
          id: string
          is_holiday: boolean
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          day_of_week: number
          id?: string
          is_holiday?: boolean
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          day_of_week?: number
          id?: string
          is_holiday?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_holidays_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_dashboard_stats: {
        Args: { p_academic_year_id: string; p_date: string }
        Returns: Json
      }
      get_working_days_count: {
        Args: {
          p_academic_year_id: string
          p_class_id: string
          p_end_date: string
          p_start_date: string
        }
        Returns: number
      }
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_working_day: {
        Args: { p_academic_year_id: string; p_class_id: string; p_date: string }
        Returns: boolean
      }
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
