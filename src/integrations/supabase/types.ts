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
      agencies: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string | null
          phone: string | null
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_predictions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          item_id: string | null
          prediction_data: Json
          prediction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          item_id?: string | null
          prediction_data: Json
          prediction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          item_id?: string | null
          prediction_data?: Json
          prediction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_settings: {
        Row: {
          accent_color: string | null
          agency_id: string | null
          button_style: string | null
          client_portal_config: Json | null
          company_name: string
          created_at: string
          custom_css: string | null
          custom_domain: string | null
          email_footer_text: string | null
          email_header_logo_url: string | null
          enabled_features: Json | null
          favicon_url: string | null
          footer_text: string | null
          hide_powered_by: boolean | null
          id: string
          integrations: Json | null
          is_published: boolean | null
          login_background_url: string | null
          login_tagline: string | null
          logo_url: string | null
          notification_settings: Json | null
          primary_color: string | null
          privacy_url: string | null
          published_at: string | null
          secondary_color: string | null
          sidebar_style: string | null
          subdomain: string | null
          subscription_features: Json | null
          support_email: string | null
          support_phone: string | null
          terms_url: string | null
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          accent_color?: string | null
          agency_id?: string | null
          button_style?: string | null
          client_portal_config?: Json | null
          company_name?: string
          created_at?: string
          custom_css?: string | null
          custom_domain?: string | null
          email_footer_text?: string | null
          email_header_logo_url?: string | null
          enabled_features?: Json | null
          favicon_url?: string | null
          footer_text?: string | null
          hide_powered_by?: boolean | null
          id?: string
          integrations?: Json | null
          is_published?: boolean | null
          login_background_url?: string | null
          login_tagline?: string | null
          logo_url?: string | null
          notification_settings?: Json | null
          primary_color?: string | null
          privacy_url?: string | null
          published_at?: string | null
          secondary_color?: string | null
          sidebar_style?: string | null
          subdomain?: string | null
          subscription_features?: Json | null
          support_email?: string | null
          support_phone?: string | null
          terms_url?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          accent_color?: string | null
          agency_id?: string | null
          button_style?: string | null
          client_portal_config?: Json | null
          company_name?: string
          created_at?: string
          custom_css?: string | null
          custom_domain?: string | null
          email_footer_text?: string | null
          email_header_logo_url?: string | null
          enabled_features?: Json | null
          favicon_url?: string | null
          footer_text?: string | null
          hide_powered_by?: boolean | null
          id?: string
          integrations?: Json | null
          is_published?: boolean | null
          login_background_url?: string | null
          login_tagline?: string | null
          logo_url?: string | null
          notification_settings?: Json | null
          primary_color?: string | null
          privacy_url?: string | null
          published_at?: string | null
          secondary_color?: string | null
          sidebar_style?: string | null
          subdomain?: string | null
          subscription_features?: Json | null
          support_email?: string | null
          support_phone?: string | null
          terms_url?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_settings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: true
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      bureau_patterns: {
        Row: {
          bureau: Database["public"]["Enums"]["bureau_type"]
          created_at: string
          id: string
          last_updated: string
          pattern_data: Json
          pattern_type: string
          sample_size: number | null
          success_rate: number | null
        }
        Insert: {
          bureau: Database["public"]["Enums"]["bureau_type"]
          created_at?: string
          id?: string
          last_updated?: string
          pattern_data: Json
          pattern_type: string
          sample_size?: number | null
          success_rate?: number | null
        }
        Update: {
          bureau?: Database["public"]["Enums"]["bureau_type"]
          created_at?: string
          id?: string
          last_updated?: string
          pattern_data?: Json
          pattern_type?: string
          sample_size?: number | null
          success_rate?: number | null
        }
        Relationships: []
      }
      bureau_responses: {
        Row: {
          ai_analysis: Json | null
          bureau: string
          created_at: string
          dispute_item_id: string | null
          file_path: string | null
          id: string
          outcome: string | null
          response_content: string | null
          response_date: string
          response_type: string
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          bureau: string
          created_at?: string
          dispute_item_id?: string | null
          file_path?: string | null
          id?: string
          outcome?: string | null
          response_content?: string | null
          response_date?: string
          response_type: string
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          bureau?: string
          created_at?: string
          dispute_item_id?: string | null
          file_path?: string | null
          id?: string
          outcome?: string | null
          response_content?: string | null
          response_date?: string
          response_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bureau_responses_dispute_item_id_fkey"
            columns: ["dispute_item_id"]
            isOneToOne: false
            referencedRelation: "dispute_items"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          created_at: string
          document_type: string
          file_path: string
          file_type: string
          id: string
          name: string
          size_bytes: number
          status: string
          uploaded_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_path: string
          file_type: string
          id?: string
          name: string
          size_bytes: number
          status?: string
          uploaded_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_path?: string
          file_type?: string
          id?: string
          name?: string
          size_bytes?: number
          status?: string
          uploaded_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      client_goals: {
        Row: {
          ai_roadmap: Json | null
          created_at: string
          current_score: number | null
          goal_type: string
          id: string
          target_date: string | null
          target_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_roadmap?: Json | null
          created_at?: string
          current_score?: number | null
          goal_type?: string
          id?: string
          target_date?: string | null
          target_score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_roadmap?: Json | null
          created_at?: string
          current_score?: number | null
          goal_type?: string
          id?: string
          target_date?: string | null
          target_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      compliance_logs: {
        Row: {
          action_type: string
          agency_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          agency_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          agency_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_logs_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_report_analyses: {
        Row: {
          analysis_result: Json | null
          created_at: string
          disputable_items: Json | null
          file_path: string | null
          id: string
          raw_text: string | null
          summary: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string
          disputable_items?: Json | null
          file_path?: string | null
          id?: string
          raw_text?: string | null
          summary?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string
          disputable_items?: Json | null
          file_path?: string | null
          id?: string
          raw_text?: string | null
          summary?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dispute_items: {
        Row: {
          account_number: string | null
          bureau: Database["public"]["Enums"]["bureau_type"]
          client_id: string
          created_at: string
          creditor_name: string
          dispute_reason: string
          id: string
          letter_content: string | null
          letter_type: string
          outcome: Database["public"]["Enums"]["dispute_status"]
          outcome_details: Json | null
          response_received_at: string | null
          round_id: string
          sent_at: string | null
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          bureau: Database["public"]["Enums"]["bureau_type"]
          client_id: string
          created_at?: string
          creditor_name: string
          dispute_reason: string
          id?: string
          letter_content?: string | null
          letter_type: string
          outcome?: Database["public"]["Enums"]["dispute_status"]
          outcome_details?: Json | null
          response_received_at?: string | null
          round_id: string
          sent_at?: string | null
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          bureau?: Database["public"]["Enums"]["bureau_type"]
          client_id?: string
          created_at?: string
          creditor_name?: string
          dispute_reason?: string
          id?: string
          letter_content?: string | null
          letter_type?: string
          outcome?: Database["public"]["Enums"]["dispute_status"]
          outcome_details?: Json | null
          response_received_at?: string | null
          round_id?: string
          sent_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_items_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "dispute_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_letters: {
        Row: {
          created_at: string
          dispute_item_id: string | null
          id: string
          letter_content: string
          letter_type: string
          sent_at: string | null
          status: string
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dispute_item_id?: string | null
          id?: string
          letter_content: string
          letter_type: string
          sent_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dispute_item_id?: string | null
          id?: string
          letter_content?: string
          letter_type?: string
          sent_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_letters_dispute_item_id_fkey"
            columns: ["dispute_item_id"]
            isOneToOne: false
            referencedRelation: "dispute_items"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_rounds: {
        Row: {
          ai_recommendations: Json | null
          client_id: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          round_number: number
          started_at: string
          status: Database["public"]["Enums"]["dispute_status"]
          updated_at: string
        }
        Insert: {
          ai_recommendations?: Json | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          round_number?: number
          started_at?: string
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
        }
        Update: {
          ai_recommendations?: Json | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          round_number?: number
          started_at?: string
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          agency_id: string | null
          amount: number
          client_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          paid_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          amount: number
          client_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          paid_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          amount?: number
          client_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          paid_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          read: boolean
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      outcome_tracking: {
        Row: {
          bureau: Database["public"]["Enums"]["bureau_type"]
          created_at: string
          creditor_name: string | null
          days_to_response: number | null
          dispute_item_id: string | null
          dispute_reason: string
          id: string
          letter_type: string
          outcome: Database["public"]["Enums"]["dispute_status"]
          success_factors: Json | null
        }
        Insert: {
          bureau: Database["public"]["Enums"]["bureau_type"]
          created_at?: string
          creditor_name?: string | null
          days_to_response?: number | null
          dispute_item_id?: string | null
          dispute_reason: string
          id?: string
          letter_type: string
          outcome: Database["public"]["Enums"]["dispute_status"]
          success_factors?: Json | null
        }
        Update: {
          bureau?: Database["public"]["Enums"]["bureau_type"]
          created_at?: string
          creditor_name?: string | null
          days_to_response?: number | null
          dispute_item_id?: string | null
          dispute_reason?: string
          id?: string
          letter_type?: string
          outcome?: Database["public"]["Enums"]["dispute_status"]
          success_factors?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "outcome_tracking_dispute_item_id_fkey"
            columns: ["dispute_item_id"]
            isOneToOne: false
            referencedRelation: "dispute_items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agency_id: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agency_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_agency"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      score_history: {
        Row: {
          equifax: number | null
          experian: number | null
          id: string
          recorded_at: string
          source: string | null
          transunion: number | null
          user_id: string
        }
        Insert: {
          equifax?: number | null
          experian?: number | null
          id?: string
          recorded_at?: string
          source?: string | null
          transunion?: number | null
          user_id: string
        }
        Update: {
          equifax?: number | null
          experian?: number | null
          id?: string
          recorded_at?: string
          source?: string | null
          transunion?: number | null
          user_id?: string
        }
        Relationships: []
      }
      smartcredit_connections: {
        Row: {
          access_token_encrypted: string | null
          connected_at: string | null
          connection_status: string | null
          created_at: string
          id: string
          last_sync_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          connected_at?: string | null
          connection_status?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          connected_at?: string | null
          connection_status?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          agency_id: string | null
          ai_generated: boolean | null
          assigned_to: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          related_dispute_id: string | null
          related_letter_id: string | null
          status: string
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          ai_generated?: boolean | null
          assigned_to?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          related_dispute_id?: string | null
          related_letter_id?: string | null
          status?: string
          task_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          ai_generated?: boolean | null
          assigned_to?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          related_dispute_id?: string | null
          related_letter_id?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_dispute_id_fkey"
            columns: ["related_dispute_id"]
            isOneToOne: false
            referencedRelation: "dispute_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_letter_id_fkey"
            columns: ["related_letter_id"]
            isOneToOne: false
            referencedRelation: "dispute_letters"
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
          role: Database["public"]["Enums"]["app_role"]
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
      va_assignments: {
        Row: {
          agency_id: string
          assigned_at: string
          client_user_id: string
          id: string
          va_user_id: string
        }
        Insert: {
          agency_id: string
          assigned_at?: string
          client_user_id: string
          id?: string
          va_user_id: string
        }
        Update: {
          agency_id?: string
          assigned_at?: string
          client_user_id?: string
          id?: string
          va_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "va_assignments_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_brand_settings_by_subdomain: {
        Args: { p_subdomain: string }
        Returns: {
          accent_color: string
          button_style: string
          client_portal_config: Json
          company_name: string
          enabled_features: Json
          favicon_url: string
          footer_text: string
          hide_powered_by: boolean
          id: string
          login_background_url: string
          login_tagline: string
          logo_url: string
          primary_color: string
          privacy_url: string
          secondary_color: string
          support_email: string
          support_phone: string
          terms_url: string
          welcome_message: string
        }[]
      }
      get_user_agency_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "client" | "agency_owner" | "va_staff"
      bureau_type: "experian" | "equifax" | "transunion"
      dispute_status:
        | "pending"
        | "in_progress"
        | "responded"
        | "verified"
        | "deleted"
        | "updated"
        | "failed"
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
      app_role: ["client", "agency_owner", "va_staff"],
      bureau_type: ["experian", "equifax", "transunion"],
      dispute_status: [
        "pending",
        "in_progress",
        "responded",
        "verified",
        "deleted",
        "updated",
        "failed",
      ],
    },
  },
} as const
