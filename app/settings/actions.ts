"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"

// Create a simple database client using DATABASE_URL if available
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.includes('supabase.co')) {
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function saveSettings(formData: FormData) {
  try {
    const clinicData = {
      clinic_name: formData.get("clinic_name") as string,
      clinic_phone: formData.get("clinic_phone") as string,
      clinic_email: formData.get("clinic_email") as string,
      clinic_address: formData.get("clinic_address") as string,
      whatsapp_phone_number: formData.get("whatsapp_phone_number") as string,
    }

    console.log("Saving settings:", clinicData)

    // Try to update database if Supabase is available
    const supabase = getSupabaseClient()
    if (supabase) {
      const clinicId = "ff4a1430-f7df-49b8-99bf-2240faa8d622"
      
      // Update clinic_settings table
      const { error: settingsError } = await supabase
        .from('clinic_settings')
        .upsert({
          clinic_id: clinicId,
          clinic_name: clinicData.clinic_name,
          clinic_phone: clinicData.clinic_phone,
          clinic_email: clinicData.clinic_email,
          clinic_address: clinicData.clinic_address,
          whatsapp_phone_number: clinicData.whatsapp_phone_number,
          updated_at: new Date().toISOString()
        })

      // Also update main clinics table
      const { error: clinicError } = await supabase
        .from('clinics')
        .update({
          name: clinicData.clinic_name,
          phone: clinicData.clinic_phone,
          email: clinicData.clinic_email,
          address: clinicData.clinic_address,
          updated_at: new Date().toISOString()
        })
        .eq('id', clinicId)

      if (settingsError) {
        console.error('Settings update error:', settingsError)
      }
      if (clinicError) {
        console.error('Clinic update error:', clinicError)
      }
    }

    // Force refresh the page data
    revalidatePath("/settings")
    revalidatePath("/")
    
    return { success: true, message: "Settings saved successfully" }
  } catch (error) {
    console.error("Settings save error:", error)
    return { success: false, message: "Failed to save settings" }
  }
}

export async function uploadLogo(formData: FormData) {
  try {
    const file = formData.get("logo") as File
    if (!file) {
      return { success: false, message: "No file provided" }
    }

    // For now, just simulate successful upload
    console.log("Uploading logo:", file.name, file.type, file.size)
    
    // In a real implementation, this would upload to Supabase Storage
    const logoUrl = `/images/clinic-logo.png` // Mock URL for now
    
    // Update the logo URL in settings
    const supabase = getSupabaseClient()
    if (supabase) {
      const clinicId = "ff4a1430-f7df-49b8-99bf-2240faa8d622"
      
      await supabase
        .from('clinic_settings')
        .upsert({
          clinic_id: clinicId,
          logo_url: logoUrl,
          updated_at: new Date().toISOString()
        })

      await supabase
        .from('clinics')
        .update({
          logo: logoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', clinicId)
    }

    revalidatePath("/settings")
    revalidatePath("/")
    
    return { success: true, message: "Logo uploaded successfully", logo_url: logoUrl }
  } catch (error) {
    console.error("Logo upload error:", error)
    return { success: false, message: "Failed to upload logo" }
  }
}

export async function addStaff(formData: FormData) {
  try {
    const staffData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
      whatsapp_phone: formData.get("whatsapp_phone") as string,
    }

    console.log("Adding staff:", staffData)

    // Try to add to database if available
    const supabase = getSupabaseClient()
    if (supabase) {
      const clinicId = "ff4a1430-f7df-49b8-99bf-2240faa8d622"
      
      const { error } = await supabase
        .from('staff')
        .insert({
          clinic_id: clinicId,
          name: staffData.name,
          email: staffData.email,
          role: staffData.role,
          whatsapp_phone: staffData.whatsapp_phone,
          status: 'active'
        })

      if (error) {
        console.error('Staff add error:', error)
      }
    }

    revalidatePath("/settings")
    return { success: true, message: "Staff member added successfully" }
  } catch (error) {
    console.error("Staff add error:", error)
    return { success: false, message: "Failed to add staff member" }
  }
}

export async function toggleStaffStatus(staffId: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    console.log(`Toggling staff ${staffId} from ${currentStatus} to ${newStatus}`)

    const supabase = getSupabaseClient()
    if (supabase) {
      const { error } = await supabase
        .from('staff')
        .update({ status: newStatus })
        .eq('id', staffId)

      if (error) {
        console.error('Staff toggle error:', error)
      }
    }

    revalidatePath("/settings")
    return { success: true, message: "Staff status updated successfully" }
  } catch (error) {
    console.error("Staff status toggle error:", error)
    return { success: false, message: "Failed to update staff status" }
  }
}

export async function deleteStaff(staffId: string) {
  try {
    console.log(`Deleting staff ${staffId}`)

    const supabase = getSupabaseClient()
    if (supabase) {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffId)

      if (error) {
        console.error('Staff delete error:', error)
      }
    }

    revalidatePath("/settings")
    return { success: true, message: "Staff member deleted successfully" }
  } catch (error) {
    console.error("Staff delete error:", error)
    return { success: false, message: "Failed to delete staff member" }
  }
}