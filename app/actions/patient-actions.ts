"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export interface Patient {
  id: string
  name: string
  species: string
  breed?: string
  age?: number
  gender?: string
  weight?: number
  color?: string
  microchip_id?: string
  owner_name: string
  owner_phone?: string
  owner_email?: string
  owner_address?: string
  emergency_contact?: string
  emergency_phone?: string
  insurance_provider?: string
  insurance_policy?: string
  allergies?: string
  medical_conditions?: string
  current_medications?: string
  photo_url?: string
  created_at?: string
  updated_at?: string
}

export interface SOAPNote {
  id: string
  patient_id: string
  date: string
  time: string
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  doctor_name?: string
  created_at?: string
  updated_at?: string
}

export async function getPatient(id: string): Promise<Patient | null> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.from("patients").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching patient:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getPatient:", error)
    return null
  }
}

export async function getAllPatients(): Promise<Patient[]> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.from("patients").select("*").order("name")

    if (error) {
      console.error("Error fetching patients:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllPatients:", error)
    return []
  }
}

export async function updatePatient(id: string, updates: Partial<Patient>) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("patients")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating patient:", error)
      throw new Error("Failed to update patient")
    }

    revalidatePath(`/patients/${id}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error in updatePatient:", error)
    throw error
  }
}

export async function getPatientSOAPNotes(patientId: string): Promise<SOAPNote[]> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("soap_notes")
      .select("*")
      .eq("patient_id", patientId)
      .order("date", { ascending: false })
      .order("time", { ascending: false })

    if (error) {
      console.error("Error fetching SOAP notes:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getPatientSOAPNotes:", error)
    return []
  }
}

export async function createSOAPNote(soapNote: Omit<SOAPNote, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.from("soap_notes").insert([soapNote]).select().single()

    if (error) {
      console.error("Error creating SOAP note:", error)
      throw new Error("Failed to create SOAP note")
    }

    revalidatePath(`/patients/${soapNote.patient_id}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error in createSOAPNote:", error)
    throw error
  }
}

export async function updateSOAPNote(id: string, updates: Partial<SOAPNote>) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("soap_notes")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating SOAP note:", error)
      throw new Error("Failed to update SOAP note")
    }

    revalidatePath(`/patients/${data.patient_id}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error in updateSOAPNote:", error)
    throw error
  }
}

export async function deleteSOAPNote(id: string, patientId: string) {
  try {
    const supabase = createServerClient()
    const { error } = await supabase.from("soap_notes").delete().eq("id", id)

    if (error) {
      console.error("Error deleting SOAP note:", error)
      throw new Error("Failed to delete SOAP note")
    }

    revalidatePath(`/patients/${patientId}`)
    return { success: true }
  } catch (error) {
    console.error("Error in deleteSOAPNote:", error)
    throw error
  }
}
