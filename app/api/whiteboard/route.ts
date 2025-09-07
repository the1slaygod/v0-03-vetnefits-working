import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { WhiteboardRow, WhiteboardFilters } from "../../waiting-list/types"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: WhiteboardFilters = {
      dateISO: searchParams.get("date") || new Date().toISOString().split("T")[0],
      show: searchParams.get("show") as any || "all",
      providerId: searchParams.get("providerId") || "all",
      apptType: searchParams.get("apptType") || "all", 
      q: searchParams.get("q") || ""
    }

    const client = await pool.connect()
    
    try {
      // Build the query with proper joins
      let query = `
        SELECT 
          a.id,
          a.clinic_id,
          a.appointment_date as "apptTimeISO",
          a.checked_in_at as "checkedInAtISO",
          a.attending_at as "attendingAtISO", 
          a.completed_at as "completedAtISO",
          p.name as client,
          pet.name || ' (' || pet.species || ')' as patient,
          a.appointment_type as "apptType",
          CASE WHEN a.status = 'confirmed' THEN true ELSE false END as confirmed,
          COALESCE(a.complaint, a.reason) as complaint,
          COALESCE(staff.name, 'Dr. ' || SUBSTRING(a.provider_id::text, 1, 8)) as provider,
          a.created_by as "createdBy",
          '0.00' as invoices,
          ROW_NUMBER() OVER (ORDER BY 
            CASE 
              WHEN a.checked_in_at IS NOT NULL AND a.attending_at IS NULL THEN 1
              WHEN a.attending_at IS NOT NULL AND a.completed_at IS NULL THEN 2
              WHEN a.completed_at IS NOT NULL THEN 3
              ELSE 4
            END,
            a.appointment_date
          ) as sno,
          CASE 
            WHEN a.completed_at IS NOT NULL THEN 'completed'::text
            WHEN a.attending_at IS NOT NULL THEN 'attending'::text  
            WHEN a.checked_in_at IS NOT NULL THEN 'waiting'::text
            ELSE 'scheduled'::text
          END as status,
          a.photo_url as "photoUrl",
          a.patient_id,
          a.pet_id,
          'normal' as priority,
          COALESCE(a.reason, a.complaint) as reason,
          a.notes,
          a.duration as estimated_duration
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN pets pet ON a.pet_id = pet.id
        LEFT JOIN staff ON a.provider_id::text = staff.id::text
        WHERE 1=1
      `
      
      const params: any[] = []
      let paramIndex = 1

      // Date filter
      if (filters.dateISO && filters.dateISO !== "all") {
        query += ` AND DATE(a.appointment_date) = $${paramIndex}`
        params.push(filters.dateISO)
        paramIndex++
      }

      // Status filter
      if (filters.show !== "all") {
        if (filters.show === "waiting") {
          query += ` AND a.checked_in_at IS NOT NULL AND a.attending_at IS NULL`
        } else if (filters.show === "attending") {
          query += ` AND a.attending_at IS NOT NULL AND a.completed_at IS NULL`
        } else if (filters.show === "completed") {
          query += ` AND a.completed_at IS NOT NULL`
        } else if (filters.show === "scheduled") {
          query += ` AND a.checked_in_at IS NULL`
        }
      }

      // Provider filter
      if (filters.providerId && filters.providerId !== "all") {
        query += ` AND a.provider_id = $${paramIndex}`
        params.push(filters.providerId)
        paramIndex++
      }

      // Appointment type filter
      if (filters.apptType && filters.apptType !== "all") {
        query += ` AND a.appointment_type = $${paramIndex}`
        params.push(filters.apptType)
        paramIndex++
      }

      // Search filter
      if (filters.q) {
        query += ` AND (
          p.name ILIKE $${paramIndex} OR 
          pet.name ILIKE $${paramIndex} OR 
          a.complaint ILIKE $${paramIndex} OR
          a.reason ILIKE $${paramIndex}
        )`
        params.push(`%${filters.q}%`)
        paramIndex++
      }

      query += ` ORDER BY 
        CASE 
          WHEN a.checked_in_at IS NOT NULL AND a.attending_at IS NULL THEN 1
          WHEN a.attending_at IS NOT NULL AND a.completed_at IS NULL THEN 2
          WHEN a.completed_at IS NOT NULL THEN 3
          ELSE 4
        END,
        a.appointment_date ASC`

      const result = await client.query(query, params)
      const rows: WhiteboardRow[] = result.rows

      return NextResponse.json({ 
        data: rows,
        filters,
        total: rows.length 
      })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Whiteboard API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch whiteboard data" },
      { status: 500 }
    )
  }
}