"use server"

import { revalidatePath } from "next/cache"
import { Pool } from "pg"

// Use direct PostgreSQL connection for server actions
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export interface Appointment {
  id: string
  petId: string
  petName: string
  petType: string
  petBreed: string
  ownerId: string
  ownerName: string
  ownerPhone: string
  doctorId?: string
  doctorName?: string
  type: string
  date: string
  time: string
  duration: number
  status: string
  clinicId: string
  clinicName: string
  notes?: string
  symptoms?: string
  createdAt: string
  updatedAt: string
}

export async function getAllAppointments(): Promise<Appointment[]> {
  try {
    const query = `
      SELECT 
        a.id,
        a.pet_id as "petId",
        pt.name as "petName",
        pt.species as "petType",
        pt.breed as "petBreed",
        a.patient_id as "ownerId",
        p.name as "ownerName",
        p.phone as "ownerPhone",
        a.provider_id as "doctorId",
        CASE 
          WHEN a.provider_id IS NULL THEN 'Dr. Unknown'
          ELSE CAST(a.provider_id AS TEXT)
        END as "doctorName",
        a.appointment_type as type,
        a.appointment_date::date as date,
        a.appointment_date::time as time,
        COALESCE(a.duration, 30) as duration,
        a.status,
        a.clinic_id as "clinicId",
        'Vetnefits Animal Hospital' as "clinicName",
        a.notes,
        a.reason as symptoms,
        a.created_at as "createdAt",
        a.updated_at as "updatedAt"
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN pets pt ON a.pet_id = pt.id
      WHERE a.clinic_id = $1
      ORDER BY a.appointment_date ASC
    `

    const client = await pool.connect()
    try {
      const result = await client.query(query, ["ff4a1430-f7df-49b8-99bf-2240faa8d622"])
      return result.rows
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error in getAllAppointments:", error)
    return []
  }
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  try {
    const query = `
      SELECT 
        a.id,
        a.pet_id as "petId",
        pt.name as "petName",
        pt.species as "petType",
        pt.breed as "petBreed",
        a.patient_id as "ownerId",
        p.name as "ownerName",
        p.phone as "ownerPhone",
        a.provider_id as "doctorId",
        CASE 
          WHEN a.provider_id IS NULL THEN 'Dr. Unknown'
          ELSE CAST(a.provider_id AS TEXT)
        END as "doctorName",
        a.appointment_type as type,
        a.appointment_date::date as date,
        a.appointment_date::time as time,
        COALESCE(a.duration, 30) as duration,
        a.status,
        a.clinic_id as "clinicId",
        'Vetnefits Animal Hospital' as "clinicName",
        a.notes,
        a.reason as symptoms,
        a.created_at as "createdAt",
        a.updated_at as "updatedAt"
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN pets pt ON a.pet_id = pt.id
      WHERE a.id = $1 AND a.clinic_id = $2
    `

    const client = await pool.connect()
    try {
      const result = await client.query(query, [id, "ff4a1430-f7df-49b8-99bf-2240faa8d622"])
      return result.rows[0] || null
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error in getAppointmentById:", error)
    return null
  }
}

export async function createAppointment(appointmentData: any) {
  try {
    const query = `
      INSERT INTO appointments (
        clinic_id, patient_id, pet_id, appointment_date, 
        appointment_type, reason, status, notes, duration
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `

    const client = await pool.connect()
    try {
      const result = await client.query(query, [
        "ff4a1430-f7df-49b8-99bf-2240faa8d622",
        appointmentData.patientId,
        appointmentData.petId,
        appointmentData.datetime,
        appointmentData.type,
        appointmentData.reason,
        'scheduled',
        appointmentData.notes || null,
        appointmentData.duration || 30
      ])
      
      revalidatePath('/appointments')
      return { success: true, id: result.rows[0].id }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error in createAppointment:", error)
    throw new Error("Failed to create appointment")
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  try {
    const query = `
      UPDATE appointments 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND clinic_id = $3
      RETURNING id
    `

    const client = await pool.connect()
    try {
      const result = await client.query(query, [
        status,
        id,
        "ff4a1430-f7df-49b8-99bf-2240faa8d622"
      ])
      
      if (result.rows.length === 0) {
        throw new Error("Appointment not found")
      }
      
      revalidatePath('/appointments')
      return { success: true }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error in updateAppointmentStatus:", error)
    throw new Error("Failed to update appointment")
  }
}