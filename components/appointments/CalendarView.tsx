"use client"

import { FaPaw, FaUser } from "react-icons/fa"
import type { Appointment, Doctor } from "../../app/appointments/page"

interface CalendarViewProps {
  appointments: Appointment[]
  doctors: Doctor[]
  selectedDate: string
  onViewDetails: (appointment: Appointment) => void
  onEdit: (appointment: Appointment) => void
  onTimeSlotClick: (time: string) => void
}

export default function CalendarView({
  appointments,
  doctors,
  selectedDate,
  onViewDetails,
  onEdit,
  onTimeSlotClick,
}: CalendarViewProps) {
  // Generate time slots from 8 AM to 6 PM
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
      slots.push(`${hour.toString().padStart(2, "0")}:30`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-yellow-100 border-yellow-300 text-yellow-800"
      case "Completed":
        return "bg-green-100 border-green-300 text-green-800"
      case "Cancelled":
        return "bg-red-100 border-red-300 text-red-800"
      case "No Show":
        return "bg-gray-100 border-gray-300 text-gray-800"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  // Group appointments by doctor and time
  const appointmentsByDoctorAndTime = appointments.reduce(
    (acc, appointment) => {
      const key = `${appointment.doctorId}-${appointment.time}`
      acc[key] = appointment
      return acc
    },
    {} as Record<string, Appointment>,
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Schedule for{" "}
          {new Date(selectedDate).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-px bg-gray-200">
            <div className="bg-gray-50 p-4 font-medium text-gray-900">Time</div>
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-gray-50 p-4">
                <div className="font-medium text-gray-900">{doctor.name}</div>
                <div className="text-sm text-gray-600">{doctor.specialization}</div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div className="divide-y divide-gray-200">
            {timeSlots.map((timeSlot) => (
              <div
                key={timeSlot}
                className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-px bg-gray-200 min-h-[80px]"
              >
                {/* Time column */}
                <div className="bg-white p-4 flex items-center justify-center font-medium text-gray-700">
                  {formatTime(timeSlot)}
                </div>

                {/* Doctor columns */}
                {doctors.map((doctor) => {
                  const appointmentKey = `${doctor.id}-${timeSlot}`
                  const appointment = appointmentsByDoctorAndTime[appointmentKey]

                  return (
                    <div
                      key={doctor.id}
                      className="bg-white p-2 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        if (appointment) {
                          onViewDetails(appointment)
                        } else {
                          onTimeSlotClick(timeSlot)
                        }
                      }}
                    >
                      {appointment ? (
                        <div className={`p-3 rounded-lg border-2 h-full ${getStatusColor(appointment.status)}`}>
                          <div className="flex items-center mb-1">
                            <FaPaw className="h-3 w-3 mr-1" />
                            <span className="font-medium text-sm truncate">{appointment.petName}</span>
                          </div>
                          <div className="flex items-center mb-1">
                            <FaUser className="h-3 w-3 mr-1" />
                            <span className="text-xs truncate">{appointment.ownerName}</span>
                          </div>
                          <div className="text-xs font-medium">{appointment.type}</div>
                          <div className="text-xs">{appointment.duration}min</div>
                          {appointment.status === "Upcoming" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onEdit(appointment)
                              }}
                              className="mt-1 text-xs underline hover:no-underline"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <span className="text-xs">Available</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
            <span>Upcoming</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
            <span>Cancelled</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
            <span>No Show</span>
          </div>
        </div>
      </div>
    </div>
  )
}
