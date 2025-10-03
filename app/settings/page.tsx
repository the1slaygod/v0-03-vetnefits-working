import type { Metadata } from "next"
import ClinicSettingsClient from "./clinic-settings-client"

export const metadata: Metadata = {
  title: "Clinic Settings | Vetnefits",
  description: "Manage your clinic's information and settings",
}

export default function SettingsPage() {
  return <ClinicSettingsClient />
}
