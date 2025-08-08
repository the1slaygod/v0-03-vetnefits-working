"use client"
import { createClient } from "@supabase/supabase-js"
import SettingsClient from "./settings-client"

interface ClinicSettings {
  clinic_name: string
  clinic_phone: string
  clinic_email: string
  clinic_address: string
  clinic_logo: string
  subscription_status: "active" | "inactive" | "trial"
  subscription_plan: "monthly" | "yearly"
  subscription_valid_till: string
  theme: "light" | "dark"
  default_view: "dashboard" | "appointments" | "admit"
  modules: {
    vaccines: boolean
    compliance: boolean
    lab_reports: boolean
    otc_billing: boolean
  }
}

interface StaffMember {
  id: string
  name: string
  email: string
  role: "doctor" | "receptionist" | "admin"
  status: "active" | "inactive"
  created_at: string
}

async function getClinicSettings() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        settings: {
          clinic_name: "Vetnefits Animal Hospital",
          clinic_phone: "+91 98765 43210",
          clinic_email: "admin@vetnefits.com",
          clinic_address: "123 Pet Street, Animal City, AC 12345",
          clinic_logo: "/images/clinic-logo.png",
          subscription_status: "trial" as const,
          subscription_plan: "monthly" as const,
          subscription_valid_till: "",
          theme: "light" as const,
          default_view: "dashboard" as const,
          modules: {
            vaccines: true,
            compliance: true,
            lab_reports: true,
            otc_billing: true,
          },
        },
        staff: [],
      }
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const clinicId = "default-clinic-id"

    // Get clinic settings
    const { data: settingsData } = await supabase.from("clinic_settings").select("*").eq("clinic_id", clinicId).single()

    // Get staff data
    const { data: staffData } = await supabase
      .from("clinic_staff")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })

    const settings = settingsData || {
      clinic_name: "Vetnefits Animal Hospital",
      clinic_phone: "+91 98765 43210",
      clinic_email: "admin@vetnefits.com",
      clinic_address: "123 Pet Street, Animal City, AC 12345",
      clinic_logo: "/images/clinic-logo.png",
      subscription_status: "trial" as const,
      subscription_plan: "monthly" as const,
      subscription_valid_till: "",
      theme: "light" as const,
      default_view: "dashboard" as const,
      modules: {
        vaccines: true,
        compliance: true,
        lab_reports: true,
        otc_billing: true,
      },
    }

    return {
      settings,
      staff: staffData || [],
    }
  } catch (error) {
    console.error("Error loading settings:", error)
    return {
      settings: {
        clinic_name: "Vetnefits Animal Hospital",
        clinic_phone: "+91 98765 43210",
        clinic_email: "admin@vetnefits.com",
        clinic_address: "123 Pet Street, Animal City, AC 12345",
        clinic_logo: "/images/clinic-logo.png",
        subscription_status: "trial" as const,
        subscription_plan: "monthly" as const,
        subscription_valid_till: "",
        theme: "light" as const,
        default_view: "dashboard" as const,
        modules: {
          vaccines: true,
          compliance: true,
          lab_reports: true,
          otc_billing: true,
        },
      },
      staff: [],
    }
  }
}

async function saveSettings(formData: FormData) {
  "use server"

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing")
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const clinicId = "default-clinic-id"

    const settings = {
      clinic_id: clinicId,
      clinic_name: formData.get("clinic_name") as string,
      clinic_phone: formData.get("clinic_phone") as string,
      clinic_email: formData.get("clinic_email") as string,
      clinic_address: formData.get("clinic_address") as string,
      clinic_logo: formData.get("clinic_logo") as string,
      theme: formData.get("theme") as string,
      default_view: formData.get("default_view") as string,
      modules: {
        vaccines: formData.get("modules_vaccines") === "on",
        compliance: formData.get("modules_compliance") === "on",
        lab_reports: formData.get("modules_lab_reports") === "on",
        otc_billing: formData.get("modules_otc_billing") === "on",
      },
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("clinic_settings").upsert(settings, { onConflict: "clinic_id" })

    if (error) throw error

    return { success: true, message: "Settings saved successfully" }
  } catch (error) {
    console.error("Error saving settings:", error)
    return { success: false, message: "Failed to save settings" }
  }
}

async function addStaff(formData: FormData) {
  "use server"

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing")
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const clinicId = "default-clinic-id"

    const { error } = await supabase.from("clinic_staff").insert({
      clinic_id: clinicId,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
      status: "active",
    })

    if (error) throw error

    return { success: true, message: "Staff member added successfully" }
  } catch (error) {
    console.error("Error adding staff:", error)
    return { success: false, message: "Failed to add staff member" }
  }
}

async function toggleStaffStatus(staffId: string, currentStatus: string) {
  "use server"

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing")
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const newStatus = currentStatus === "active" ? "inactive" : "active"

    const { error } = await supabase.from("clinic_staff").update({ status: newStatus }).eq("id", staffId)

    if (error) throw error

    return { success: true, message: `Staff member ${newStatus}` }
  } catch (error) {
    console.error("Error updating staff status:", error)
    return { success: false, message: "Failed to update staff status" }
  }
}

async function deleteStaff(staffId: string) {
  "use server"

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing")
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { error } = await supabase.from("clinic_staff").delete().eq("id", staffId)

    if (error) throw error

    return { success: true, message: "Staff member deleted successfully" }
  } catch (error) {
    console.error("Error deleting staff:", error)
    return { success: false, message: "Failed to delete staff member" }
  }
}

export default async function Settings() {
  const { settings, staff } = await getClinicSettings()

  return (
    <SettingsClient
      initialSettings={settings}
      initialStaff={staff}
      saveSettings={saveSettings}
      addStaff={addStaff}
      toggleStaffStatus={toggleStaffStatus}
      deleteStaff={deleteStaff}
    />
  )
}
