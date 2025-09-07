import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    const { id } = params

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required" },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      let query = ""
      let queryParams: any[] = [status, id]

      // Set appropriate timestamps based on status
      switch (status) {
        case "waiting":
          query = `
            UPDATE appointments 
            SET status = $1, checked_in_at = CURRENT_TIMESTAMP, attending_at = NULL, completed_at = NULL
            WHERE id = $2
            RETURNING *
          `
          break
        case "attending":
          query = `
            UPDATE appointments 
            SET status = $1, attending_at = CURRENT_TIMESTAMP, completed_at = NULL
            WHERE id = $2
            RETURNING *
          `
          break
        case "completed":
          query = `
            UPDATE appointments 
            SET status = $1, completed_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
          `
          break
        case "cancelled":
        case "no_show":
          query = `
            UPDATE appointments 
            SET status = $1
            WHERE id = $2
            RETURNING *
          `
          break
        default:
          return NextResponse.json(
            { error: "Invalid status" },
            { status: 400 }
          )
      }

      const result = await client.query(query, queryParams)
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        data: result.rows[0] 
      })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Status update API error:", error)
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    )
  }
}