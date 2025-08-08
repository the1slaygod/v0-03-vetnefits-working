"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Interconnected patient operations
export async function createPatientWithAppointment(patientData: any, appointmentData: any, clinicId: string) {
  try {
    const supabase = createServerClient()

    // Start transaction
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .insert([{ ...patientData, clinic_id: clinicId }])
      .select()
      .single()

    if (patientError) throw patientError

    // Create appointment for the new patient
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert([
        {
          ...appointmentData,
          clinic_id: clinicId,
          patient_id: patient.id,
        },
      ])
      .select()
      .single()

    if (appointmentError) throw appointmentError

    // Create initial compliance task for new patient
    await supabase.from("compliance_tasks").insert([
      {
        clinic_id: clinicId,
        patient_id: patient.id,
        task: "Initial Health Assessment",
        description: "Complete initial health assessment for new patient",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        priority: "medium",
        assigned_to: appointmentData.veterinarian_id,
        created_by: appointmentData.created_by,
      },
    ])

    revalidatePath("/patients")
    revalidatePath("/appointments")
    revalidatePath("/compliance")

    return { success: true, patient, appointment }
  } catch (error) {
    console.error("Error creating patient with appointment:", error)
    throw error
  }
}

// Complete appointment and create SOAP note
export async function completeAppointmentWithSOAP(appointmentId: string, soapData: any, clinicId: string) {
  try {
    const supabase = createServerClient()

    // Update appointment status
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", appointmentId)
      .eq("clinic_id", clinicId)
      .select()
      .single()

    if (appointmentError) throw appointmentError

    // Create SOAP note
    const { data: soapNote, error: soapError } = await supabase
      .from("soap_notes")
      .insert([
        {
          ...soapData,
          clinic_id: clinicId,
          appointment_id: appointmentId,
          patient_id: appointment.patient_id,
        },
      ])
      .select()
      .single()

    if (soapError) throw soapError

    // Remove from waiting list if present
    await supabase
      .from("waiting_list")
      .update({ status: "done" })
      .eq("appointment_id", appointmentId)
      .eq("clinic_id", clinicId)

    revalidatePath("/appointments")
    revalidatePath("/emr")
    revalidatePath("/waiting-list")

    return { success: true, appointment, soapNote }
  } catch (error) {
    console.error("Error completing appointment:", error)
    throw error
  }
}

// Add vaccine and update compliance
export async function addVaccineWithCompliance(vaccineData: any, clinicId: string) {
  try {
    const supabase = createServerClient()

    // Add vaccine record
    const { data: vaccine, error: vaccineError } = await supabase
      .from("vaccines")
      .insert([{ ...vaccineData, clinic_id: clinicId }])
      .select()
      .single()

    if (vaccineError) throw vaccineError

    // Create compliance task for next dose if needed
    if (vaccine.next_due_date) {
      await supabase.from("compliance_tasks").insert([
        {
          clinic_id: clinicId,
          patient_id: vaccine.patient_id,
          task: `${vaccine.vaccine_name} Booster`,
          description: `Next ${vaccine.vaccine_name} vaccination due`,
          due_date: vaccine.next_due_date,
          priority: "medium",
          assigned_to: vaccine.veterinarian_id,
          created_by: vaccine.veterinarian_id,
        },
      ])
    }

    // Complete any existing vaccine compliance tasks
    await supabase
      .from("compliance_tasks")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("patient_id", vaccine.patient_id)
      .eq("clinic_id", clinicId)
      .ilike("task", `%${vaccine.vaccine_name}%`)
      .eq("status", "pending")

    revalidatePath("/vaccines")
    revalidatePath("/compliance")

    return { success: true, vaccine }
  } catch (error) {
    console.error("Error adding vaccine:", error)
    throw error
  }
}

// Create invoice from appointment
export async function createInvoiceFromAppointment(appointmentId: string, invoiceItems: any[], clinicId: string) {
  try {
    const supabase = createServerClient()

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .eq("clinic_id", clinicId)
      .single()

    if (appointmentError) throw appointmentError

    // Calculate totals
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
    const taxAmount = subtotal * 0.08 // 8% tax
    const totalAmount = subtotal + taxAmount

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert([
        {
          clinic_id: clinicId,
          patient_id: appointment.patient_id,
          appointment_id: appointmentId,
          invoice_number: invoiceNumber,
          invoice_date: new Date().toISOString().split("T")[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          created_by: appointment.veterinarian_id,
        },
      ])
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Add invoice items
    const itemsWithInvoiceId = invoiceItems.map((item) => ({
      ...item,
      invoice_id: invoice.id,
      total_price: item.quantity * item.unit_price,
    }))

    const { error: itemsError } = await supabase.from("invoice_items").insert(itemsWithInvoiceId)

    if (itemsError) throw itemsError

    revalidatePath("/billing")
    revalidatePath("/appointments")

    return { success: true, invoice }
  } catch (error) {
    console.error("Error creating invoice:", error)
    throw error
  }
}

// Search patients across all modules
export async function searchPatients(searchTerm: string, clinicId: string, limit = 10) {
  try {
    const supabase = createServerClient()

    const { data: patients, error } = await supabase
      .from("patients")
      .select(`
        *,
        appointments:appointments(count),
        vaccines:vaccines(count),
        soap_notes:soap_notes(count)
      `)
      .eq("clinic_id", clinicId)
      .or(
        `name.ilike.%${searchTerm}%,owner_name.ilike.%${searchTerm}%,breed.ilike.%${searchTerm}%,microchip_id.ilike.%${searchTerm}%`,
      )
      .limit(limit)

    if (error) throw error

    return { success: true, patients }
  } catch (error) {
    console.error("Error searching patients:", error)
    return { success: false, patients: [] }
  }
}

// Get interconnected patient data
export async function getPatientWithAllData(patientId: string, clinicId: string) {
  try {
    const supabase = createServerClient()

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select(`
        *,
        appointments:appointments(*),
        soap_notes:soap_notes(*),
        vaccines:vaccines(*),
        compliance_tasks:compliance_tasks(*),
        invoices:invoices(*),
        waiting_list:waiting_list(*)
      `)
      .eq("id", patientId)
      .eq("clinic_id", clinicId)
      .single()

    if (patientError) throw patientError

    return { success: true, patient }
  } catch (error) {
    console.error("Error fetching patient data:", error)
    throw error
  }
}

// Real-time sync function
export async function syncModuleData(
  moduleType: string,
  action: "create" | "update" | "delete",
  data: any,
  clinicId: string,
) {
  try {
    const supabase = createServerClient()

    // Broadcast real-time update to all connected clients
    await supabase.channel(`clinic_${clinicId}`).send({
      type: "broadcast",
      event: "module_update",
      payload: {
        module: moduleType,
        action,
        data,
        timestamp: new Date().toISOString(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error syncing module data:", error)
    return { success: false }
  }
}
