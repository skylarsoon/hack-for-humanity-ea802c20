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
      blog_post_media: {
        Row: {
          caption_en: string
          caption_es: string
          position: number
          post_id: string
          update_id: string
        }
        Insert: {
          caption_en?: string
          caption_es?: string
          position?: number
          post_id: string
          update_id: string
        }
        Update: {
          caption_en?: string
          caption_es?: string
          position?: number
          post_id?: string
          update_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_media_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "field_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          body_en: string
          body_es: string
          created_at: string
          id: string
          period_end: string | null
          period_start: string | null
          published_at: string | null
          status: string
          title_en: string
          title_es: string
        }
        Insert: {
          body_en: string
          body_es: string
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          published_at?: string | null
          status?: string
          title_en: string
          title_es: string
        }
        Update: {
          body_en?: string
          body_es?: string
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          published_at?: string | null
          status?: string
          title_en?: string
          title_es?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          created_by: string | null
          doc_type: Database["public"]["Enums"]["doc_type"]
          extracted: Json
          id: string
          image_path: string | null
          transcription: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          doc_type: Database["public"]["Enums"]["doc_type"]
          extracted?: Json
          id?: string
          image_path?: string | null
          transcription?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          doc_type?: Database["public"]["Enums"]["doc_type"]
          extracted?: Json
          id?: string
          image_path?: string | null
          transcription?: string | null
        }
        Relationships: []
      }
      expense_households: {
        Row: {
          expense_id: string
          household_id: string
        }
        Insert: {
          expense_id: string
          household_id: string
        }
        Update: {
          expense_id?: string
          household_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_households_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_households_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_households_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "public_households"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_items: {
        Row: {
          category: Database["public"]["Enums"]["impact_category"]
          expense_id: string
          id: string
          item: string
          qty: number
          usd: number
        }
        Insert: {
          category: Database["public"]["Enums"]["impact_category"]
          expense_id: string
          id?: string
          item: string
          qty?: number
          usd?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["impact_category"]
          expense_id?: string
          id?: string
          item?: string
          qty?: number
          usd?: number
        }
        Relationships: [
          {
            foreignKeyName: "expense_items_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          cop: number
          created_at: string
          created_by: string | null
          date: string
          description: string
          document_id: string | null
          id: string
          method: Database["public"]["Enums"]["expense_method"]
          phase: number
          receipt: string
          source: string
          usd: number
          vendor: string
        }
        Insert: {
          cop?: number
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          document_id?: string | null
          id?: string
          method: Database["public"]["Enums"]["expense_method"]
          phase?: number
          receipt: string
          source?: string
          usd?: number
          vendor: string
        }
        Update: {
          cop?: number
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          document_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["expense_method"]
          phase?: number
          receipt?: string
          source?: string
          usd?: number
          vendor?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      field_senders: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          phone: string
          role: string
          vereda: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          phone: string
          role?: string
          vereda?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          phone?: string
          role?: string
          vereda?: string | null
        }
        Relationships: []
      }
      field_updates: {
        Row: {
          category: Database["public"]["Enums"]["impact_category"] | null
          created_at: string
          exclude_from_blog: boolean
          hidden: boolean
          household_id: string | null
          id: string
          kind: string
          media_id: string | null
          media_mime: string | null
          media_path: string | null
          media_status: string
          sender_id: string | null
          sender_phone: string
          sent_at: string
          text: string
          transcript: string | null
          used_in_post_id: string | null
          wa_message_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["impact_category"] | null
          created_at?: string
          exclude_from_blog?: boolean
          hidden?: boolean
          household_id?: string | null
          id?: string
          kind: string
          media_id?: string | null
          media_mime?: string | null
          media_path?: string | null
          media_status?: string
          sender_id?: string | null
          sender_phone: string
          sent_at?: string
          text?: string
          transcript?: string | null
          used_in_post_id?: string | null
          wa_message_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["impact_category"] | null
          created_at?: string
          exclude_from_blog?: boolean
          hidden?: boolean
          household_id?: string | null
          id?: string
          kind?: string
          media_id?: string | null
          media_mime?: string | null
          media_path?: string | null
          media_status?: string
          sender_id?: string | null
          sender_phone?: string
          sent_at?: string
          text?: string
          transcript?: string | null
          used_in_post_id?: string | null
          wa_message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_updates_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_updates_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "public_households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_updates_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "field_senders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_updates_used_in_post_id_fkey"
            columns: ["used_in_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      household_needs: {
        Row: {
          category: Database["public"]["Enums"]["impact_category"]
          created_at: string
          document_id: string | null
          household_id: string
          id: string
          item: string
          qty: number
          status: Database["public"]["Enums"]["need_status"]
          unit_usd: number
        }
        Insert: {
          category: Database["public"]["Enums"]["impact_category"]
          created_at?: string
          document_id?: string | null
          household_id: string
          id?: string
          item: string
          qty?: number
          status?: Database["public"]["Enums"]["need_status"]
          unit_usd?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["impact_category"]
          created_at?: string
          document_id?: string | null
          household_id?: string
          id?: string
          item?: string
          qty?: number
          status?: Database["public"]["Enums"]["need_status"]
          unit_usd?: number
        }
        Relationships: [
          {
            foreignKeyName: "household_needs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_needs_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_needs_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "public_households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          community: string
          cost_usd: number
          id: string
          lat: number | null
          lng: number | null
          members: number
          name: string | null
          note: string | null
          phase: number
          status: Database["public"]["Enums"]["household_status"]
          vereda: string
        }
        Insert: {
          community: string
          cost_usd?: number
          id: string
          lat?: number | null
          lng?: number | null
          members?: number
          name?: string | null
          note?: string | null
          phase?: number
          status?: Database["public"]["Enums"]["household_status"]
          vereda: string
        }
        Update: {
          community?: string
          cost_usd?: number
          id?: string
          lat?: number | null
          lng?: number | null
          members?: number
          name?: string | null
          note?: string | null
          phase?: number
          status?: Database["public"]["Enums"]["household_status"]
          vereda?: string
        }
        Relationships: []
      }
      job_state: {
        Row: {
          last_run_at: string | null
          locked_until: string | null
          name: string
          paused_reason: string | null
        }
        Insert: {
          last_run_at?: string | null
          locked_until?: string | null
          name: string
          paused_reason?: string | null
        }
        Update: {
          last_run_at?: string | null
          locked_until?: string | null
          name?: string
          paused_reason?: string | null
        }
        Relationships: []
      }
      whatsapp_webhook_events: {
        Row: {
          attempts: number
          delivery_id: string
          event: string
          id: string
          payload: Json
          processed_at: string | null
          processing_error: string | null
          received_at: string
        }
        Insert: {
          attempts?: number
          delivery_id: string
          event: string
          id?: string
          payload: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Update: {
          attempts?: number
          delivery_id?: string
          event?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      category_totals: {
        Row: {
          category: Database["public"]["Enums"]["impact_category"] | null
          needed_usd: number | null
          spent_usd: number | null
        }
        Relationships: []
      }
      public_households: {
        Row: {
          community: string | null
          cost_usd: number | null
          id: string | null
          members: number | null
          phase: number | null
          status: Database["public"]["Enums"]["household_status"] | null
          vereda: string | null
        }
        Insert: {
          community?: string | null
          cost_usd?: number | null
          id?: string | null
          members?: number | null
          phase?: number | null
          status?: Database["public"]["Enums"]["household_status"] | null
          vereda?: string | null
        }
        Update: {
          community?: string | null
          cost_usd?: number | null
          id?: string | null
          members?: number | null
          phase?: number | null
          status?: Database["public"]["Enums"]["household_status"] | null
          vereda?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      acquire_job_lock: {
        Args: { p_name: string; p_seconds: number }
        Returns: boolean
      }
      approve_census: {
        Args: { p_document_id: string; p_household_id: string; p_items: Json }
        Returns: number
      }
      approve_expense: {
        Args: {
          p_cop: number
          p_date: string
          p_document_id: string
          p_household_id: string
          p_items: Json
          p_method: Database["public"]["Enums"]["expense_method"]
          p_phase: number
          p_receipt: string
          p_usd: number
          p_vendor: string
        }
        Returns: string
      }
    }
    Enums: {
      doc_type: "CENSUS_FORM" | "SIGNED_ACTA" | "HARDWARE_RECEIPT"
      expense_method: "Factura" | "Nequi" | "Efectivo + Acta"
      household_status: "needs" | "progress" | "delivered"
      impact_category: "roof" | "water" | "energy" | "rebuild" | "heal"
      need_status: "open" | "delivered"
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
    Enums: {
      doc_type: ["CENSUS_FORM", "SIGNED_ACTA", "HARDWARE_RECEIPT"],
      expense_method: ["Factura", "Nequi", "Efectivo + Acta"],
      household_status: ["needs", "progress", "delivered"],
      impact_category: ["roof", "water", "energy", "rebuild", "heal"],
      need_status: ["open", "delivered"],
    },
  },
} as const
