"use server"

import { createClient } from "@supabase/supabase-js"

export async function saveSettings(formData: FormData) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, message: "Supabase configuration missing" }
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const clinicId = "default-clinic-id"

    const settingsData = {
      clinic_name: formData.get("clinic_name") as string,
      clinic_phone: formData.get("clinic_phone") as string,
      clinic_email: formData.get("clinic_email") as string,
      clinic_address: formData.get("clinic_address") as string,
      subscription_status: formData.get("subscription_status") as string,
      subscription_plan: formData.get("subscription_plan") as string,
      theme: formData.get("theme") as string,
      default_view: formData.get("default_view") as string,
      modules: {
        vaccines: formData.get("modules.vaccines") === "on",
        compliance: formData.get("modules.compliance") === "on",
        lab_reports: formData.get("modules.lab_reports") === "on",
        otc_billing: formData.get("modules.otc_billing") === "on",
      },
    }

    const { error } = await supabase
      .from("clinic_settings")
      .upsert({ clinic_id: clinicId, ...settingsData })

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, message: error.message }
    }

    return { success: true, message: "Settings saved successfully" }
  } catch (error) {
    console.error("Settings save error:", error)
    return { success: false, message: "Failed to save settings" }
  }
}

export async function addStaff(formData: FormData) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, message: "Supabase configuration missing" }
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const clinicId = "default-clinic-id"

    const staffData = {
      clinic_id: clinicId,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
      status: "active",
    }

    const { error } = await supabase.from("clinic_staff").insert(staffData)

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, message: error.message }
    }

    return { success: true, message: "Staff member added successfully" }
  } catch (error) {
    console.error("Staff add error:", error)
    return { success: false, message: "Failed to add staff member" }
  }
}

export async function toggleStaffStatus(staffId: string, currentStatus: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, message: "Supabase configuration missing" }
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const newStatus = currentStatus === "active" ? "inactive" : "active"

    const { error } = await supabase
      .from("clinic_staff")
      .update({ status: newStatus })
      .eq("id", staffId)

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, message: error.message }
    }

    return { success: true, message: "Staff status updated successfully" }
  } catch (error) {
    console.error("Staff status toggle error:", error)
    return { success: false, message: "Failed to update staff status" }
  }
}

export async function deleteStaff(staffId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, message: "Supabase configuration missing" }
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { error } = await supabase.from("clinic_staff").delete().eq("id", staffId)

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, message: error.message }
    }

    return { success: true, message: "Staff member deleted successfully" }
  } catch (error) {
    console.error("Staff delete error:", error)
    return { success: false, message: "Failed to delete staff member" }
  }
}