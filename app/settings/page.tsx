import { createClient } from "@supabase/supabase-js";
import SettingsClient from "./settings-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const clinicId = "default-clinic-id";

export async function saveSettings(settings: any) {
  try {
    await supabase
      .from("clinic_settings")
      .upsert(
        { ...settings, clinic_id: clinicId },
        { onConflict: "clinic_id" }
      );

    return { success: true, message: "Settings saved successfully." };
  } catch (error) {
    console.error("Error saving settings:", error);
    return { success: false, message: "Failed to save settings." };
  }
}

export async function addStaff(staffMember: any) {
  try {
    await supabase
      .from("clinic_staff")
      .insert([{ ...staffMember, clinic_id: clinicId }]);
    return { success: true, message: "Staff member added successfully." };
  } catch (error) {
    console.error("Error adding staff member:", error);
    return { success: false, message: "Failed to add staff member." };
  }
}

export async function toggleStaffStatus(
  staffId: string,
  currentStatus: string
) {
  try {
    const newStatus: "active" | "inactive" =
      currentStatus === "active" ? "inactive" : "active";
    await supabase
      .from("clinic_staff")
      .update({ status: newStatus })
      .eq("id", staffId)
      .eq("clinic_id", clinicId);

    return { success: true, message: "Staff status updated successfully." };
  } catch (error) {
    console.error("Error toggling staff status:", error);
    return { success: false, message: "Failed to update staff status." };
  }
}

export async function deleteStaff(staffId: string) {
  try {
    await supabase
      .from("clinic_staff")
      .delete()
      .eq("id", staffId)
      .eq("clinic_id", clinicId);

    return { success: true, message: "Staff member deleted successfully." };
  } catch (error) {
    console.error("Error deleting staff member:", error);
    return { success: false, message: "Failed to delete staff member." };
  }
}

export async function getClinicSettings() {
  try {
    const { data: settingsData, error: settingsError } = await supabase
      .from("clinic_settings")
      .select("*")
      .eq("clinic_id", clinicId)
      .single();

    if (settingsError && settingsError.code !== "PGRST116") {
      console.error("Error fetching clinic settings:", settingsError);
    }

    const { data: staffData, error: staffError } = await supabase
      .from("clinic_staff")
      .select("*")
      .eq("clinic_id", clinicId);

    if (staffError) {
      console.error("Error fetching clinic staff:", staffError);
    }

    const defaultSettings = {
      subscription_status: "trial",
      subscription_plan: "monthly",
      clinic_name: "",
      clinic_phone: "",
      clinic_email: "",
      clinic_address: "",
      clinic_logo: "",
      theme: "light",
      default_view: "dashboard",
      modules: {
        vaccines: false,
        compliance: false,
        lab_reports: false,
        otc_billing: false,
      },
    };

    const settings = {
      ...defaultSettings,
      ...(settingsData || {}),
      modules: {
        ...defaultSettings.modules,
        ...(typeof settingsData?.modules === "object" &&
        settingsData.modules !== null
          ? settingsData.modules
          : {}),
      },
    };

    const staff = staffData || [];

    return { settings, staff };
  } catch (error) {
    console.error("Unexpected error fetching clinic settings:", error);
    const defaultSettings = {
      subscription_status: "trial",
      subscription_plan: "monthly",
      clinic_name: "",
      clinic_phone: "",
      clinic_email: "",
      clinic_address: "",
      clinic_logo: "",
      theme: "light",
      default_view: "dashboard",
      modules: {
        vaccines: false,
        compliance: false,
        lab_reports: false,
        otc_billing: false,
      },
    };
    return {
      settings: {
        ...defaultSettings,
        modules: {
          ...defaultSettings.modules,
        },
      },
      staff: [],
    };
  }
}

export default async function Settings() {
  const { settings, staff } = await getClinicSettings();

  return <SettingsClient initialSettings={settings} initialStaff={staff} />;
}
