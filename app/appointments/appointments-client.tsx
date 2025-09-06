"use client"

import { useState } from "react"
import AppointmentFilters from "../../components/appointments/AppointmentFilters"
import AppointmentList from "../../components/appointments/AppointmentList"
import CalendarView from "../../components/appointments/CalendarView"
import BookAppointmentModal from "../../components/appointments/BookAppointmentModal"
import AppointmentDetailsModal from "../../components/appointments/AppointmentDetailsModal"
import { FaPlus, FaCalendarAlt, FaList } from "react-icons/fa"
import { Appointment } from "../actions/appointment-actions"

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

interface AppointmentsClientProps {
  initialAppointments: Appointment[]
}

export default function AppointmentsClient({ initialAppointments }: AppointmentsClientProps) {
  const [view, setView] = useState<"list" | "calendar">("list")
  const [showBookModal, setShowBookModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)

  // Filters
  const [filters, setFilters] = useState({
    clinicId: "all",
    doctorId: "all",
    petType: "all",
    status: "all",
    dateRange: "today",
    searchTerm: "",
  })

  // Mock data for UI components (these would come from database in real implementation)
  const mockDoctors: Doctor[] = [
    {
      id: "1",
      name: "Dr. Sarah Wilson",
      specialization: "General Practice",
      email: "dr.wilson@vetnefits.com",
      phone: "+1 (555) 123-4567",
      clinicId: "ff4a1430-f7df-49b8-99bf-2240faa8d622",
      isAvailable: true,
    },
    {
      id: "2",
      name: "Dr. Michael Brown",
      specialization: "Surgery",
      email: "dr.brown@vetnefits.com",
      phone: "+1 (555) 987-6543",
      clinicId: "ff4a1430-f7df-49b8-99bf-2240faa8d622",
      isAvailable: true,
    },
  ]

  const mockClinics: Clinic[] = [
    {
      id: "ff4a1430-f7df-49b8-99bf-2240faa8d622",
      name: "Vetnefits Animal Hospital",
      address: "123 Pet Street, Animal City",
      phone: "+91 98765 43210",
    },
  ]

  const mockPets: Pet[] = [
    {
      id: "1",
      name: "Buddy",
      species: "Dog",
      breed: "Golden Retriever",
      age: 3,
      gender: "Male",
      ownerId: "1",
      ownerName: "John Smith",
      ownerPhone: "+91 98765 11111",
      ownerEmail: "john.smith@email.com",
    },
  ]

  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(apt => apt.date === today)
  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) > new Date() && apt.status !== "Cancelled"
  )

  const stats = [
    {
      title: "Today's Appointments",
      value: todayAppointments.length,
      color: "blue",
      icon: FaCalendarAlt,
    },
    {
      title: "This Week",
      value: appointments.filter(apt => {
        const aptDate = new Date(apt.date)
        const weekFromNow = new Date()
        weekFromNow.setDate(weekFromNow.getDate() + 7)
        return aptDate >= new Date() && aptDate <= weekFromNow
      }).length,
      color: "green",
      icon: FaList,
    },
    {
      title: "Pending",
      value: appointments.filter(apt => apt.status === "scheduled").length,
      color: "yellow",
      icon: FaCalendarAlt,
    },
    {
      title: "Completed",
      value: appointments.filter(apt => apt.status === "completed").length,
      color: "purple",
      icon: FaList,
    },
  ]

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesClinic = filters.clinicId === "all" || appointment.clinicId === filters.clinicId
    const matchesDoctor = filters.doctorId === "all" || appointment.doctorId === filters.doctorId
    const matchesPetType = filters.petType === "all" || appointment.petType.toLowerCase() === filters.petType.toLowerCase()
    const matchesStatus = filters.status === "all" || appointment.status.toLowerCase() === filters.status.toLowerCase()
    const matchesSearch = !filters.searchTerm || 
      appointment.petName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      appointment.ownerName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(filters.searchTerm.toLowerCase())

    let matchesDateRange = true
    if (filters.dateRange === "today") {
      matchesDateRange = appointment.date === today
    } else if (filters.dateRange === "week") {
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      const aptDate = new Date(appointment.date)
      matchesDateRange = aptDate >= new Date() && aptDate <= weekFromNow
    } else if (filters.dateRange === "month") {
      const monthFromNow = new Date()
      monthFromNow.setMonth(monthFromNow.getMonth() + 1)
      const aptDate = new Date(appointment.date)
      matchesDateRange = aptDate >= new Date() && aptDate <= monthFromNow
    }

    return matchesClinic && matchesDoctor && matchesPetType && matchesStatus && matchesSearch && matchesDateRange
  })

  const handleBookAppointment = (appointmentData: any) => {
    // This would typically make an API call to save the appointment
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      ...appointmentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setAppointments([...appointments, newAppointment])
    setShowBookModal(false)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setShowBookModal(true)
  }

  const handleUpdateAppointment = (updatedData: any) => {
    if (editingAppointment) {
      setAppointments(appointments.map(apt => 
        apt.id === editingAppointment.id 
          ? { ...apt, ...updatedData, updatedAt: new Date().toISOString() }
          : apt
      ))
      setEditingAppointment(null)
    }
    setShowBookModal(false)
  }

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, status: newStatus, updatedAt: new Date().toISOString() }
        : apt
    ))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your clinic appointments and schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaList className="inline mr-2" />
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === "calendar"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaCalendarAlt className="inline mr-2" />
              Calendar
            </button>
          </div>
          <button
            onClick={() => setShowBookModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaPlus />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-600">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <AppointmentFilters
        filters={filters}
        onFilterChange={setFilters}
        clinics={mockClinics}
        doctors={mockDoctors}
      />

      {/* Main Content */}
      {view === "list" ? (
        <AppointmentList
          appointments={filteredAppointments}
          onViewDetails={handleViewDetails}
          onEdit={handleEditAppointment}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <CalendarView
          appointments={filteredAppointments}
          onViewDetails={handleViewDetails}
          onEdit={handleEditAppointment}
          onBookAppointment={() => setShowBookModal(true)}
        />
      )}

      {/* Modals */}
      {showBookModal && (
        <BookAppointmentModal
          onClose={() => {
            setShowBookModal(false)
            setEditingAppointment(null)
          }}
          onBook={editingAppointment ? handleUpdateAppointment : handleBookAppointment}
          editingAppointment={editingAppointment}
          clinics={mockClinics}
          doctors={mockDoctors}
          pets={mockPets}
        />
      )}

      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setShowDetailsModal(false)}
          onEdit={() => {
            setEditingAppointment(selectedAppointment)
            setShowDetailsModal(false)
            setShowBookModal(true)
          }}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}