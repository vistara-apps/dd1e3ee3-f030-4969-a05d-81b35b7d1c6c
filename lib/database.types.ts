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
      users: {
        Row: {
          user_id: string
          wallet_address: string
          subscription_status: 'free' | 'premium' | 'lifetime'
          preferred_language: 'en' | 'es'
          trusted_contacts: Json[]
          selected_state: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          wallet_address: string
          subscription_status?: 'free' | 'premium' | 'lifetime'
          preferred_language?: 'en' | 'es'
          trusted_contacts?: Json[]
          selected_state?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          wallet_address?: string
          subscription_status?: 'free' | 'premium' | 'lifetime'
          preferred_language?: 'en' | 'es'
          trusted_contacts?: Json[]
          selected_state?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      guides: {
        Row: {
          guide_id: string
          state: string
          language: 'en' | 'es'
          content: Json
          type: 'basic' | 'premium'
          last_updated: string
          created_at: string
        }
        Insert: {
          guide_id: string
          state: string
          language: 'en' | 'es'
          content: Json
          type: 'basic' | 'premium'
          last_updated: string
          created_at?: string
        }
        Update: {
          guide_id?: string
          state?: string
          language?: 'en' | 'es'
          content?: Json
          type?: 'basic' | 'premium'
          last_updated?: string
          created_at?: string
        }
      }
      scripts: {
        Row: {
          script_id: string
          scenario: string
          language: 'en' | 'es'
          content: Json
          state_applicability: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          script_id: string
          scenario: string
          language: 'en' | 'es'
          content: Json
          state_applicability: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          script_id?: string
          scenario?: string
          language?: 'en' | 'es'
          content?: Json
          state_applicability?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      incidents: {
        Row: {
          incident_id: string
          user_id: string
          timestamp: string
          location: Json
          recording_url: string | null
          summary: string
          shared_status: 'private' | 'shared_contacts' | 'shared_legal'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          incident_id: string
          user_id: string
          timestamp: string
          location: Json
          recording_url?: string | null
          summary: string
          shared_status?: 'private' | 'shared_contacts' | 'shared_legal'
          metadata: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          incident_id?: string
          user_id?: string
          timestamp?: string
          location?: Json
          recording_url?: string | null
          summary?: string
          shared_status?: 'private' | 'shared_contacts' | 'shared_legal'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: 'active' | 'canceled' | 'past_due' | 'unpaid'
          plan_type: 'monthly' | 'lifetime'
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status: 'active' | 'canceled' | 'past_due' | 'unpaid'
          plan_type: 'monthly' | 'lifetime'
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid'
          plan_type?: 'monthly' | 'lifetime'
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
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
