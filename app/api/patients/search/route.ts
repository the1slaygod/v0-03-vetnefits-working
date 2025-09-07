import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { PatientSearchResult } from "../../../waiting-list/types"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""

    if (!q || q.length < 2) {
      return NextResponse.json({ data: [] })
    }

    const client = await pool.connect()
    
    try {
      const query = `
        SELECT 
          p.id,
          p.name,
          p.email,
          p.phone,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pet.id,
                'name', pet.name,
                'species', pet.species,
                'breed', pet.breed,
                'age', pet.age
              ) ORDER BY pet.name
            ) FILTER (WHERE pet.id IS NOT NULL),
            '[]'::json
          ) as pets
        FROM patients p
        LEFT JOIN pets pet ON p.id = pet.patient_id
        WHERE p.name ILIKE $1
        GROUP BY p.id, p.name, p.email, p.phone
        ORDER BY p.name
        LIMIT 10
      `

      const result = await client.query(query, [`%${q}%`])
      const patients: PatientSearchResult[] = result.rows

      return NextResponse.json({ data: patients })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Patient search API error:", error)
    return NextResponse.json(
      { error: "Failed to search patients" },
      { status: 500 }
    )
  }
}