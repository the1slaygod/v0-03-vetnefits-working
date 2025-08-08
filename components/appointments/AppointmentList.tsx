"use client"

import { FaEye, FaEdit, FaTimes, FaCheck, FaClock, FaUser, FaPaw } from "react-icons/fa"
import type { Appointment } from "../../app/appointments/page"

interface AppointmentListProps {
  appointments: Appointment[]
  onViewDetails: (appointment: Appointment) => void
  onEdit: (appointment: Appointment) => void
  onCancel: (id: string) => void
  onComplete: (id: string) => void
}

export default function AppointmentList({
  appointments,
  onViewDetails,
  onEdit,
  onCancel,
  onComplete,
}: AppointmentListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-yellow-100 text-yellow-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      case "No Show":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Surgery":
        return "bg-red-100 text-red-800"
      case "Emergency":
        return "bg-orange-100 text-orange-800"
      case "Vaccination":
        return "bg-purple-100 text-purple-800"
      case "Consultation":
        return "bg-blue-100 text-blue-800"
      case "Grooming":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60)
    const mins = duration % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // Group appointments by time
  const groupedAppointments = appointments.reduce(
    (groups, appointment) => {
      const timeKey = appointment.time
      if (!groups[timeKey]) {
        groups[timeKey] = []
      }
      groups[timeKey].push(appointment)
      return groups
    },
    {} as Record<string, Appointment[]>,
  )

  const sortedTimeSlots = Object.keys(groupedAppointments).sort()

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <FaClock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
        <p className="text-gray-600">No appointments match your current filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
          <div className="text-sm text-gray-600">Total Appointments</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">
            {appointments.filter((apt) => apt.status === "Upcoming").length}
          </div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {appointments.filter((apt) => apt.status === "Completed").length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">
            {appointments.filter((apt) => apt.status === "Cancelled").length}
          </div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {sortedTimeSlots.map((timeSlot) => (
          <div key={timeSlot} className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FaClock className="mr-2 text-gray-500" />
                {formatTime(timeSlot)}
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {groupedAppointments[timeSlot].map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center">
                          <FaPaw className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="font-medium text-gray-900">{appointment.petName}</span>
                          <span className="text-gray-500 ml-2">
                            ({appointment.petType} - {appointment.petBreed})
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaUser className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-gray-700">{appointment.ownerName}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Doctor:</span> {appointment.doctorName}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {formatDuration(appointment.duration)}
                        </div>
                        <div>
                          <span className="font-medium">Clinic:</span> {appointment.clinicName}
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </div>
                      )}

                      {appointment.symptoms && (
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-end space-y-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
                        >
                          {appointment.status}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}
                        >
                          {appointment.type}
                        </span>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => onViewDetails(appointment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        {appointment.status === "Upcoming" && (
                          <>
                            <button
                              onClick={() => onEdit(appointment)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onComplete(appointment.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark Completed"
                            >
                              <FaCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onCancel(appointment.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <FaTimes className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
