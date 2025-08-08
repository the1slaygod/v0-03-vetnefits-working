"use client"

import type { Clinic, Doctor } from "../../app/appointments/page"

interface AppointmentFiltersProps {
  filters: {
    clinicId: string
    doctorId: string
    type: string
    date: string
    status: string
  }
  onFiltersChange: (filters: any) => void
  clinics: Clinic[]
  doctors: Doctor[]
}

export default function AppointmentFilters({ filters, onFiltersChange, clinics, doctors }: AppointmentFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }

    // Reset doctor filter when clinic changes
    if (key === "clinicId" && value !== filters.clinicId) {
      newFilters.doctorId = "all"
    }

    onFiltersChange(newFilters)
  }

  const appointmentTypes = ["Consultation", "Surgery", "Vaccination", "Grooming", "Emergency"]
  const statusOptions = ["Upcoming", "Completed", "Cancelled", "No Show"]

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Clinic Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clinic</label>
          <select
            value={filters.clinicId}
            onChange={(e) => handleFilterChange("clinicId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Clinics</option>
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>
        </div>

        {/* Doctor Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
          <select
            value={filters.doctorId}
            onChange={(e) => handleFilterChange("doctorId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Doctors</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {appointmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Date Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange("date", new Date().toISOString().split("T")[0])}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filters.date === new Date().toISOString().split("T")[0]
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            handleFilterChange("date", tomorrow.toISOString().split("T")[0])
          }}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filters.date === new Date(Date.now() + 86400000).toISOString().split("T")[0]
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Tomorrow
        </button>
        <button
          onClick={() => {
            const nextWeek = new Date()
            nextWeek.setDate(nextWeek.getDate() + 7)
            handleFilterChange("date", nextWeek.toISOString().split("T")[0])
          }}
          className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        >
          Next Week
        </button>
      </div>
    </div>
  )
}
