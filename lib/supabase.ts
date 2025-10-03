import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface ClinicSettings {
  id: string
  clinic_id: string
  clinic_name: string
  clinic_email: string
  clinic_phone: string
  clinic_address: string
  clinic_logo: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      clinic_settings: {
        Row: ClinicSettings
        Insert: Omit<ClinicSettings, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<ClinicSettings, "id" | "created_at">>
      }
      clinics: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          email: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          email: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          email?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          name: string
          species: string
          breed: string
          age: number
          owner_name: string
          owner_phone: string
          owner_email: string
          clinic_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          species: string
          breed: string
          age: number
          owner_name: string
          owner_phone: string
          owner_email: string
          clinic_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          species?: string
          breed?: string
          age?: number
          owner_name?: string
          owner_phone?: string
          owner_email?: string
          clinic_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
