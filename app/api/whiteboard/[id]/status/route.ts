import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { status } = await request.json()
    const appointmentId = params.id
    
    // Prepare the update data based on status
    const updateData: any = { status }
    const now = new Date().toISOString()
    
    switch (status) {
      case "waiting":
        updateData.checked_in_at = now
        updateData.attending_at = null
        updateData.completed_at = null
        break
      case "attending":
        updateData.attending_at = now
        updateData.completed_at = null
        break
      case "completed":
        updateData.completed_at = now
        break
      case "no_show":
      case "cancelled":
        updateData.checked_in_at = null
        updateData.attending_at = null
        updateData.completed_at = null
        break
      default:
        // scheduled - reset all timestamps
        updateData.checked_in_at = null
        updateData.attending_at = null
        updateData.completed_at = null
    }
    
    const { data, error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", appointmentId)
      .select()
      .single()
    
    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}