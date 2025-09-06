"use server"

import { Pool } from "pg"
import { revalidatePath } from "next/cache"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export interface VaccineRecord {
  id: string
  patient_id: string
  pet_id: string
  emr_record_id?: string
  vaccine_name: string
  vaccine_type: "core" | "non_core" | "lifestyle" | "therapeutic"
  manufacturer: string
  lot_number: string
  expiration_date: string
  administered_date: string
  administered_by: string
  dose_number: number
  total_doses: number
  next_due_date?: string
  site_of_injection: string
  adverse_reactions?: string
  notes?: string
  status: "scheduled" | "administered" | "overdue" | "cancelled"
  created_at: string
  updated_at: string
  // Joined fields
  patient_name?: string
  pet_name?: string
  species?: string
  breed?: string
  age?: number
}

export async function getVaccineRecords() {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        vr.*,
        p.first_name || ' ' || p.last_name as patient_name,
        pet.name as pet_name,
        pet.species,
        pet.breed,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, pet.date_of_birth)) as age
      FROM vaccine_records vr
      LEFT JOIN patients p ON vr.patient_id = p.id
      LEFT JOIN pets pet ON vr.pet_id = pet.id
      ORDER BY vr.administered_date DESC, vr.created_at DESC
    `)
    
    return result.rows
  } finally {
    client.release()
  }
}

export async function getVaccineRecordById(id: string) {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        vr.*,
        p.first_name || ' ' || p.last_name as patient_name,
        p.email as patient_email,
        p.phone as patient_phone,
        pet.name as pet_name,
        pet.species,
        pet.breed,
        pet.date_of_birth,
        pet.weight,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, pet.date_of_birth)) as age
      FROM vaccine_records vr
      LEFT JOIN patients p ON vr.patient_id = p.id
      LEFT JOIN pets pet ON vr.pet_id = pet.id
      WHERE vr.id = $1
    `, [id])
    
    if (result.rows.length === 0) {
      return null
    }
    
    return result.rows[0]
  } finally {
    client.release()
  }
}

export async function createVaccineRecord(data: {
  patient_id: string
  pet_id: string
  emr_record_id?: string
  vaccine_name: string
  vaccine_type: "core" | "non_core" | "lifestyle" | "therapeutic"
  manufacturer: string
  lot_number: string
  expiration_date: string
  administered_date: string
  administered_by: string
  dose_number?: number
  total_doses?: number
  next_due_date?: string
  site_of_injection: string
  adverse_reactions?: string
  notes?: string
  status?: "scheduled" | "administered" | "overdue" | "cancelled"
}) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        INSERT INTO vaccine_records (
          patient_id, pet_id, emr_record_id, vaccine_name, vaccine_type,
          manufacturer, lot_number, expiration_date, administered_date, 
          administered_by, dose_number, total_doses, next_due_date,
          site_of_injection, adverse_reactions, notes, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        ) RETURNING *
      `, [
        data.patient_id,
        data.pet_id,
        data.emr_record_id || null,
        data.vaccine_name,
        data.vaccine_type,
        data.manufacturer,
        data.lot_number,
        data.expiration_date,
        data.administered_date,
        data.administered_by,
        data.dose_number || 1,
        data.total_doses || 1,
        data.next_due_date || null,
        data.site_of_injection,
        data.adverse_reactions || null,
        data.notes || null,
        data.status || "administered"
      ])

      revalidatePath("/vaccines")
      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error creating vaccine record:", error)
    return { success: false, error: "Failed to create vaccine record" }
  }
}

export async function updateVaccineRecord(id: string, data: {
  vaccine_name?: string
  vaccine_type?: "core" | "non_core" | "lifestyle" | "therapeutic"
  manufacturer?: string
  lot_number?: string
  expiration_date?: string
  administered_date?: string
  administered_by?: string
  dose_number?: number
  total_doses?: number
  next_due_date?: string
  site_of_injection?: string
  adverse_reactions?: string
  notes?: string
  status?: "scheduled" | "administered" | "overdue" | "cancelled"
}) {
  try {
    const client = await pool.connect()
    
    try {
      const updateFields = []
      const values = []
      let paramIndex = 1

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = $${paramIndex}`)
          values.push(value)
          paramIndex++
        }
      })

      if (updateFields.length === 0) {
        return { success: false, error: "No fields to update" }
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`)
      values.push(id)

      const result = await client.query(`
        UPDATE vaccine_records 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, values)

      if (result.rows.length === 0) {
        return { success: false, error: "Vaccine record not found" }
      }

      revalidatePath("/vaccines")
      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error updating vaccine record:", error)
    return { success: false, error: "Failed to update vaccine record" }
  }
}

export async function deleteVaccineRecord(id: string) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        DELETE FROM vaccine_records WHERE id = $1 RETURNING *
      `, [id])

      if (result.rows.length === 0) {
        return { success: false, error: "Vaccine record not found" }
      }

      revalidatePath("/vaccines")
      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error deleting vaccine record:", error)
    return { success: false, error: "Failed to delete vaccine record" }
  }
}

export async function getVaccineStats() {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_vaccines,
        COUNT(*) FILTER (WHERE status = 'administered') as administered_vaccines,
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_vaccines,
        COUNT(*) FILTER (WHERE status = 'overdue') as overdue_vaccines,
        COUNT(*) FILTER (WHERE DATE(administered_date) = CURRENT_DATE) as today_vaccines,
        COUNT(*) FILTER (WHERE adverse_reactions IS NOT NULL AND adverse_reactions != '') as adverse_reactions,
        COUNT(*) FILTER (WHERE vaccine_type = 'core') as core_vaccines,
        COUNT(*) FILTER (WHERE next_due_date IS NOT NULL AND next_due_date <= CURRENT_DATE + INTERVAL '30 days') as due_soon
      FROM vaccine_records
    `)
    
    return {
      totalVaccines: parseInt(result.rows[0].total_vaccines) || 0,
      administeredVaccines: parseInt(result.rows[0].administered_vaccines) || 0,
      scheduledVaccines: parseInt(result.rows[0].scheduled_vaccines) || 0,
      overdueVaccines: parseInt(result.rows[0].overdue_vaccines) || 0,
      todayVaccines: parseInt(result.rows[0].today_vaccines) || 0,
      adverseReactions: parseInt(result.rows[0].adverse_reactions) || 0,
      coreVaccines: parseInt(result.rows[0].core_vaccines) || 0,
      dueSoon: parseInt(result.rows[0].due_soon) || 0
    }
  } finally {
    client.release()
  }
}

export async function getVaccinesByPatient(patientId: string) {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        vr.*,
        pet.name as pet_name,
        pet.species,
        pet.breed
      FROM vaccine_records vr
      LEFT JOIN pets pet ON vr.pet_id = pet.id
      WHERE vr.patient_id = $1
      ORDER BY vr.administered_date DESC
    `, [patientId])
    
    return result.rows
  } finally {
    client.release()
  }
}

export async function getDueVaccines() {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        vr.*,
        p.first_name || ' ' || p.last_name as patient_name,
        p.phone as patient_phone,
        p.email as patient_email,
        pet.name as pet_name,
        pet.species,
        pet.breed
      FROM vaccine_records vr
      LEFT JOIN patients p ON vr.patient_id = p.id
      LEFT JOIN pets pet ON vr.pet_id = pet.id
      WHERE vr.next_due_date IS NOT NULL 
        AND vr.next_due_date <= CURRENT_DATE + INTERVAL '30 days'
        AND vr.status != 'cancelled'
      ORDER BY vr.next_due_date ASC
    `)
    
    return result.rows
  } finally {
    client.release()
  }
}

export async function getVaccineProtocolsBySpecies(species: string) {
  // This would typically come from a vaccine protocol table
  // For now, return common vaccine protocols
  const protocols: Record<string, any[]> = {
    dog: [
      {
        name: "DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)",
        type: "core",
        doses: 3,
        age_start: 6,
        booster_interval: 12
      },
      {
        name: "Rabies",
        type: "core",
        doses: 1,
        age_start: 12,
        booster_interval: 36
      },
      {
        name: "Lyme Disease",
        type: "non_core",
        doses: 2,
        age_start: 9,
        booster_interval: 12
      }
    ],
    cat: [
      {
        name: "FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)",
        type: "core",
        doses: 3,
        age_start: 6,
        booster_interval: 12
      },
      {
        name: "Rabies",
        type: "core",
        doses: 1,
        age_start: 12,
        booster_interval: 36
      },
      {
        name: "FeLV (Feline Leukemia)",
        type: "non_core",
        doses: 2,
        age_start: 8,
        booster_interval: 12
      }
    ]
  }

  return protocols[species.toLowerCase()] || []
}