"use client"

import { useState } from "react"
import AppointmentFilters from "../../components/appointments/AppointmentFilters"
import AppointmentList from "../../components/appointments/AppointmentList"
import CalendarView from "../../components/appointments/CalendarView"
import BookAppointmentModal from "../../components/appointments/BookAppointmentModal"
import AppointmentDetailsModal from "../../components/appointments/AppointmentDetailsModal"
import { FaPlus, FaCalendarAlt, FaList } from "react-icons/fa"

export interface Appointment {
  id: string
  petId: string
  petName: string
  petType: string
  petBreed: string
  ownerId: string
  ownerName: string
  ownerPhone: string
  doctorId: string
  doctorName: string
  type: "Consultation" | "Surgery" | "Vaccination" | "Grooming" | "Emergency"
  date: string
  time: string
  duration: number
  status: "Upcoming" | "Completed" | "Cancelled" | "No Show"
  clinicId: string
  clinicName: string
  notes?: string
  symptoms?: string
  createdAt: string
  updatedAt: string
}

export interface Doctor {
  id: string
  name: string
  specialization: string
  email: string
  phone: string
  clinicId: string
  isAvailable: boolean
}

export interface Pet {
  id: string
  name: string
  species: string
  breed: string
  age: number
  gender: string
  ownerId: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string
}

export interface Clinic {
  id: string
  name: string
  address: string
  phone: string
}

export default function AppointmentsPage() {
  const [view, setView] = useState<"list" | "calendar">("list")
  const [showBookModal, setShowBookModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  // Filters
  const [filters, setFilters] = useState({
    clinicId: "all",
    doctorId: "all",
    type: "all",
    date: new Date().toISOString().split("T")[0],
    status: "all",
  })

  // Mock data
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      petId: "pet1",
      petName: "Buddy",
      petType: "Dog",
      petBreed: "Golden Retriever",
      ownerId: "owner1",
      ownerName: "John Smith",
      ownerPhone: "+1 (555) 123-4567",
      doctorId: "doc1",
      doctorName: "Dr. Sarah Wilson",
      type: "Consultation",
      date: "2024-01-25",
      time: "09:00",
      duration: 30,
      status: "Upcoming",
      clinicId: "clinic1",
      clinicName: "Main Clinic",
      notes: "Regular checkup",
      symptoms: "Seems lethargic lately",
      createdAt: "2024-01-20T10:00:00Z",
      updatedAt: "2024-01-20T10:00:00Z",
    },
    {
      id: "2",
      petId: "pet2",
      petName: "Whiskers",
      petType: "Cat",
      petBreed: "Persian",
      ownerId: "owner2",
      ownerName: "Sarah Johnson",
      ownerPhone: "+1 (555) 987-6543",
      doctorId: "doc2",
      doctorName: "Dr. Mike Davis",
      type: "Vaccination",
      date: "2024-01-25",
      time: "10:30",
      duration: 15,
      status: "Upcoming",
      clinicId: "clinic1",
      clinicName: "Main Clinic",
      notes: "Annual vaccination",
      createdAt: "2024-01-20T11:00:00Z",
      updatedAt: "2024-01-20T11:00:00Z",
    },
  ])

  const [doctors] = useState<Doctor[]>([
    {
      id: "doc1",
      name: "Dr. Sarah Wilson",
      specialization: "General Practice",
      email: "sarah@clinic.com",
      phone: "+1 (555) 111-2222",
      clinicId: "clinic1",
      isAvailable: true,
    },
    {
      id: "doc2",
      name: "Dr. Mike Davis",
      specialization: "Surgery",
      email: "mike@clinic.com",
      phone: "+1 (555) 333-4444",
      clinicId: "clinic1",
      isAvailable: true,
    },
  ])

  const [pets] = useState<Pet[]>([
    {
      id: "pet1",
      name: "Buddy",
      species: "Dog",
      breed: "Golden Retriever",
      age: 3,
      gender: "Male",
      ownerId: "owner1",
      ownerName: "John Smith",
      ownerPhone: "+1 (555) 123-4567",
      ownerEmail: "john@example.com",
    },
  ])

  const [clinics] = useState<Clinic[]>([
    {
      id: "clinic1",
      name: "Main Clinic",
      address: "123 Main St, City, State 12345",
      phone: "+1 (555) 100-0001",
    },
  ])

  // Filter appointments based on current filters
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesClinic = filters.clinicId === "all" || appointment.clinicId === filters.clinicId
    const matchesDoctor = filters.doctorId === "all" || appointment.doctorId === filters.doctorId
    const matchesType = filters.type === "all" || appointment.type === filters.type
    const matchesDate = appointment.date === filters.date
    const matchesStatus = filters.status === "all" || appointment.status === filters.status

    return matchesClinic && matchesDoctor && matchesType && matchesDate && matchesStatus
  })

  // Get available doctors for selected clinic
  const availableDoctors = doctors.filter((doctor) =>
    filters.clinicId === "all" ? true : doctor.clinicId === filters.clinicId,
  )

  const handleBookAppointment = (appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setAppointments([...appointments, newAppointment])
    setShowBookModal(false)
  }

  const handleUpdateAppointment = (updatedAppointment: Appointment) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === updatedAppointment.id ? { ...updatedAppointment, updatedAt: new Date().toISOString() } : apt,
      ),
    )
    setEditingAppointment(null)
    setShowDetailsModal(false)
  }

  const handleCancelAppointment = (id: string) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: "Cancelled" as const, updatedAt: new Date().toISOString() } : apt,
      ),
    )
  }

  const handleCompleteAppointment = (id: string) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: "Completed" as const, updatedAt: new Date().toISOString() } : apt,
      ),
    )
  }

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setShowBookModal(true)
  }

  // Check for double booking
  const isTimeSlotAvailable = (doctorId: string, date: string, time: string, duration: number, excludeId?: string) => {
    const appointmentStart = new Date(`${date}T${time}:00`)
    const appointmentEnd = new Date(appointmentStart.getTime() + duration * 60000)

    return !appointments.some((apt) => {
      if (apt.id === excludeId) return false
      if (apt.doctorId !== doctorId || apt.date !== date) return false
      if (apt.status === "Cancelled") return false

      const existingStart = new Date(`${apt.date}T${apt.time}:00`)
      const existingEnd = new Date(existingStart.getTime() + apt.duration * 60000)

      return (
        (appointmentStart >= existingStart && appointmentStart < existingEnd) ||
        (appointmentEnd > existingStart && appointmentEnd <= existingEnd) ||
        (appointmentStart <= existingStart && appointmentEnd >= existingEnd)
      )
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">Manage your clinic's appointment schedule</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex bg-white rounded-lg shadow-sm border">
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded-l-lg flex items-center transition-colors ${
                view === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaList className="mr-2" />
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-4 py-2 rounded-r-lg flex items-center transition-colors ${
                view === "calendar" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaCalendarAlt className="mr-2" />
              Calendar
            </button>
          </div>
          <button
            onClick={() => setShowBookModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Filters */}
      <AppointmentFilters filters={filters} onFiltersChange={setFilters} clinics={clinics} doctors={availableDoctors} />

      {/* Content */}
      <div className="mt-6">
        {view === "list" ? (
          <AppointmentList
            appointments={filteredAppointments}
            onViewDetails={handleViewDetails}
            onEdit={handleEditAppointment}
            onCancel={handleCancelAppointment}
            onComplete={handleCompleteAppointment}
          />
        ) : (
          <CalendarView
            appointments={filteredAppointments}
            doctors={availableDoctors}
            selectedDate={filters.date}
            onViewDetails={handleViewDetails}
            onEdit={handleEditAppointment}
            onTimeSlotClick={(time) => {
              // Auto-fill time when clicking on calendar slot
              setShowBookModal(true)
            }}
          />
        )}
      </div>

      {/* Modals */}
      {showBookModal && (
        <BookAppointmentModal
          appointment={editingAppointment}
          pets={pets}
          doctors={doctors}
          clinics={clinics}
          onSave={editingAppointment ? handleUpdateAppointment : handleBookAppointment}
          onClose={() => {
            setShowBookModal(false)
            setEditingAppointment(null)
          }}
          isTimeSlotAvailable={isTimeSlotAvailable}
        />
      )}

      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedAppointment(null)
          }}
          onEdit={() => {
            setEditingAppointment(selectedAppointment)
            setShowDetailsModal(false)
            setShowBookModal(true)
          }}
          onCancel={() => handleCancelAppointment(selectedAppointment.id)}
          onComplete={() => handleCompleteAppointment(selectedAppointment.id)}
        />
      )}
    </div>
  )
}
