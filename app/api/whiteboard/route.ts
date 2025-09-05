import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { searchParams } = new URL(request.url)
    
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]
    const show = searchParams.get("show") || "all"
    const providerId = searchParams.get("providerId")
    const apptType = searchParams.get("apptType")
    const q = searchParams.get("q") // search query
    
    // Build the query
    let query = supabase
      .from("appointments")
      .select(`
        id,
        clinic_id,
        appointment_date,
        checked_in_at,
        attending_at,
        completed_at,
        appointment_type,
        confirmed,
        complaint,
        status,
        photo_url,
        provider_id,
        created_by,
        patients!inner (
          id,
          name,
          email,
          phone
        ),
        pets!inner (
          id,
          name,
          species,
          breed
        ),
        clinic_staff!provider_id (
          id,
          name
        )
      `)
    
    // Filter by date
    const startOfDay = `${date}T00:00:00.000Z`
    const endOfDay = `${date}T23:59:59.999Z`
    query = query.gte("appointment_date", startOfDay).lte("appointment_date", endOfDay)
    
    // Filter by show status
    if (show !== "all") {
      query = query.eq("status", show)
    }
    
    // Filter by provider
    if (providerId && providerId !== "all") {
      query = query.eq("provider_id", providerId)
    }
    
    // Filter by appointment type
    if (apptType && apptType !== "all") {
      query = query.eq("appointment_type", apptType)
    }
    
    // Search in client name, pet name, or complaint
    if (q) {
      // This is a simplified search - in production you'd want full-text search
      query = query.or(`patients.name.ilike.%${q}%,pets.name.ilike.%${q}%,complaint.ilike.%${q}%`)
    }
    
    query = query.order("appointment_date", { ascending: true })
    
    const { data: appointments, error } = await query
    
    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Transform data to match WhiteboardRow interface
    const whiteboardRows = appointments?.map((appt, index) => {
      const patient = Array.isArray(appt.patients) ? appt.patients[0] : appt.patients
      const pet = Array.isArray(appt.pets) ? appt.pets[0] : appt.pets
      const provider = Array.isArray(appt.clinic_staff) ? appt.clinic_staff[0] : appt.clinic_staff
      
      return {
        id: appt.id,
        clinic_id: appt.clinic_id,
        apptTimeISO: appt.appointment_date,
        checkedInAtISO: appt.checked_in_at,
        attendingAtISO: appt.attending_at,
        completedAtISO: appt.completed_at,
        client: patient?.name || "",
        patient: pet?.name || "",
        apptType: appt.appointment_type,
        confirmed: appt.confirmed,
        complaint: appt.complaint,
        provider: provider?.name || "",
        createdBy: appt.created_by,
        invoices: "", // Will be populated later
        sno: index + 1,
        status: appt.status,
        photoUrl: appt.photo_url
      }
    }) || []
    
    return NextResponse.json({ data: whiteboardRows })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}