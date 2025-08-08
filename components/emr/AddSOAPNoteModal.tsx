"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { PatientRecord, SOAPNote } from "../../app/emr/page"

interface AddSOAPNoteModalProps {
  patients: PatientRecord[]
  selectedPatient: PatientRecord | null
  editingSOAP: SOAPNote | null
  onSave: (soapNote: Omit<SOAPNote, "id" | "createdAt"> | SOAPNote) => void
  onClose: () => void
}

export default function AddSOAPNoteModal({
  patients,
  selectedPatient,
  editingSOAP,
  onSave,
  onClose,
}: AddSOAPNoteModalProps) {
  const [formData, setFormData] = useState({
    patientId: selectedPatient?.id || "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    doctorName: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    followUpRequired: false,
    followUpDate: "",
  })

  useEffect(() => {
    if (editingSOAP) {
      setFormData({
        patientId: editingSOAP.patientId,
        date: editingSOAP.date,
        time: editingSOAP.time,
        doctorName: editingSOAP.doctorName,
        subjective: editingSOAP.subjective,
        objective: editingSOAP.objective,
        assessment: editingSOAP.assessment,
        plan: editingSOAP.plan,
        followUpRequired: editingSOAP.followUpRequired,
        followUpDate: editingSOAP.followUpDate || "",
      })
    }
  }, [editingSOAP])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingSOAP) {
      onSave({
        ...editingSOAP,
        ...formData,
        followUpDate: formData.followUpRequired ? formData.followUpDate : undefined,
      })
    } else {
      onSave({
        ...formData,
        followUpDate: formData.followUpRequired ? formData.followUpDate : undefined,
      })
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{editingSOAP ? "Edit SOAP Note" : "Add New SOAP Note"}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange("time", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subjective</label>
            <Textarea
              value={formData.subjective}
              onChange={(e) => handleChange("subjective", e.target.value)}
              placeholder="What the owner reports..."
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
            <Textarea
              value={formData.objective}
              onChange={(e) => handleChange("objective", e.target.value)}
              placeholder="Physical examination findings..."
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
            <Textarea
              value={formData.assessment}
              onChange={(e) => handleChange("assessment", e.target.value)}
              placeholder="Diagnosis or assessment..."
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <Textarea
              value={formData.plan}
              onChange={(e) => handleChange("plan", e.target.value)}
              placeholder="Treatment plan..."
              rows={3}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="followUp"
              checked={formData.followUpRequired}
              onCheckedChange={(checked) => handleChange("followUpRequired", checked)}
            />
            <label htmlFor="followUp" className="text-sm font-medium text-gray-700">
              Follow-up required
            </label>
          </div>

          {formData.followUpRequired && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
              <Input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => handleChange("followUpDate", e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              {editingSOAP ? "Update" : "Save"} SOAP Note
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
