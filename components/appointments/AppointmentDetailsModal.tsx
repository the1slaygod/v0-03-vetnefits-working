"use client"

import { useState } from "react"
import { FaTimes, FaEdit, FaCheck, FaBan, FaClock, FaUser, FaPaw, FaStethoscope, FaFileInvoice } from "react-icons/fa"
import type { Appointment } from "../../app/appointments/page"

interface AppointmentDetailsModalProps {
  appointment: Appointment
  onClose: () => void
  onEdit: () => void
  onCancel: () => void
  onComplete: () => void
}

export default function AppointmentDetailsModal({
  appointment,
  onClose,
  onEdit,
  onCancel,
  onComplete,
}: AppointmentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "soap" | "invoice" | "timeline">("general")

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

  const tabs = [
    { id: "general", name: "General", icon: FaUser },
    { id: "soap", name: "SOAP Notes", icon: FaStethoscope },
    { id: "invoice", name: "Invoice", icon: FaFileInvoice },
    { id: "timeline", name: "Timeline", icon: FaClock },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Header Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FaPaw className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-xl font-semibold text-gray-900">{appointment.petName}</span>
                <span className="text-gray-500 ml-2">
                  ({appointment.petType} - {appointment.petBreed})
                </span>
              </div>
              <div className="flex space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(appointment.type)}`}>
                  {appointment.type}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              {appointment.status === "Upcoming" && (
                <>
                  <button
                    onClick={onEdit}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={onComplete}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaCheck className="mr-2" />
                    Complete
                  </button>
                  <button
                    onClick={onCancel}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <FaBan className="mr-2" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Date & Time:</span>
              <div className="text-gray-900">
                {new Date(appointment.date).toLocaleDateString()} at {formatTime(appointment.time)}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Duration:</span>
              <div className="text-gray-900">{formatDuration(appointment.duration)}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Doctor:</span>
              <div className="text-gray-900">{appointment.doctorName}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Clinic:</span>
              <div className="text-gray-900">{appointment.clinicName}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Pet & Owner Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <FaPaw className="mr-2 text-blue-600" />
                    Pet Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {appointment.petName}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {appointment.petType}
                    </div>
                    <div>
                      <span className="font-medium">Breed:</span> {appointment.petBreed}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <FaUser className="mr-2 text-green-600" />
                    Owner Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {appointment.ownerName}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {appointment.ownerPhone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Symptoms & Notes */}
              {appointment.symptoms && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Symptoms/Reason for Visit</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-800">{appointment.symptoms}</p>
                  </div>
                </div>
              )}

              {appointment.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Additional Notes</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-800">{appointment.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "soap" && (
            <div className="text-center py-12">
              <FaStethoscope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">SOAP Notes</h3>
              <p className="text-gray-600 mb-4">
                {appointment.status === "Completed"
                  ? "SOAP notes would be displayed here for completed appointments"
                  : "SOAP notes will be available after the appointment is completed"}
              </p>
              {appointment.status === "Completed" && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add SOAP Notes
                </button>
              )}
            </div>
          )}

          {activeTab === "invoice" && (
            <div className="text-center py-12">
              <FaFileInvoice className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice</h3>
              <p className="text-gray-600 mb-4">
                {appointment.status === "Completed"
                  ? "Invoice details would be displayed here"
                  : "Invoice will be generated after the appointment is completed"}
              </p>
              {appointment.status === "Completed" && (
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Generate Invoice
                </button>
              )}
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Appointment Created</div>
                    <div className="text-sm text-gray-600">{new Date(appointment.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                {appointment.updatedAt !== appointment.createdAt && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Appointment Updated</div>
                      <div className="text-sm text-gray-600">{new Date(appointment.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                )}
                {appointment.status === "Completed" && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Appointment Completed</div>
                      <div className="text-sm text-gray-600">{new Date(appointment.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                )}
                {appointment.status === "Cancelled" && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Appointment Cancelled</div>
                      <div className="text-sm text-gray-600">{new Date(appointment.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
