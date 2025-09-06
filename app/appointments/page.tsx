import { Suspense } from "react"
import AppointmentsClient from "./appointments-client"
import { getAllAppointments } from "../actions/appointment-actions"

export default async function AppointmentsPage() {
  const appointments = await getAllAppointments()

  return (
    <div>
      <Suspense fallback={<div>Loading appointments...</div>}>
        <AppointmentsClient initialAppointments={appointments} />
      </Suspense>
    </div>
  )
}