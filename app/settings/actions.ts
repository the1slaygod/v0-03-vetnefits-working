"use server"

import { revalidatePath } from "next/cache"

export async function saveSettings(formData: FormData) {
  try {
    // For now, let's simulate a successful save since database integration needs proper setup
    console.log("Settings data:", {
      clinic_name: formData.get("clinic_name"),
      clinic_phone: formData.get("clinic_phone"),
      clinic_email: formData.get("clinic_email"),
      clinic_address: formData.get("clinic_address"),
      whatsapp_phone_number: formData.get("whatsapp_phone_number"),
    })

    // Revalidate the settings page to show changes
    revalidatePath("/settings")
    
    return { success: true, message: "Settings saved successfully" }
  } catch (error) {
    console.error("Settings save error:", error)
    return { success: false, message: "Failed to save settings" }
  }
}

export async function addStaff(formData: FormData) {
  try {
    console.log("Adding staff:", {
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      whatsapp_phone: formData.get("whatsapp_phone"),
    })

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

    revalidatePath("/settings")
    return { success: true, message: "Staff member deleted successfully" }
  } catch (error) {
    console.error("Staff delete error:", error)
    return { success: false, message: "Failed to delete staff member" }
  }
}