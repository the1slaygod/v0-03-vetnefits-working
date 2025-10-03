"use client"

import { useState } from "react"
import EMRFilters from "../../components/emr/EMRFilters"
import PatientRecordsList from "../../components/emr/PatientRecordsList"
import AddSOAPNoteModal from "../../components/emr/AddSOAPNoteModal"
import VaccinationRecordModal from "../../components/emr/VaccinationRecordModal"
import PatientEMRModal from "../../components/emr/PatientEMRModal"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Syringe, Users, Activity } from "lucide-react"

export interface PatientRecord {
  id: string
  name: string
  species: string
  breed: string
  age: number
  gender: string
  ownerId: string
  ownerName: string
  ownerPhone: string
  lastVisit: string
  nextAppointment?: string
  status: "Active" | "Inactive" | "Deceased"
  microchipId?: string
  allergies?: string
  chronicConditions?: string
  currentMedications?: string
  soapNotes: SOAPNote[]
  vaccinations: VaccinationRecord[]
  labResults: LabResult[]
  createdAt: string
  updatedAt: string
}

export interface SOAPNote {
  id: string
  patientId: string
  date: string
  time: string
  doctorName: string
  subjective: string
  objective: string
  assessment: string
  plan: string
  followUpRequired: boolean
  followUpDate?: string
  createdAt: string
}

export interface VaccinationRecord {
  id: string
  patientId: string
  vaccineName: string
  manufacturer: string
  lotNumber: string
  dateAdministered: string
  expirationDate: string
  doctorName: string
  nextDueDate?: string
  reactions?: string
  createdAt: string
}

export interface LabResult {
  id: string
  patientId: string
  testName: string
  testDate: string
  results: string
  normalRange?: string
  status: "Normal" | "Abnormal" | "Pending"
  doctorName: string
  notes?: string
  createdAt: string
}

export default function EMRPage() {
  const [showSOAPModal, setShowSOAPModal] = useState(false)
  const [showVaccinationModal, setShowVaccinationModal] = useState(false)
  const [showPatientEMRModal, setShowPatientEMRModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null)
  const [editingSOAP, setEditingSOAP] = useState<SOAPNote | null>(null)

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    species: "all",
    status: "all",
    doctorId: "all",
    dateRange: "all",
  })

  // Mock data
  const [patients, setPatients] = useState<PatientRecord[]>([
    {
      id: "1",
      name: "Buddy",
      species: "Dog",
      breed: "Golden Retriever",
      age: 5,
      gender: "Male",
      ownerId: "owner1",
      ownerName: "John Smith",
      ownerPhone: "+1 (555) 123-4567",
      lastVisit: "2024-01-20",
      nextAppointment: "2024-02-15",
      status: "Active",
      microchipId: "CHIP123456789",
      allergies: "None known",
      chronicConditions: "Hip dysplasia (mild)",
      currentMedications: "Glucosamine supplement",
      soapNotes: [
        {
          id: "soap1",
          patientId: "1",
          date: "2024-01-20",
          time: "10:30",
          doctorName: "Dr. Sarah Wilson",
          subjective: "Owner reports dog has been limping on right front leg for 2 days.",
          objective: "Temperature: 101.5°F, Heart rate: 90 bpm, Weight: 65.5 lbs. Mild lameness on right front leg.",
          assessment: "Mild strain of right front leg, possibly from overexertion during play.",
          plan: "Prescribed rest for 5-7 days, anti-inflammatory medication (Rimadyl 75mg twice daily).",
          followUpRequired: true,
          followUpDate: "2024-01-27",
          createdAt: "2024-01-20T10:30:00Z",
        },
      ],
      vaccinations: [
        {
          id: "vacc1",
          patientId: "1",
          vaccineName: "DHPP",
          manufacturer: "Zoetis",
          lotNumber: "LOT123456",
          dateAdministered: "2024-01-15",
          expirationDate: "2025-01-15",
          doctorName: "Dr. Sarah Wilson",
          nextDueDate: "2025-01-15",
          createdAt: "2024-01-15T09:00:00Z",
        },
      ],
      labResults: [
        {
          id: "lab1",
          patientId: "1",
          testName: "Complete Blood Count",
          testDate: "2024-01-18",
          results: "WBC: 8.5, RBC: 6.2, Platelets: 350",
          normalRange: "WBC: 6-17, RBC: 5.5-8.5, Platelets: 200-500",
          status: "Normal",
          doctorName: "Dr. Sarah Wilson",
          createdAt: "2024-01-18T14:00:00Z",
        },
      ],
      createdAt: "2023-06-15T10:00:00Z",
      updatedAt: "2024-01-20T10:30:00Z",
    },
  ])

  // Filter patients based on current filters
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      patient.ownerName.toLowerCase().includes(filters.search.toLowerCase())
    const matchesSpecies = filters.species === "all" || patient.species.toLowerCase() === filters.species
    const matchesStatus = filters.status === "all" || patient.status === filters.status

    return matchesSearch && matchesSpecies && matchesStatus
  })

  const handleAddSOAPNote = (soapNote: Omit<SOAPNote, "id" | "createdAt">) => {
    const newSOAPNote: SOAPNote = {
      ...soapNote,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    setPatients(
      patients.map((patient) =>
        patient.id === soapNote.patientId
          ? {
              ...patient,
              soapNotes: [...patient.soapNotes, newSOAPNote],
              lastVisit: soapNote.date,
              updatedAt: new Date().toISOString(),
            }
          : patient,
      ),
    )
    setShowSOAPModal(false)
    setSelectedPatient(null)
  }

  const handleUpdateSOAPNote = (updatedSOAP: SOAPNote) => {
    setPatients(
      patients.map((patient) =>
        patient.id === updatedSOAP.patientId
          ? {
              ...patient,
              soapNotes: patient.soapNotes.map((soap) => (soap.id === updatedSOAP.id ? updatedSOAP : soap)),
              updatedAt: new Date().toISOString(),
            }
          : patient,
      ),
    )
    setShowSOAPModal(false)
    setEditingSOAP(null)
    setSelectedPatient(null)
  }

  const handleAddVaccination = (vaccination: Omit<VaccinationRecord, "id" | "createdAt">) => {
    const newVaccination: VaccinationRecord = {
      ...vaccination,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    setPatients(
      patients.map((patient) =>
        patient.id === vaccination.patientId
          ? {
              ...patient,
              vaccinations: [...patient.vaccinations, newVaccination],
              updatedAt: new Date().toISOString(),
            }
          : patient,
      ),
    )
    setShowVaccinationModal(false)
    setSelectedPatient(null)
  }

  const handleViewPatientEMR = (patient: PatientRecord) => {
    setSelectedPatient(patient)
    setShowPatientEMRModal(true)
  }

  const handleEditSOAP = (patient: PatientRecord, soap: SOAPNote) => {
    setSelectedPatient(patient)
    setEditingSOAP(soap)
    setShowSOAPModal(true)
  }

  const handleDeleteSOAP = (patientId: string, soapId: string) => {
    if (confirm("Are you sure you want to delete this SOAP note?")) {
      setPatients(
        patients.map((patient) =>
          patient.id === patientId
            ? {
                ...patient,
                soapNotes: patient.soapNotes.filter((soap) => soap.id !== soapId),
                updatedAt: new Date().toISOString(),
              }
            : patient,
        ),
      )
    }
  }

  // Calculate statistics
  const stats = {
    totalPatients: patients.length,
    activePatients: patients.filter((p) => p.status === "Active").length,
    recentSOAPNotes: patients.reduce(
      (sum, p) =>
        sum + p.soapNotes.filter((s) => new Date(s.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      0,
    ),
    upcomingAppointments: patients.filter((p) => p.nextAppointment).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Electronic Medical Records</h1>
          <p className="text-gray-600 mt-2">Comprehensive patient medical records and history</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowSOAPModal(true)} className="bg-blue-600 text-white hover:bg-blue-700">
            <FileText className="mr-2 h-4 w-4" />
            Add SOAP Note
          </Button>
          <Button onClick={() => setShowVaccinationModal(true)} className="bg-green-600 text-white hover:bg-green-700">
            <Syringe className="mr-2 h-4 w-4" />
            Add Vaccination
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalPatients}</div>
              <div className="text-sm text-gray-600">Total Patients</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Users className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.activePatients}</div>
              <div className="text-sm text-gray-600">Active Patients</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <FileText className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.recentSOAPNotes}</div>
              <div className="text-sm text-gray-600">Recent SOAP Notes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Activity className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.upcomingAppointments}</div>
              <div className="text-sm text-gray-600">Upcoming Appointments</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <EMRFilters filters={filters} onFiltersChange={setFilters} />

      {/* Patient Records List */}
      <div className="mt-6">
        <PatientRecordsList
          patients={filteredPatients}
          onViewEMR={handleViewPatientEMR}
          onEditSOAP={handleEditSOAP}
          onDeleteSOAP={handleDeleteSOAP}
        />
      </div>

      {/* Modals */}
      {showSOAPModal && (
        <AddSOAPNoteModal
          patients={patients}
          selectedPatient={selectedPatient}
          editingSOAP={editingSOAP}
          onSave={editingSOAP ? handleUpdateSOAPNote : handleAddSOAPNote}
          onClose={() => {
            setShowSOAPModal(false)
            setSelectedPatient(null)
            setEditingSOAP(null)
          }}
        />
      )}

      {showVaccinationModal && (
        <VaccinationRecordModal
          patients={patients}
          selectedPatient={selectedPatient}
          onSave={handleAddVaccination}
          onClose={() => {
            setShowVaccinationModal(false)
            setSelectedPatient(null)
          }}
        />
      )}

      {showPatientEMRModal && selectedPatient && (
        <PatientEMRModal
          patient={selectedPatient}
          onClose={() => {
            setShowPatientEMRModal(false)
            setSelectedPatient(null)
          }}
          onEditSOAP={handleEditSOAP}
          onDeleteSOAP={handleDeleteSOAP}
        />
      )}
    </div>
  )
}
