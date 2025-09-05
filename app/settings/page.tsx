import { createClient } from "@supabase/supabase-js"
import SettingsClient from "./settings-client"
import { saveSettings, addStaff, toggleStaffStatus, deleteStaff } from "./actions"

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

    // Check if we have a valid Supabase URL format
    const isValidUrl = supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')
    
    if (!supabaseUrl || !supabaseAnonKey || !isValidUrl) {
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

export default async function SettingsPage() {
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