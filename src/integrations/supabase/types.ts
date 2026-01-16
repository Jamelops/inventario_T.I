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
      asset_categories: {
        Row: {
          created_at: string
          created_by: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          categoria: Database["public"]["Enums"]["asset_category"]
          created_at: string
          created_by: string | null
          data_compra: string
          descricao: string | null
          especificacoes: Json | null
          fornecedor: string | null
          id: string
          legacy_id: string | null
          localizacao: string
          nome: string
          numero_serie: string
          responsavel: string
          responsavel_id: string | null
          status: Database["public"]["Enums"]["asset_status"]
          tags: string[] | null
          updated_at: string
          valor: number
        }
        Insert: {
          categoria: Database["public"]["Enums"]["asset_category"]
          created_at?: string
          created_by?: string | null
          data_compra: string
          descricao?: string | null
          especificacoes?: Json | null
          fornecedor?: string | null
          id?: string
          legacy_id?: string | null
          localizacao: string
          nome: string
          numero_serie: string
          responsavel: string
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          tags?: string[] | null
          updated_at?: string
          valor?: number
        }
        Update: {
          categoria?: Database["public"]["Enums"]["asset_category"]
          created_at?: string
          created_by?: string | null
          data_compra?: string
          descricao?: string | null
          especificacoes?: Json | null
          fornecedor?: string | null
          id?: string
          legacy_id?: string | null
          localizacao?: string
          nome?: string
          numero_serie?: string
          responsavel?: string
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          tags?: string[] | null
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      licenses: {
        Row: {
          chave: string | null
          created_at: string
          created_by: string | null
          data_vencimento: string
          fornecedor: string | null
          id: string
          legacy_id: string | null
          nome: string
          notas: string | null
          quantidade_total: number
          quantidade_usada: number
          status: Database["public"]["Enums"]["license_status"]
          tipo: Database["public"]["Enums"]["license_type"]
          updated_at: string
        }
        Insert: {
          chave?: string | null
          created_at?: string
          created_by?: string | null
          data_vencimento: string
          fornecedor?: string | null
          id?: string
          legacy_id?: string | null
          nome: string
          notas?: string | null
          quantidade_total?: number
          quantidade_usada?: number
          status?: Database["public"]["Enums"]["license_status"]
          tipo: Database["public"]["Enums"]["license_type"]
          updated_at?: string
        }
        Update: {
          chave?: string | null
          created_at?: string
          created_by?: string | null
          data_vencimento?: string
          fornecedor?: string | null
          id?: string
          legacy_id?: string | null
          nome?: string
          notas?: string | null
          quantidade_total?: number
          quantidade_usada?: number
          status?: Database["public"]["Enums"]["license_status"]
          tipo?: Database["public"]["Enums"]["license_type"]
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_tasks: {
        Row: {
          asset_id: string
          asset_name: string
          completion_date: string | null
          created_at: string
          created_by: string | null
          description: string
          equipment_situation: string | null
          id: string
          last_reminder_sent: string | null
          maintenance_location: string | null
          notes: string | null
          observation: string | null
          priority: string
          responsible: string
          responsible_email: string | null
          responsible_id: string | null
          scheduled_date: string
          status: string
          updated_at: string
        }
        Insert: {
          asset_id: string
          asset_name: string
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          equipment_situation?: string | null
          id?: string
          last_reminder_sent?: string | null
          maintenance_location?: string | null
          notes?: string | null
          observation?: string | null
          priority: string
          responsible: string
          responsible_email?: string | null
          responsible_id?: string | null
          scheduled_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          asset_id?: string
          asset_name?: string
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          equipment_situation?: string | null
          id?: string
          last_reminder_sent?: string | null
          maintenance_location?: string | null
          notes?: string | null
          observation?: string | null
          priority?: string
          responsible?: string
          responsible_email?: string | null
          responsible_id?: string | null
          scheduled_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          status: string
          updated_at: string
          user_id: string | null
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      ticket_interactions: {
        Row: {
          created_at: string
          id: string
          message: string
          ticket_id: string
          type: Database["public"]["Enums"]["ticket_interaction_type"]
          user_id: string | null
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          ticket_id: string
          type: Database["public"]["Enums"]["ticket_interaction_type"]
          user_id?: string | null
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          ticket_id?: string
          type?: Database["public"]["Enums"]["ticket_interaction_type"]
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_interactions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_suppliers: {
        Row: {
          ativo: boolean
          categoria: Database["public"]["Enums"]["supplier_category"]
          created_at: string
          created_by: string | null
          id: string
          nome: string
          sla_horas: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria: Database["public"]["Enums"]["supplier_category"]
          created_at?: string
          created_by?: string | null
          id?: string
          nome: string
          sla_horas?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: Database["public"]["Enums"]["supplier_category"]
          created_at?: string
          created_by?: string | null
          id?: string
          nome?: string
          sla_horas?: number
          updated_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          asset_id: string | null
          asset_nome: string | null
          contato_fornecedor: Json | null
          created_at: string
          created_by: string | null
          data_resolucao: string | null
          descricao: string
          fornecedor_id: string | null
          id: string
          prioridade: Database["public"]["Enums"]["ticket_priority"]
          protocolo_externo: string | null
          responsavel_id: string | null
          responsavel_nome: string
          sla_deadline: string
          status: Database["public"]["Enums"]["ticket_status"]
          tipo: Database["public"]["Enums"]["ticket_type"]
          titulo: string
          unidade: string
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          asset_nome?: string | null
          contato_fornecedor?: Json | null
          created_at?: string
          created_by?: string | null
          data_resolucao?: string | null
          descricao: string
          fornecedor_id?: string | null
          id?: string
          prioridade?: Database["public"]["Enums"]["ticket_priority"]
          protocolo_externo?: string | null
          responsavel_id?: string | null
          responsavel_nome: string
          sla_deadline: string
          status?: Database["public"]["Enums"]["ticket_status"]
          tipo: Database["public"]["Enums"]["ticket_type"]
          titulo: string
          unidade: string
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          asset_nome?: string | null
          contato_fornecedor?: Json | null
          created_at?: string
          created_by?: string | null
          data_resolucao?: string | null
          descricao?: string
          fornecedor_id?: string | null
          id?: string
          prioridade?: Database["public"]["Enums"]["ticket_priority"]
          protocolo_externo?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string
          sla_deadline?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          tipo?: Database["public"]["Enums"]["ticket_type"]
          titulo?: string
          unidade?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "ticket_suppliers"
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
      get_all_usernames: {
        Args: never
        Returns: {
          id: string
          user_id: string
          username: string
        }[]
      }
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
      is_user_approved: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "manager" | "viewer"
      asset_category:
        | "notebook"
        | "desktop"
        | "servidor"
        | "monitor"
        | "impressora"
        | "rede"
        | "periferico"
        | "outros"
      asset_status: "ativo" | "inativo" | "manutencao" | "arquivado"
      license_status: "ativa" | "vencendo" | "vencida" | "cancelada"
      license_type: "perpetua" | "assinatura" | "volume" | "oem"
      supplier_category: "operadora" | "prodata" | "fornecedor_ti" | "outro"
      ticket_interaction_type:
        | "comentario"
        | "ligacao"
        | "email"
        | "retorno_fornecedor"
        | "mudanca_status"
      ticket_priority: "baixa" | "media" | "alta" | "critica"
      ticket_status:
        | "aberto"
        | "em_andamento"
        | "aguardando_terceiro"
        | "resolvido"
        | "encerrado"
      ticket_type:
        | "internet_fora"
        | "link_intermitente"
        | "sistema_prodata_fora"
        | "validador_travando"
        | "hardware"
        | "software"
        | "outro"
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
      app_role: ["admin", "manager", "viewer"],
      asset_category: [
        "notebook",
        "desktop",
        "servidor",
        "monitor",
        "impressora",
        "rede",
        "periferico",
        "outros",
      ],
      asset_status: ["ativo", "inativo", "manutencao", "arquivado"],
      license_status: ["ativa", "vencendo", "vencida", "cancelada"],
      license_type: ["perpetua", "assinatura", "volume", "oem"],
      supplier_category: ["operadora", "prodata", "fornecedor_ti", "outro"],
      ticket_interaction_type: [
        "comentario",
        "ligacao",
        "email",
        "retorno_fornecedor",
        "mudanca_status",
      ],
      ticket_priority: ["baixa", "media", "alta", "critica"],
      ticket_status: [
        "aberto",
        "em_andamento",
        "aguardando_terceiro",
        "resolvido",
        "encerrado",
      ],
      ticket_type: [
        "internet_fora",
        "link_intermitente",
        "sistema_prodata_fora",
        "validador_travando",
        "hardware",
        "software",
        "outro",
      ],
    },
  },
} as const
