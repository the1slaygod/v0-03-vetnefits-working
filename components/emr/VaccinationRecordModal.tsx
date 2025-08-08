"use client"

import type React from "react"

import { useState } from "react"
import { X, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PatientRecord, VaccinationRecord } from "../../app/emr/page"

interface VaccinationRecordModalProps {
  patients: PatientRecord[]
  selectedPatient: PatientRecord | null
  onSave: (vaccination: Omit<VaccinationRecord, "id" | "createdAt">) => void
  onClose: () => void
}

export default function VaccinationRecordModal({
  patients,
  selectedPatient,
  onSave,
  onClose,
}: VaccinationRecordModalProps) {
  const [formData, setFormData] = useState({
    patientId: selectedPatient?.id || "",
    vaccineName: "",
    manufacturer: "",
    lotNumber: "",
    dateAdministered: new Date().toISOString().split("T")[0],
    expirationDate: "",
    doctorName: "",
    nextDueDate: "",
    reactions: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      nextDueDate: formData.nextDueDate || undefined,
      reactions: formData.reactions || undefined,
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Add Vaccination Record</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
              <Select
                value={formData.patientId}
                onValueChange={(value) => handleChange("patientId", value)}
                disabled={!!selectedPatient}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} - {patient.ownerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Name</label>
              <Select value={formData.vaccineName} onValueChange={(value) => handleChange("vaccineName", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vaccine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DHPP">DHPP</SelectItem>
                  <SelectItem value="FVRCP">FVRCP</SelectItem>
                  <SelectItem value="Rabies">Rabies</SelectItem>
                  <SelectItem value="Bordetella">Bordetella</SelectItem>
                  <SelectItem value="Lyme">Lyme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <Input
                value={formData.manufacturer}
                onChange={(e) => handleChange("manufacturer", e.target.value)}
                placeholder="e.g., Zoetis, Merial"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lot Number</label>
              <Input
                value={formData.lotNumber}
                onChange={(e) => handleChange("lotNumber", e.target.value)}
                placeholder="Lot number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Administered</label>
              <Input
                type="date"
                value={formData.dateAdministered}
                onChange={(e) => handleChange("dateAdministered", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
              <Input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => handleChange("expirationDate", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
              <Select value={formData.doctorName} onValueChange={(value) => handleChange("doctorName", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. Sarah Wilson">Dr. Sarah Wilson</SelectItem>
                  <SelectItem value="Dr. Mike Davis">Dr. Mike Davis</SelectItem>
                  <SelectItem value="Dr. Lisa Garcia">Dr. Lisa Garcia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date</label>
              <Input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => handleChange("nextDueDate", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reactions (if any)</label>
            <Textarea
              value={formData.reactions}
              onChange={(e) => handleChange("reactions", e.target.value)}
              placeholder="Any adverse reactions observed..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Vaccination
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
