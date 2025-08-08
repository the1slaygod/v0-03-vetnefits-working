"use client"

import { useState } from "react"
import AdmissionFilters from "../../components/admissions/AdmissionFilters"
import AdmissionList from "../../components/admissions/AdmissionList"
import AdmitPetModal from "../../components/admissions/AdmitPetModal"
import DischargeModal from "../../components/admissions/DischargeModal"
import TreatmentTimelineModal from "../../components/admissions/TreatmentTimelineModal"
import { FaPlus, FaBed, FaUserMd, FaCalendarAlt } from "react-icons/fa"

export interface Admission {
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
  roomNumber: string
  admissionDate: string
  admissionTime: string
  reason: string
  status: "Active" | "Discharged" | "Transferred"
  estimatedDischarge?: string
  actualDischarge?: string
  totalBill: number
  dailyRate: number
  treatments: Treatment[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Treatment {
  id: string
  date: string
  time: string
  type: "Medication" | "Procedure" | "Observation" | "Surgery" | "Therapy"
  description: string
  doctorName: string
  cost: number
  status: "Scheduled" | "Completed" | "Cancelled"
}

export interface Room {
  id: string
  number: string
  type: "ICU" | "General" | "Isolation" | "Surgery"
  capacity: number
  occupied: number
  dailyRate: number
  isAvailable: boolean
}

export default function AdmissionsPage() {
  const [showAdmitModal, setShowAdmitModal] = useState(false)
  const [showDischargeModal, setShowDischargeModal] = useState(false)
  const [showTimelineModal, setShowTimelineModal] = useState(false)
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null)

  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    doctorId: "all",
    roomType: "all",
    dateRange: "today",
  })

  // Mock data
  const [admissions, setAdmissions] = useState<Admission[]>([
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
      roomNumber: "ICU-01",
      admissionDate: "2024-01-24",
      admissionTime: "14:30",
      reason: "Post-surgery recovery - Spay operation",
      status: "Active",
      estimatedDischarge: "2024-01-26",
      totalBill: 850.0,
      dailyRate: 150.0,
      treatments: [
        {
          id: "t1",
          date: "2024-01-24",
          time: "15:00",
          type: "Medication",
          description: "Pain medication - Tramadol 50mg",
          doctorName: "Dr. Sarah Wilson",
          cost: 25.0,
          status: "Completed",
        },
      ],
      notes: "Patient recovering well from spay surgery. Monitor for any signs of infection.",
      createdAt: "2024-01-24T14:30:00Z",
      updatedAt: "2024-01-24T14:30:00Z",
    },
  ])

  const [rooms] = useState<Room[]>([
    { id: "1", number: "ICU-01", type: "ICU", capacity: 1, occupied: 1, dailyRate: 150.0, isAvailable: false },
    { id: "2", number: "ICU-02", type: "ICU", capacity: 1, occupied: 0, dailyRate: 150.0, isAvailable: true },
    { id: "3", number: "GEN-01", type: "General", capacity: 2, occupied: 0, dailyRate: 100.0, isAvailable: true },
  ])

  // Filter admissions
  const filteredAdmissions = admissions.filter((admission) => {
    const matchesStatus = filters.status === "all" || admission.status === filters.status
    const matchesDoctor = filters.doctorId === "all" || admission.doctorId === filters.doctorId
    const room = rooms.find((r) => r.number === admission.roomNumber)
    const matchesRoomType = filters.roomType === "all" || room?.type === filters.roomType

    let matchesDate = true
    if (filters.dateRange === "today") {
      matchesDate = admission.admissionDate === new Date().toISOString().split("T")[0]
    }

    return matchesStatus && matchesDoctor && matchesRoomType && matchesDate
  })

  const handleAdmitPet = (admissionData: Omit<Admission, "id" | "createdAt" | "updatedAt">) => {
    const newAdmission: Admission = {
      ...admissionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setAdmissions([...admissions, newAdmission])
    setShowAdmitModal(false)
  }

  const handleDischarge = (admissionId: string, dischargeData: any) => {
    setAdmissions(
      admissions.map((admission) =>
        admission.id === admissionId
          ? {
              ...admission,
              status: "Discharged" as const,
              actualDischarge: new Date().toISOString().split("T")[0],
              updatedAt: new Date().toISOString(),
              ...dischargeData,
            }
          : admission,
      ),
    )
    setShowDischargeModal(false)
    setSelectedAdmission(null)
  }

  const handleViewTimeline = (admission: Admission) => {
    setSelectedAdmission(admission)
    setShowTimelineModal(true)
  }

  const handleDischargeClick = (admission: Admission) => {
    setSelectedAdmission(admission)
    setShowDischargeModal(true)
  }

  // Calculate statistics
  const stats = {
    totalActive: admissions.filter((a) => a.status === "Active").length,
    totalRooms: rooms.length,
    occupiedRooms: rooms.filter((r) => r.occupied > 0).length,
    todayAdmissions: admissions.filter((a) => a.admissionDate === new Date().toISOString().split("T")[0]).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admissions</h1>
          <p className="text-gray-600 mt-2">Manage pet admissions and room assignments</p>
        </div>
        <button
          onClick={() => setShowAdmitModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          Admit Pet
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FaBed className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalActive}</div>
              <div className="text-sm text-gray-600">Active Admissions</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FaBed className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.occupiedRooms}/{stats.totalRooms}
              </div>
              <div className="text-sm text-gray-600">Rooms Occupied</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FaCalendarAlt className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.todayAdmissions}</div>
              <div className="text-sm text-gray-600">Today's Admissions</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FaUserMd className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-orange-600">
                $
                {admissions
                  .filter((a) => a.status === "Active")
                  .reduce((sum, a) => sum + a.totalBill, 0)
                  .toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Active Bills</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AdmissionFilters filters={filters} onFiltersChange={setFilters} rooms={rooms} />

      {/* Admissions List */}
      <div className="mt-6">
        <AdmissionList
          admissions={filteredAdmissions}
          rooms={rooms}
          onViewTimeline={handleViewTimeline}
          onDischarge={handleDischargeClick}
        />
      </div>

      {/* Modals */}
      {showAdmitModal && (
        <AdmitPetModal
          rooms={rooms.filter((r) => r.isAvailable)}
          onSave={handleAdmitPet}
          onClose={() => setShowAdmitModal(false)}
        />
      )}

      {showDischargeModal && selectedAdmission && (
        <DischargeModal
          admission={selectedAdmission}
          onSave={(data) => handleDischarge(selectedAdmission.id, data)}
          onClose={() => {
            setShowDischargeModal(false)
            setSelectedAdmission(null)
          }}
        />
      )}

      {showTimelineModal && selectedAdmission && (
        <TreatmentTimelineModal
          admission={selectedAdmission}
          onClose={() => {
            setShowTimelineModal(false)
            setSelectedAdmission(null)
          }}
        />
      )}
    </div>
  )
}
