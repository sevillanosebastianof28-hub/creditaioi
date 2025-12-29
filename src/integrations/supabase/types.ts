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
