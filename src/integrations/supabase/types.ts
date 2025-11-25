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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assessment_products: {
        Row: {
          adaptive_selection: boolean | null
          age_group: string | null
          created_at: string | null
          description: string
          difficulty_level: string
          dimension_codes: Json | null
          display_order: number | null
          duration_minutes: number
          id: string
          irt_enabled: boolean | null
          is_active: boolean | null
          json_file_path: string
          name: string
          passing_score: number | null
          presentation_mode: string | null
          question_count: number
          role: string | null
          slug: string
          target_audience: string
          total_bank_items: number | null
          total_points: number
          track: string
          updated_at: string | null
        }
        Insert: {
          adaptive_selection?: boolean | null
          age_group?: string | null
          created_at?: string | null
          description: string
          difficulty_level: string
          dimension_codes?: Json | null
          display_order?: number | null
          duration_minutes: number
          id?: string
          irt_enabled?: boolean | null
          is_active?: boolean | null
          json_file_path: string
          name: string
          passing_score?: number | null
          presentation_mode?: string | null
          question_count: number
          role?: string | null
          slug: string
          target_audience: string
          total_bank_items?: number | null
          total_points: number
          track: string
          updated_at?: string | null
        }
        Update: {
          adaptive_selection?: boolean | null
          age_group?: string | null
          created_at?: string | null
          description?: string
          difficulty_level?: string
          dimension_codes?: Json | null
          display_order?: number | null
          duration_minutes?: number
          id?: string
          irt_enabled?: boolean | null
          is_active?: boolean | null
          json_file_path?: string
          name?: string
          passing_score?: number | null
          presentation_mode?: string | null
          question_count?: number
          role?: string | null
          slug?: string
          target_audience?: string
          total_bank_items?: number | null
          total_points?: number
          track?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          email: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string | null
          region: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          region?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          region?: string | null
          user_id?: string
        }
        Relationships: []
      }
      public_results: {
        Row: {
          created_at: string
          dimension_scores: Json
          expires_at: string | null
          id: string
          overall_score: number
          pdf_url: string | null
          percentile_rank: number | null
          product_id: string | null
          product_slug: string | null
          report_generated_at: string | null
          share_code: string
          test_completion_date: string | null
          test_duration_seconds: number | null
          test_id: string
          test_version: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          created_at?: string
          dimension_scores: Json
          expires_at?: string | null
          id?: string
          overall_score: number
          pdf_url?: string | null
          percentile_rank?: number | null
          product_id?: string | null
          product_slug?: string | null
          report_generated_at?: string | null
          share_code: string
          test_completion_date?: string | null
          test_duration_seconds?: number | null
          test_id: string
          test_version?: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          created_at?: string
          dimension_scores?: Json
          expires_at?: string | null
          id?: string
          overall_score?: number
          pdf_url?: string | null
          percentile_rank?: number | null
          product_id?: string | null
          product_slug?: string | null
          report_generated_at?: string | null
          share_code?: string
          test_completion_date?: string | null
          test_duration_seconds?: number | null
          test_id?: string
          test_version?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_results_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "assessment_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          count: number | null
          created_at: string | null
          id: string
          key: string
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          id?: string
          key: string
        }
        Update: {
          count?: number | null
          created_at?: string | null
          id?: string
          key?: string
        }
        Relationships: []
      }
      security_violations: {
        Row: {
          additional_data: Json | null
          id: string
          test_id: string
          timestamp: string
          user_agent: string | null
          user_id: string
          violation_type: string
        }
        Insert: {
          additional_data?: Json | null
          id?: string
          test_id: string
          timestamp?: string
          user_agent?: string | null
          user_id: string
          violation_type: string
        }
        Update: {
          additional_data?: Json | null
          id?: string
          test_id?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_violations_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_demographics: {
        Row: {
          age_range: string | null
          ai_familiarity: string
          ai_tools_used: Json
          ai_training: string
          ai_usage_frequency: string
          ai_use_cases: Json | null
          assessment_reasons: Json
          assessment_tier: string
          consent_assessment: boolean
          consent_communications: boolean | null
          consent_data_usage: boolean
          consent_research: boolean | null
          consent_results_access: boolean
          consent_security_monitoring: boolean | null
          country: string | null
          created_at: string
          education_level: string | null
          full_name: string
          id: string
          industry_sector: string
          job_role: string
          organization_size: string | null
          organization_type: string
          phone_number: string | null
          primary_language: string | null
          results_usage: Json | null
          technical_background: string | null
          test_id: string
          user_id: string
          years_experience: string
        }
        Insert: {
          age_range?: string | null
          ai_familiarity: string
          ai_tools_used?: Json
          ai_training: string
          ai_usage_frequency: string
          ai_use_cases?: Json | null
          assessment_reasons?: Json
          assessment_tier: string
          consent_assessment?: boolean
          consent_communications?: boolean | null
          consent_data_usage?: boolean
          consent_research?: boolean | null
          consent_results_access?: boolean
          consent_security_monitoring?: boolean | null
          country?: string | null
          created_at?: string
          education_level?: string | null
          full_name: string
          id?: string
          industry_sector: string
          job_role: string
          organization_size?: string | null
          organization_type: string
          phone_number?: string | null
          primary_language?: string | null
          results_usage?: Json | null
          technical_background?: string | null
          test_id: string
          user_id: string
          years_experience: string
        }
        Update: {
          age_range?: string | null
          ai_familiarity?: string
          ai_tools_used?: Json
          ai_training?: string
          ai_usage_frequency?: string
          ai_use_cases?: Json | null
          assessment_reasons?: Json
          assessment_tier?: string
          consent_assessment?: boolean
          consent_communications?: boolean | null
          consent_data_usage?: boolean
          consent_research?: boolean | null
          consent_results_access?: boolean
          consent_security_monitoring?: boolean | null
          country?: string | null
          created_at?: string
          education_level?: string | null
          full_name?: string
          id?: string
          industry_sector?: string
          job_role?: string
          organization_size?: string | null
          organization_type?: string
          phone_number?: string | null
          primary_language?: string | null
          results_usage?: Json | null
          technical_background?: string | null
          test_id?: string
          user_id?: string
          years_experience?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_demographics_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: true
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          answers: Json
          completed: boolean
          consent_given: boolean | null
          consent_timestamp: string | null
          created_at: string
          current_dimension: number | null
          current_item: number | null
          dimension_states: Json | null
          end_time: string | null
          fullscreen_exit_count: number | null
          id: string
          json_version: string
          pause_timestamp: string | null
          paused: boolean | null
          product_id: string | null
          product_slug: string | null
          scores: Json
          security_consent_given: boolean | null
          security_terminated: boolean | null
          security_violations_count: number | null
          start_time: string
          test_duration_seconds: number | null
          test_started: boolean | null
          test_version: string
          time_remaining: number | null
          user_id: string
        }
        Insert: {
          answers?: Json
          completed?: boolean
          consent_given?: boolean | null
          consent_timestamp?: string | null
          created_at?: string
          current_dimension?: number | null
          current_item?: number | null
          dimension_states?: Json | null
          end_time?: string | null
          fullscreen_exit_count?: number | null
          id?: string
          json_version: string
          pause_timestamp?: string | null
          paused?: boolean | null
          product_id?: string | null
          product_slug?: string | null
          scores?: Json
          security_consent_given?: boolean | null
          security_terminated?: boolean | null
          security_violations_count?: number | null
          start_time?: string
          test_duration_seconds?: number | null
          test_started?: boolean | null
          test_version?: string
          time_remaining?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          completed?: boolean
          consent_given?: boolean | null
          consent_timestamp?: string | null
          created_at?: string
          current_dimension?: number | null
          current_item?: number | null
          dimension_states?: Json | null
          end_time?: string | null
          fullscreen_exit_count?: number | null
          id?: string
          json_version?: string
          pause_timestamp?: string | null
          paused?: boolean | null
          product_id?: string | null
          product_slug?: string | null
          scores?: Json
          security_consent_given?: boolean | null
          security_terminated?: boolean | null
          security_violations_count?: number | null
          start_time?: string
          test_duration_seconds?: number | null
          test_started?: boolean | null
          test_version?: string
          time_remaining?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "assessment_products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      calculate_percentile: { Args: { user_score: number }; Returns: number }
      check_admin_constant_time: {
        Args: { _user_id: string }
        Returns: boolean
      }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
