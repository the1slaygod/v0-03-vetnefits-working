"use server"

import { Pool } from "pg"
import { revalidatePath } from "next/cache"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export interface WaitingListEntry {
  id: string
  patient_id: string
  pet_id: string
  appointment_id?: string
  priority: "low" | "normal" | "high" | "urgent"
  reason: string
  notes?: string
  estimated_duration?: number
  checked_in_at: string
  status: "waiting" | "in_progress" | "completed" | "cancelled"
  called_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  // Joined fields
  patient_name?: string
  pet_name?: string
  species?: string
  appointment_time?: string
}

export async function getWaitingList() {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        wl.*,
        p.name as patient_name,
        pet.name as pet_name,
        pet.species,
        a.appointment_date as appointment_time
      FROM waiting_list wl
      LEFT JOIN patients p ON wl.patient_id = p.id
      LEFT JOIN pets pet ON wl.pet_id = pet.id
      LEFT JOIN appointments a ON wl.appointment_id = a.id
      WHERE wl.status != 'completed' AND wl.status != 'cancelled'
      ORDER BY 
        CASE wl.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'normal' THEN 3
          WHEN 'low' THEN 4
        END,
        wl.checked_in_at ASC
    `)
    
    return result.rows
  } finally {
    client.release()
  }
}

export async function addToWaitingList(data: {
  patient_id: string
  pet_id: string
  appointment_id?: string
  priority: "low" | "normal" | "high" | "urgent"
  reason: string
  notes?: string
  estimated_duration?: number
}) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        INSERT INTO waiting_list (
          patient_id, pet_id, appointment_id, priority, reason, 
          notes, estimated_duration, checked_in_at, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, 'waiting'
        ) RETURNING *
      `, [
        data.patient_id,
        data.pet_id,
        data.appointment_id || null,
        data.priority,
        data.reason,
        data.notes || null,
        data.estimated_duration || null
      ])

      revalidatePath("/waiting-list")
      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error adding to waiting list:", error)
    return { success: false, error: "Failed to add to waiting list" }
  }
}

export async function updateWaitingListStatus(
  id: string, 
  status: "waiting" | "in_progress" | "completed" | "cancelled"
) {
  try {
    const client = await pool.connect()
    
    try {
      let updateQuery = `
        UPDATE waiting_list 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
      `
      const params = [status, id]

      // Add timestamp fields based on status
      if (status === "in_progress") {
        updateQuery += `, called_at = CURRENT_TIMESTAMP`
      } else if (status === "completed" || status === "cancelled") {
        updateQuery += `, completed_at = CURRENT_TIMESTAMP`
      }

      updateQuery += ` WHERE id = $2 RETURNING *`

      const result = await client.query(updateQuery, params)

      if (result.rows.length === 0) {
        return { success: false, error: "Waiting list entry not found" }
      }

      revalidatePath("/waiting-list")
      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error updating waiting list status:", error)
    return { success: false, error: "Failed to update status" }
  }
}

export async function updateWaitingListPriority(id: string, priority: "low" | "normal" | "high" | "urgent") {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        UPDATE waiting_list 
        SET priority = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 
        RETURNING *
      `, [priority, id])

      if (result.rows.length === 0) {
        return { success: false, error: "Waiting list entry not found" }
      }

      revalidatePath("/waiting-list")
      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error updating priority:", error)
    return { success: false, error: "Failed to update priority" }
  }
}

export async function removeFromWaitingList(id: string) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        UPDATE waiting_list 
        SET status = 'cancelled', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 
        RETURNING *
      `, [id])

      if (result.rows.length === 0) {
        return { success: false, error: "Waiting list entry not found" }
      }

      revalidatePath("/waiting-list")
      return { success: true, data: result.rows[0] }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error removing from waiting list:", error)
    return { success: false, error: "Failed to remove from waiting list" }
  }
}

export async function getWaitingListStats() {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'waiting') as waiting_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE priority = 'urgent' AND status != 'completed' AND status != 'cancelled') as urgent_count,
        AVG(estimated_duration) FILTER (WHERE estimated_duration IS NOT NULL AND status != 'completed' AND status != 'cancelled') as avg_wait_time
      FROM waiting_list 
      WHERE DATE(checked_in_at) = CURRENT_DATE
    `)
    
    return {
      waitingCount: parseInt(result.rows[0].waiting_count) || 0,
      inProgressCount: parseInt(result.rows[0].in_progress_count) || 0,
      urgentCount: parseInt(result.rows[0].urgent_count) || 0,
      avgWaitTime: parseFloat(result.rows[0].avg_wait_time) || 0
    }
  } finally {
    client.release()
  }
}