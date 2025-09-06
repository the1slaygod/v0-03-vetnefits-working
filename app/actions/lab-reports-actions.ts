"use server"

import { Pool } from "pg"
import { revalidatePath } from "next/cache"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export interface LabReport {
  id: string
  patient_id: string
  pet_id: string
  emr_record_id?: string
  test_name: string
  test_type: "blood_work" | "urine_analysis" | "fecal_exam" | "skin_scraping" | "biopsy" | "x_ray" | "ultrasound" | "other"
  ordered_date: string
  collected_date?: string
  completed_date?: string
  status: "ordered" | "collected" | "in_progress" | "completed" | "cancelled"
  results?: string
  normal_ranges?: string
  abnormal_findings?: string
  interpretation?: string
  recommendations?: string
  lab_name?: string
  veterinarian: string
  file_url?: string
  notes?: string
  created_at: string
  updated_at: string
  // Joined fields
  patient_name?: string
  pet_name?: string
  species?: string
}

export async function getLabReports() {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        lr.*,
        p.first_name || ' ' || p.last_name as patient_name,
        pet.name as pet_name,
        pet.species
      FROM lab_reports lr
      LEFT JOIN patients p ON lr.patient_id = p.id
      LEFT JOIN pets pet ON lr.pet_id = pet.id
      ORDER BY lr.ordered_date DESC, lr.created_at DESC
    `)
    
    return result.rows
  } finally {
    client.release()
  }
}

export async function getLabReportById(id: string) {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        lr.*,
        p.first_name || ' ' || p.last_name as patient_name,
        p.email as patient_email,
        p.phone as patient_phone,
        pet.name as pet_name,
        pet.species,
        pet.breed,
        pet.date_of_birth
      FROM lab_reports lr
      LEFT JOIN patients p ON lr.patient_id = p.id
      LEFT JOIN pets pet ON lr.pet_id = pet.id
      WHERE lr.id = $1
    `, [id])
    
    if (result.rows.length === 0) {
      return null
    }
    
    return result.rows[0]
  } finally {
    client.release()
  }
}

export async function createLabReport(data: {
  patient_id: string
  pet_id: string
  emr_record_id?: string
  test_name: string
  test_type: "blood_work" | "urine_analysis" | "fecal_exam" | "skin_scraping" | "biopsy" | "x_ray" | "ultrasound" | "other"
  ordered_date: string
  collected_date?: string
  status?: "ordered" | "collected" | "in_progress" | "completed" | "cancelled"
  results?: string
  normal_ranges?: string
  abnormal_findings?: string
  interpretation?: string
  recommendations?: string
  lab_name?: string
  veterinarian: string
  file_url?: string
  notes?: string
}) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        INSERT INTO lab_reports (
          patient_id, pet_id, emr_record_id, test_name, test_type,
          ordered_date, collected_date, status, results, normal_ranges,
          abnormal_findings, interpretation, recommendations, lab_name,
          veterinarian, file_url, notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        ) RETURNING *
      `, [
        data.patient_id,
        data.pet_id,
        data.emr_record_id || null,
        data.test_name,
        data.test_type,
        data.ordered_date,
        data.collected_date || null,
        data.status || "ordered",
        data.results || null,
        data.normal_ranges || null,
        data.abnormal_findings || null,
        data.interpretation || null,
        data.recommendations || null,
        data.lab_name || null,
        data.veterinarian,
        data.file_url || null,
        data.notes || null
      ])

      revalidatePath("/lab-reports")
      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error creating lab report:", error)
    return { success: false, error: "Failed to create lab report" }
  }
}

export async function updateLabReport(id: string, data: {
  test_name?: string
  test_type?: "blood_work" | "urine_analysis" | "fecal_exam" | "skin_scraping" | "biopsy" | "x_ray" | "ultrasound" | "other"
  collected_date?: string
  completed_date?: string
  status?: "ordered" | "collected" | "in_progress" | "completed" | "cancelled"
  results?: string
  normal_ranges?: string
  abnormal_findings?: string
  interpretation?: string
  recommendations?: string
  lab_name?: string
  veterinarian?: string
  file_url?: string
  notes?: string
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
        UPDATE lab_reports 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, values)

      if (result.rows.length === 0) {
        return { success: false, error: "Lab report not found" }
      }

      revalidatePath("/lab-reports")
      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error updating lab report:", error)
    return { success: false, error: "Failed to update lab report" }
  }
}

export async function deleteLabReport(id: string) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        DELETE FROM lab_reports WHERE id = $1 RETURNING *
      `, [id])

      if (result.rows.length === 0) {
        return { success: false, error: "Lab report not found" }
      }

      revalidatePath("/lab-reports")
      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error deleting lab report:", error)
    return { success: false, error: "Failed to delete lab report" }
  }
}

export async function getLabReportStats() {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_reports,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_reports,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_reports,
        COUNT(*) FILTER (WHERE status = 'ordered') as pending_reports,
        COUNT(*) FILTER (WHERE DATE(ordered_date) = CURRENT_DATE) as today_reports,
        COUNT(*) FILTER (WHERE abnormal_findings IS NOT NULL AND abnormal_findings != '') as abnormal_reports
      FROM lab_reports
    `)
    
    return {
      totalReports: parseInt(result.rows[0].total_reports) || 0,
      completedReports: parseInt(result.rows[0].completed_reports) || 0,
      inProgressReports: parseInt(result.rows[0].in_progress_reports) || 0,
      pendingReports: parseInt(result.rows[0].pending_reports) || 0,
      todayReports: parseInt(result.rows[0].today_reports) || 0,
      abnormalReports: parseInt(result.rows[0].abnormal_reports) || 0
    }
  } finally {
    client.release()
  }
}

export async function getLabReportsByPatient(patientId: string) {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        lr.*,
        pet.name as pet_name,
        pet.species
      FROM lab_reports lr
      LEFT JOIN pets pet ON lr.pet_id = pet.id
      WHERE lr.patient_id = $1
      ORDER BY lr.ordered_date DESC
    `, [patientId])
    
    return result.rows
  } finally {
    client.release()
  }
}