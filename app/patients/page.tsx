import { Suspense } from "react"
import PatientsClient from "./patients-client"
import { getAllPatientsWithPets } from "../actions/patient-actions"

export default async function PatientsPage() {
  const patientsWithPets = await getAllPatientsWithPets()

  return (
    <div className="p-6">
      <Suspense fallback={<div>Loading patients...</div>}>
        <PatientsClient initialPatients={patientsWithPets} />
      </Suspense>
    </div>
  )
}