export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          license_key: string | null
          license_tier: 'free' | 'starter' | 'pro' | 'agency'
          license_status: string | null
          limits_forms: number
          limits_submissions: number
          storage_used: number
          brand_color: string | null
          logo_url: string | null
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          license_key?: string | null
          license_tier?: 'free' | 'starter' | 'pro' | 'agency'
          license_status?: string | null
          limits_forms?: number
          limits_submissions?: number
          storage_used?: number
          brand_color?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          license_key?: string | null
          license_tier?: 'free' | 'starter' | 'pro' | 'agency'
          license_status?: string | null
          limits_forms?: number
          limits_submissions?: number
          storage_used?: number
          brand_color?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
      }
      forms: {
        Row: {
          id: string
          organization_id: string
          title: string
          description: string | null
          content: Json
          is_published: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          description?: string | null
          content?: Json
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          title?: string
          description?: string | null
          content?: Json
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      form_submissions: {
        Row: {
          id: string
          created_at: string
          form_id: string
          content: string
          signature_url: string | null
          location: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          form_id: string
          content: string
          signature_url?: string | null
          location?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          form_id?: string
          content?: string
          signature_url?: string | null
          location?: Json | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string
          actor_id: string
          action: string
          target_resource: string
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          actor_id: string
          action: string
          target_resource: string
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          actor_id?: string
          action?: string
          target_resource?: string
          details?: Json
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          first_name: string | null
          last_name: string | null
          mobile: string | null
          created_at?: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          mobile?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          mobile?: string | null
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          organization_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          created_at?: string
        }
      }
      form_assignments: {
        Row: {
          id: string
          form_id: string
          user_id: string
          status: 'pending' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          form_id: string
          user_id: string
          status?: 'pending' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          user_id?: string
          status?: 'pending' | 'completed'
          created_at?: string
        }
      }
    }
  }
}
