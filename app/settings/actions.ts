"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const clinicId = "default-clinic-id";

export async function saveSettings(formData: FormData) {
  try {
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
    };

    const { error } = await supabase
      .from("clinic_settings")
      .upsert(settings, { onConflict: "clinic_id" });

    if (error) throw error;

    return { success: true, message: "Settings saved successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to save settings" };
  }
}

export async function addStaff(formData: FormData) {
  try {
    const { error } = await supabase.from("clinic_staff").insert({
      clinic_id: clinicId,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
      status: "active",
    });

    if (error) throw error;

    return { success: true, message: "Staff member added successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to add staff member" };
  }
}

export async function toggleStaffStatus(
  staffId: string,
  currentStatus: string
) {
  try {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("clinic_staff")
      .update({ status: newStatus })
      .eq("id", staffId);

    if (error) throw error;

    return { success: true, message: `Staff member ${newStatus}` };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update staff status" };
  }
}

export async function deleteStaff(staffId: string) {
  try {
    const { error } = await supabase
      .from("clinic_staff")
      .delete()
      .eq("id", staffId);
    if (error) throw error;

    return { success: true, message: "Staff member deleted successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete staff member" };
  }
}
