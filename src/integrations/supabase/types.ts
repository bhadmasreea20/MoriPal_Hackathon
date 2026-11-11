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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          business_id: string
          created_at: string
          estimated_impact: string | null
          id: string
          recommendation_text: string
          related_scenario_id: string | null
          risk_level: string | null
          title: string
        }
        Insert: {
          business_id: string
          created_at?: string
          estimated_impact?: string | null
          id?: string
          recommendation_text: string
          related_scenario_id?: string | null
          risk_level?: string | null
          title: string
        }
        Update: {
          business_id?: string
          created_at?: string
          estimated_impact?: string | null
          id?: string
          recommendation_text?: string
          related_scenario_id?: string | null
          risk_level?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_recommendations_related_scenario_id_fkey"
            columns: ["related_scenario_id"]
            isOneToOne: false
            referencedRelation: "investment_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          annual_revenue: number | null
          available_capital: number | null
          created_at: string
          id: string
          industry: string | null
          location: string | null
          name: string
        }
        Insert: {
          annual_revenue?: number | null
          available_capital?: number | null
          created_at?: string
          id?: string
          industry?: string | null
          location?: string | null
          name: string
        }
        Update: {
          annual_revenue?: number | null
          available_capital?: number | null
          created_at?: string
          id?: string
          industry?: string | null
          location?: string | null
          name?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          business_id: string
          category: string
          created_at: string
          expense_date: string
          frequency: string | null
          id: string
          notes: string | null
          status: string | null
          vendor: string | null
        }
        Insert: {
          amount?: number
          business_id: string
          category: string
          created_at?: string
          expense_date?: string
          frequency?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          business_id?: string
          category?: string
          created_at?: string
          expense_date?: string
          frequency?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_scenarios: {
        Row: {
          business_id: string
          category: string | null
          created_at: string
          description: string | null
          expected_annual_benefit: number
          expected_roi: number | null
          id: string
          initial_cost: number
          investment_name: string
          payback_period: number | null
          risk_level: string | null
          status: string | null
        }
        Insert: {
          business_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          expected_annual_benefit?: number
          expected_roi?: number | null
          id?: string
          initial_cost?: number
          investment_name: string
          payback_period?: number | null
          risk_level?: string | null
          status?: string | null
        }
        Update: {
          business_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          expected_annual_benefit?: number
          expected_roi?: number | null
          id?: string
          initial_cost?: number
          investment_name?: string
          payback_period?: number | null
          risk_level?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_scenarios_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          business_id: string
          checkout_eligible: boolean
          created_at: string
          currency: string
          description: string | null
          id: string
          paid_at: string | null
          payment_provider: string | null
          payment_status: string | null
          paypal_order_id: string | null
          paypal_transaction_id: string | null
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          amount?: number
          business_id: string
          checkout_eligible?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          paid_at?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          paypal_order_id?: string | null
          paypal_transaction_id?: string | null
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          amount?: number
          business_id?: string
          checkout_eligible?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          paid_at?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          paypal_order_id?: string | null
          paypal_transaction_id?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
