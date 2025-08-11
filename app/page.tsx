import { saveSettings, addStaff, toggleStaffStatus, deleteStaff } from "./settings/actions";
import SettingsClient from "./settings/settings-client";
import { createClient } from "@supabase/supabase-js";

async function getClinicSettings() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const clinicId = "default-clinic-id";

  const { data: settingsData } = await supabase
    .from("clinic_settings")
    .select("*")
    .eq("clinic_id", clinicId)
    .single();

  const { data: staffData } = await supabase
    .from("clinic_staff")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  return {
    settings: settingsData || {},
    staff: staffData || [],
  };
}

export default async function Settings() {
  const { settings, staff } = await getClinicSettings();

  return (
    <SettingsClient
      initialSettings={settings}
      initialStaff={staff}
      saveSettings={saveSettings}
      addStaff={addStaff}
      toggleStaffStatus={toggleStaffStatus}
      deleteStaff={deleteStaff}
    />
  );
}
