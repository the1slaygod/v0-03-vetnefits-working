"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FaTimes, FaExclamationTriangle } from "react-icons/fa"
import type { Appointment, Pet, Doctor, Clinic } from "../../app/appointments/page"

interface BookAppointmentModalProps {
  appointment?: Appointment | null
  pets: Pet[]
  doctors: Doctor[]
  clinics: Clinic[]
  onSave: (appointment: any) => void
  onClose: () => void
  isTimeSlotAvailable: (doctorId: string, date: string, time: string, duration: number, excludeId?: string) => boolean
}

export default function BookAppointmentModal({
  appointment,
  pets,
  doctors,
  clinics,
  onSave,
  onClose,
  isTimeSlotAvailable,
}: BookAppointmentModalProps) {
  const [formData, setFormData] = useState({
    petId: "",
    doctorId: "",
    clinicId: "",
    type: "Consultation" as "Consultation" | "Surgery" | "Vaccination" | "Grooming" | "Emergency",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    duration: 30,
    notes: "",
    symptoms: "",
    status: "Upcoming" as "Upcoming" | "Completed" | "Cancelled" | "No Show",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)

  useEffect(() => {
    if (appointment) {
      setFormData({
        petId: appointment.petId,
        doctorId: appointment.doctorId,
        clinicId: appointment.clinicId,
        type: appointment.type,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        notes: appointment.notes || "",
        symptoms: appointment.symptoms || "",
        status: appointment.status,
      })
    }
  }, [appointment])

  useEffect(() => {
    if (formData.petId) {
      const pet = pets.find((p) => p.id === formData.petId)
      setSelectedPet(pet || null)
    } else {
      setSelectedPet(null)
    }
  }, [formData.petId, pets])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseInt(value) || 0 : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.petId) newErrors.petId = "Please select a pet"
    if (!formData.doctorId) newErrors.doctorId = "Please select a doctor"
    if (!formData.clinicId) newErrors.clinicId = "Please select a clinic"
    if (!formData.date) newErrors.date = "Please select a date"
    if (!formData.time) newErrors.time = "Please select a time"
    if (formData.duration < 15) newErrors.duration = "Duration must be at least 15 minutes"

    // Check for double booking
    if (formData.doctorId && formData.date && formData.time && formData.duration) {
      if (!isTimeSlotAvailable(formData.doctorId, formData.date, formData.time, formData.duration, appointment?.id)) {
        newErrors.time = "This time slot is already booked for the selected doctor"
      }
    }

    // Check if appointment is in the past
    const appointmentDateTime = new Date(`${formData.date}T${formData.time}:00`)
    if (appointmentDateTime < new Date() && !appointment) {
      newErrors.date = "Cannot book appointments in the past"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const selectedPetData = pets.find((p) => p.id === formData.petId)
    const selectedDoctorData = doctors.find((d) => d.id === formData.doctorId)
    const selectedClinicData = clinics.find((c) => c.id === formData.clinicId)

    if (!selectedPetData || !selectedDoctorData || !selectedClinicData) return

    const appointmentData = {
      ...formData,
      petName: selectedPetData.name,
      petType: selectedPetData.species,
      petBreed: selectedPetData.breed,
      ownerId: selectedPetData.ownerId,
      ownerName: selectedPetData.ownerName,
      ownerPhone: selectedPetData.ownerPhone,
      doctorName: selectedDoctorData.name,
      clinicName: selectedClinicData.name,
      ...(appointment && { id: appointment.id }),
    }

    onSave(appointmentData)
  }

  const getDefaultDuration = (type: string) => {
    switch (type) {
      case "Surgery":
        return 120
      case "Grooming":
        return 45
      case "Vaccination":
        return 15
      case "Emergency":
        return 60
      case "Consultation":
      default:
        return 30
    }
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value
    setFormData((prev) => ({
      ...prev,
      type: newType as any,
      duration: getDefaultDuration(newType),
    }))
  }

  // Filter doctors by selected clinic
  const availableDoctors = doctors.filter((doctor) =>
    formData.clinicId === "" ? true : doctor.clinicId === formData.clinicId,
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {appointment ? "Edit Appointment" : "Book New Appointment"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Pet Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pet *</label>
            <select
              name="petId"
              value={formData.petId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.petId ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">Select a pet...</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} - {pet.species} ({pet.ownerName})
                </option>
              ))}
            </select>
            {errors.petId && <p className="mt-1 text-sm text-red-600">{errors.petId}</p>}
          </div>

          {/* Owner Info (Auto-filled) */}
          {selectedPet && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Owner Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {selectedPet.ownerName}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {selectedPet.ownerPhone}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {selectedPet.ownerEmail}
                </div>
                <div>
                  <span className="font-medium">Pet Details:</span> {selectedPet.age} year old {selectedPet.gender}{" "}
                  {selectedPet.breed}
                </div>
              </div>
            </div>
          )}

          {/* Clinic and Doctor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinic *</label>
              <select
                name="clinicId"
                value={formData.clinicId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.clinicId ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Select clinic...</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
              {errors.clinicId && <p className="mt-1 text-sm text-red-600">{errors.clinicId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.doctorId ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Select doctor...</option>
                {availableDoctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
              {errors.doctorId && <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>}
            </div>
          </div>

          {/* Appointment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Consultation">Consultation</option>
              <option value="Surgery">Surgery</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Grooming">Grooming</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.time ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.time && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <FaExclamationTriangle className="mr-1 h-3 w-3" />
                  {errors.time}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="15"
                step="15"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.duration ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
            </div>
          </div>

          {/* Status (only for editing) */}
          {appointment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="No Show">No Show</option>
              </select>
            </div>
          )}

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms/Reason for Visit</label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the pet's symptoms or reason for the visit..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any additional notes or special instructions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {appointment ? "Update Appointment" : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
