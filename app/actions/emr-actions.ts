"use server"

import { Pool } from "pg"
import { revalidatePath } from "next/cache"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export interface EMRRecord {
  id: string
  patient_id: string
  pet_id: string
  appointment_id?: string
  visit_date: string
  visit_type: string
  chief_complaint: string
  // SOAP Notes
  subjective: string
  objective: string
  assessment: string
  plan: string
  // Vital Signs
  temperature?: number
  weight?: number
  heart_rate?: number
  respiratory_rate?: number
  // Medications & Treatments
  medications: string[]
  treatments: string[]
  // Follow-up
  follow_up_required: boolean
  follow_up_date?: string
  follow_up_notes?: string
  // Meta
  created_by: string
  created_at: string
  updated_at: string
  clinic_id: string
}

export interface VitalSigns {
  temperature?: number
  weight?: number
  heart_rate?: number
  respiratory_rate?: number
  blood_pressure_systolic?: number
  blood_pressure_diastolic?: number
}

export async function createEMRRecord(data: {
  patient_id: string
  pet_id: string
  appointment_id?: string
  visit_type: string
  chief_complaint: string
  subjective: string
  objective: string
  assessment: string
  plan: string
  vital_signs?: VitalSigns
  medications?: string[]
  treatments?: string[]
  follow_up_required?: boolean
  follow_up_date?: string
  follow_up_notes?: string
}) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        INSERT INTO emr_records (
          patient_id, pet_id, appointment_id, visit_date, visit_type, 
          chief_complaint, subjective, objective, assessment, plan,
          temperature, weight, heart_rate, respiratory_rate,
          medications, treatments, follow_up_required, follow_up_date, follow_up_notes,
          created_by, clinic_id
        ) VALUES (
          $1, $2, $3, CURRENT_DATE, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        ) RETURNING *
      `, [
        data.patient_id,
        data.pet_id,
        data.appointment_id,
        data.visit_type,
        data.chief_complaint,
        data.subjective,
        data.objective,
        data.assessment,
        data.plan,
        data.vital_signs?.temperature,
        data.vital_signs?.weight,
        data.vital_signs?.heart_rate,
        data.vital_signs?.respiratory_rate,
        JSON.stringify(data.medications || []),
        JSON.stringify(data.treatments || []),
        data.follow_up_required || false,
        data.follow_up_date,
        data.follow_up_notes,
        "current_user", // TODO: Replace with actual user ID
        "ff4a1430-f7df-49b8-99bf-2240faa8d622"
      ])

      // If linked to appointment, update appointment status to completed
      if (data.appointment_id) {
        await client.query(`
          UPDATE appointments 
          SET status = 'completed', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND clinic_id = $2
        `, [data.appointment_id, "ff4a1430-f7df-49b8-99bf-2240faa8d622"])
      }

      revalidatePath("/emr")
      revalidatePath("/appointments")
      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error creating EMR record:", error)
    return { success: false, error: "Failed to create EMR record" }
  }
}

export async function getEMRRecords(patientId?: string, petId?: string) {
  try {
    const client = await pool.connect()
    
    try {
      let query = `
        SELECT 
          emr.*,
          p.name as patient_name,
          pt.name as pet_name,
          pt.species,
          pt.breed,
          a.appointment_date,
          a.appointment_type
        FROM emr_records emr
        JOIN patients p ON emr.patient_id = p.id
        JOIN pets pt ON emr.pet_id = pt.id
        LEFT JOIN appointments a ON emr.appointment_id = a.id
        WHERE emr.clinic_id = $1
      `
      
      const params = ["ff4a1430-f7df-49b8-99bf-2240faa8d622"]
      
      if (patientId) {
        query += ` AND emr.patient_id = $${params.length + 1}`
        params.push(patientId)
      }
      
      if (petId) {
        query += ` AND emr.pet_id = $${params.length + 1}`
        params.push(petId)
      }
      
      query += ` ORDER BY emr.visit_date DESC, emr.created_at DESC`
      
      const result = await client.query(query, params)
      return result.rows
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error fetching EMR records:", error)
    return []
  }
}

export async function getEMRRecord(id: string) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT 
          emr.*,
          p.name as patient_name,
          p.phone as patient_phone,
          p.email as patient_email,
          pt.name as pet_name,
          pt.species,
          pt.breed,
          pt.age,
          pt.gender,
          a.appointment_date,
          a.appointment_type,
          a.reason as appointment_reason
        FROM emr_records emr
        JOIN patients p ON emr.patient_id = p.id
        JOIN pets pt ON emr.pet_id = pt.id
        LEFT JOIN appointments a ON emr.appointment_id = a.id
        WHERE emr.id = $1 AND emr.clinic_id = $2
      `, [id, "ff4a1430-f7df-49b8-99bf-2240faa8d622"])

      if (result.rows.length === 0) {
        return null
      }

      const record = result.rows[0]
      
      // Parse JSON fields
      record.medications = JSON.parse(record.medications || '[]')
      record.treatments = JSON.parse(record.treatments || '[]')
      
      return record
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error fetching EMR record:", error)
    return null
  }
}

export async function updateEMRRecord(id: string, data: Partial<EMRRecord>) {
  try {
    const client = await pool.connect()
    
    try {
      const setClause = []
      const values = []
      let paramCount = 1

      // Build dynamic update query
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'clinic_id') {
          if (key === 'medications' || key === 'treatments') {
            setClause.push(`${key} = $${paramCount}`)
            values.push(JSON.stringify(value))
          } else {
            setClause.push(`${key} = $${paramCount}`)
            values.push(value)
          }
          paramCount++
        }
      })

      if (setClause.length === 0) {
        return { success: false, error: "No valid fields to update" }
      }

      setClause.push(`updated_at = CURRENT_TIMESTAMP`)
      values.push(id, "ff4a1430-f7df-49b8-99bf-2240faa8d622")

      const query = `
        UPDATE emr_records 
        SET ${setClause.join(', ')}
        WHERE id = $${paramCount} AND clinic_id = $${paramCount + 1}
        RETURNING *
      `

      const result = await client.query(query, values)

      if (result.rows.length === 0) {
        return { success: false, error: "EMR record not found" }
      }

      revalidatePath("/emr")
      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error updating EMR record:", error)
    return { success: false, error: "Failed to update EMR record" }
  }
}