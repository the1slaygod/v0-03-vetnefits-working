"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import Sidebar from "@/components/Sidebar"
import {
  FaArrowLeft,
  FaEdit,
  FaPlus,
  FaCamera,
  FaFileAlt,
  FaPrint,
  FaDownload,
  FaEnvelope,
  FaFilter,
  FaSave,
  FaTimes,
  FaTrash,
  FaSpinner,
} from "react-icons/fa"

// Mock data and functions since we don't have the actual implementations
const mockPatient = {
  id: "1",
  name: "Buddy",
  species: "Dog",
  breed: "Golden Retriever",
  age: 5,
  gender: "Male",
  weight: "65 lbs",
  color: "Golden",
  microchip_id: "123456789",
  owner_name: "John Smith",
  owner_email: "john@example.com",
  owner_phone: "(555) 123-4567",
  profile_image: null,
  tags: ["Friendly", "Active"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockSOAPNotes = [
  {
    id: "1",
    patient_id: "1",
    visit_date: "2024-01-15",
    visit_type: "Check-up",
    chief_complaint: "Annual wellness exam",
    subjective: "Owner reports dog is eating well and active. No concerns.",
    objective: {
      temperature: "101.5°F",
      weight: "65 lbs",
      heart_rate: "120 bpm",
      respiratory_rate: "24 rpm",
      notes: "Physical exam normal. Heart and lungs sound good.",
    },
    assessment: "Healthy adult dog. All parameters within normal limits.",
    plan: "Continue current diet and exercise. Return in 1 year for next wellness exam.",
    veterinarian: "Dr. Sarah Johnson",
    status: "completed",
    attachments: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock functions
const getPatient = async (id: string) => {
  return JSON.parse(JSON.stringify(mockPatient))
}

const getPatientSOAPNotes = async (id: string) => {
  return JSON.parse(JSON.stringify(mockSOAPNotes))
}

const updatePatient = async (id: string, data: any) => {
  return { success: true }
}

const createSOAPNote = async (data: any) => {
  return { success: true }
}

const updateSOAPNote = async (id: string, data: any) => {
  return { success: true }
}

const deleteSOAPNote = async (id: string, patientId: string) => {
  return { success: true }
}

export default function PatientProfile() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [isEditing, setIsEditing] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [filterDate, setFilterDate] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterTag, setFilterTag] = useState("")
  const [expandedNote, setExpandedNote] = useState<string | null>(null)
  const [editingFields, setEditingFields] = useState<{ [key: string]: boolean }>({})
  const [tempPatientData, setTempPatientData] = useState<any>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailRecipient, setEmailRecipient] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [patient, setPatient] = useState<any>(null)
  const [soapNotes, setSoapNotes] = useState<any[]>([])

  const [newNote, setNewNote] = useState({
    visit_type: "Check-up",
    chief_complaint: "",
    subjective: "",
    objective: {},
    assessment: "",
    plan: "",
    veterinarian: "Dr. Sarah Johnson",
    status: "draft",
  })

  // Fetch patient data and SOAP notes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const patientData = await getPatient(id)
        if (!patientData) {
          toast({
            title: "Error",
            description: "Patient not found",
            variant: "destructive",
          })
          router.push("/patients")
          return
        }

        // Create plain objects to avoid frozen object issues
        const plainPatient = {
          id: patientData.id,
          name: patientData.name,
          species: patientData.species,
          breed: patientData.breed,
          age: patientData.age,
          gender: patientData.gender,
          weight: patientData.weight,
          color: patientData.color,
          microchip_id: patientData.microchip_id,
          owner_name: patientData.owner_name,
          owner_email: patientData.owner_email,
          owner_phone: patientData.owner_phone,
          profile_image: patientData.profile_image,
          tags: [...(patientData.tags || [])],
          created_at: patientData.created_at,
          updated_at: patientData.updated_at,
        }

        setPatient(plainPatient)
        setTempPatientData({ ...plainPatient })

        const notes = await getPatientSOAPNotes(id)
        const plainNotes = notes.map((note: any) => ({
          id: note.id,
          patient_id: note.patient_id,
          visit_date: note.visit_date,
          visit_type: note.visit_type,
          chief_complaint: note.chief_complaint,
          subjective: note.subjective,
          objective: { ...note.objective },
          assessment: note.assessment,
          plan: note.plan,
          veterinarian: note.veterinarian,
          status: note.status,
          attachments: [...(note.attachments || [])],
          created_at: note.created_at,
          updated_at: note.updated_at,
        }))
        setSoapNotes(plainNotes)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, router])

  const filteredNotes = soapNotes.filter((note) => {
    const matchesDate = !filterDate || note.visit_date.includes(filterDate)
    const matchesType = !filterType || note.visit_type.toLowerCase().includes(filterType.toLowerCase())
    const matchesTag = !filterTag || note.chief_complaint.toLowerCase().includes(filterTag.toLowerCase())
    return matchesDate && matchesType && matchesTag
  })

  const handleSaveNote = async () => {
    if (!patient) return

    setIsSaving(true)
    try {
      if (editingNote) {
        // Update existing note
        const result = await updateSOAPNote(editingNote, newNote)
        if (result.success) {
          toast({
            title: "Success",
            description: "SOAP note updated successfully",
          })

          // Refresh notes
          const updatedNotes = await getPatientSOAPNotes(id)
          const plainNotes = updatedNotes.map((note: any) => ({
            id: note.id,
            patient_id: note.patient_id,
            visit_date: note.visit_date,
            visit_type: note.visit_type,
            chief_complaint: note.chief_complaint,
            subjective: note.subjective,
            objective: { ...note.objective },
            assessment: note.assessment,
            plan: note.plan,
            veterinarian: note.veterinarian,
            status: note.status,
            attachments: [...(note.attachments || [])],
            created_at: note.created_at,
            updated_at: note.updated_at,
          }))
          setSoapNotes(plainNotes)
        } else {
          toast({
            title: "Error",
            description: "Failed to update SOAP note",
            variant: "destructive",
          })
        }
      } else {
        // Add new note
        const noteData = {
          ...newNote,
          patient_id: patient.id,
          visit_date: new Date().toISOString().split("T")[0],
        }

        const result = await createSOAPNote(noteData)
        if (result.success) {
          toast({
            title: "Success",
            description: "SOAP note created successfully",
          })

          // Refresh notes
          const updatedNotes = await getPatientSOAPNotes(id)
          const plainNotes = updatedNotes.map((note: any) => ({
            id: note.id,
            patient_id: note.patient_id,
            visit_date: note.visit_date,
            visit_type: note.visit_type,
            chief_complaint: note.chief_complaint,
            subjective: note.subjective,
            objective: { ...note.objective },
            assessment: note.assessment,
            plan: note.plan,
            veterinarian: note.veterinarian,
            status: note.status,
            attachments: [...(note.attachments || [])],
            created_at: note.created_at,
            updated_at: note.updated_at,
          }))
          setSoapNotes(plainNotes)
        } else {
          toast({
            title: "Error",
            description: "Failed to create SOAP note",
            variant: "destructive",
          })
        }
      }

      setShowAddNote(false)
      setEditingNote(null)
      setNewNote({
        visit_type: "Check-up",
        chief_complaint: "",
        subjective: "",
        objective: {},
        assessment: "",
        plan: "",
        veterinarian: "Dr. Sarah Johnson",
        status: "draft",
      })
    } catch (error) {
      console.error("Error saving note:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditNote = (note: any) => {
    setNewNote({
      visit_type: note.visit_type,
      chief_complaint: note.chief_complaint,
      subjective: note.subjective,
      objective: { ...note.objective },
      assessment: note.assessment,
      plan: note.plan,
      veterinarian: note.veterinarian,
      status: note.status,
    })
    setEditingNote(note.id)
    setShowAddNote(true)
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!patient) return

    if (confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      try {
        const result = await deleteSOAPNote(noteId, patient.id)
        if (result.success) {
          toast({
            title: "Success",
            description: "SOAP note deleted successfully",
          })

          // Refresh notes
          const updatedNotes = await getPatientSOAPNotes(id)
          const plainNotes = updatedNotes.map((note: any) => ({
            id: note.id,
            patient_id: note.patient_id,
            visit_date: note.visit_date,
            visit_type: note.visit_type,
            chief_complaint: note.chief_complaint,
            subjective: note.subjective,
            objective: { ...note.objective },
            assessment: note.assessment,
            plan: note.plan,
            veterinarian: note.veterinarian,
            status: note.status,
            attachments: [...(note.attachments || [])],
            created_at: note.created_at,
            updated_at: note.updated_at,
          }))
          setSoapNotes(plainNotes)
        } else {
          toast({
            title: "Error",
            description: "Failed to delete SOAP note",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting note:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      }
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!patient) return

    const file = e.target.files?.[0]
    if (file) {
      try {
        const reader = new FileReader()
        reader.onload = async (event) => {
          const imageUrl = event.target?.result as string

          // Update patient in state
          const updatedPatient = { ...patient, profile_image: imageUrl }
          setPatient(updatedPatient)
          setTempPatientData({ ...tempPatientData, profile_image: imageUrl })

          // Update patient in database
          const result = await updatePatient(patient.id, { profile_image: imageUrl })
          if (!result.success) {
            toast({
              title: "Error",
              description: "Failed to update profile image",
              variant: "destructive",
            })
          } else {
            toast({
              title: "Success",
              description: "Profile image updated successfully",
            })
          }
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error("Error uploading photo:", error)
        toast({
          title: "Error",
          description: "Failed to upload photo",
          variant: "destructive",
        })
      }
    }
  }

  const handleSaveProfile = async () => {
    if (!patient || !tempPatientData) return

    setIsSaving(true)
    try {
      const result = await updatePatient(patient.id, tempPatientData)
      if (result.success) {
        setPatient({ ...tempPatientData })
        setIsEditing(false)
        toast({
          title: "Success",
          description: "Patient profile updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update patient profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFieldEdit = async (field: string, value: any) => {
    if (!patient || !tempPatientData) return

    // Update temp data
    const updatedTempData = { ...tempPatientData, [field]: value }
    setTempPatientData(updatedTempData)

    // Close editing for this field
    setEditingFields((prev) => ({ ...prev, [field]: false }))

    // If not in global edit mode, save immediately
    if (!isEditing) {
      try {
        const result = await updatePatient(patient.id, { [field]: value })
        if (result.success) {
          setPatient({ ...patient, [field]: value })
          toast({
            title: "Success",
            description: `${field} updated successfully`,
          })
        } else {
          toast({
            title: "Error",
            description: `Failed to update ${field}`,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error(`Error updating ${field}:`, error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      }
    }
  }

  const exportToPDF = (noteId?: string) => {
    if (!patient) return

    const printContent = noteId ? soapNotes.find((note) => note.id === noteId) : { patient, notes: soapNotes }

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${patient.name} - Medical Records</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .section { margin-bottom: 15px; }
              .label { font-weight: bold; color: #555; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${patient.name} - Medical Records</h1>
              <p>${patient.breed} • ${patient.species} • ${patient.age} years old</p>
            </div>
            ${
              noteId && printContent && typeof printContent === "object" && "visit_date" in printContent
                ? `
              <div class="section">
                <div class="label">Visit Date:</div>
                <p>${new Date(printContent.visit_date).toLocaleDateString()}</p>
              </div>
              <div class="section">
                <div class="label">Visit Type:</div>
                <p>${printContent.visit_type}</p>
              </div>
              <div class="section">
                <div class="label">Chief Complaint:</div>
                <p>${printContent.chief_complaint}</p>
              </div>
              <div class="section">
                <div class="label">Subjective:</div>
                <p>${printContent.subjective}</p>
              </div>
              <div class="section">
                <div class="label">Objective:</div>
                <p>${printContent.objective?.notes || "No notes"}</p>
              </div>
              <div class="section">
                <div class="label">Assessment:</div>
                <p>${printContent.assessment}</p>
              </div>
              <div class="section">
                <div class="label">Plan:</div>
                <p>${printContent.plan}</p>
              </div>
            `
                : `
              <div class="section">
                <div class="label">All Medical Records:</div>
                ${soapNotes
                  .map(
                    (note) => `
                  <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
                    <h3>${new Date(note.visit_date).toLocaleDateString()} - ${note.visit_type}</h3>
                    <p><strong>Chief Complaint:</strong> ${note.chief_complaint}</p>
                    <p><strong>Assessment:</strong> ${note.assessment}</p>
                    <p><strong>Plan:</strong> ${note.plan}</p>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            `
            }
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const printNote = (noteId: string) => {
    exportToPDF(noteId)
  }

  const emailNote = (noteId: string) => {
    const note = soapNotes.find((n) => n.id === noteId)
    if (note && patient) {
      setEmailRecipient(patient.owner_email)
      setEmailSubject(`Medical Record - ${patient.name} - ${new Date(note.visit_date).toLocaleDateString()}`)
      setEmailBody(`
Medical Record for ${patient.name}

Visit Date: ${new Date(note.visit_date).toLocaleDateString()}
Visit Type: ${note.visit_type}
Chief Complaint: ${note.chief_complaint}

Subjective: ${note.subjective}

Objective: ${note.objective?.notes || "No notes"}

Assessment: ${note.assessment}

Plan: ${note.plan}

Veterinarian: ${note.veterinarian}
      `)
      setShowEmailModal(true)
    }
  }

  const getVisitTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "emergency":
        return "bg-red-500"
      case "vaccination":
        return "bg-green-500"
      case "surgery":
        return "bg-purple-500"
      case "check-up":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Sidebar />
        <div className="ml-64 flex flex-col items-center justify-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-600 mb-4" />
          <p className="text-lg text-gray-600">Loading patient data...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Sidebar />
        <div className="ml-64 flex flex-col items-center justify-center">
          <p className="text-lg text-gray-600">Patient not found</p>
          <Link href="/patients" className="mt-4 text-blue-600 hover:underline">
            Return to patients list
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link href="/patients" className="mr-4 text-gray-600 hover:text-gray-900 transition-colors">
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
                <p className="text-gray-600">
                  {patient.breed} • {patient.species} • {patient.age} years old
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => exportToPDF()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <FaDownload className="mr-2" />
                Export PDF
              </button>
              {isEditing ? (
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:bg-blue-400"
                >
                  {isSaving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Information Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                {/* Pet Photo */}
                <div className="text-center mb-6">
                  <div className="h-32 w-32 bg-blue-100 rounded-full flex items-center justify-center text-6xl mx-auto mb-4 relative overflow-hidden">
                    {patient.profile_image ? (
                      <img
                        src={patient.profile_image || "/placeholder.svg"}
                        alt={patient.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {patient.species.toLowerCase() === "dog"
                          ? "🐕"
                          : patient.species.toLowerCase() === "cat"
                            ? "🐱"
                            : "🐾"}
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center cursor-pointer"
                  >
                    <FaCamera className="mr-1" />
                    Update Photo
                  </label>
                </div>

                {/* Basic Information */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Species</label>
                      {editingFields.species ? (
                        <input
                          type="text"
                          value={tempPatientData?.species || ""}
                          onChange={(e) => setTempPatientData((prev: any) => ({ ...prev, species: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onBlur={() => tempPatientData && handleFieldEdit("species", tempPatientData.species)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && tempPatientData) {
                              handleFieldEdit("species", tempPatientData.species)
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <p
                          className={`text-gray-900 ${isEditing ? "cursor-pointer hover:bg-gray-100" : ""} px-2 py-1 rounded`}
                          onClick={() => isEditing && setEditingFields((prev) => ({ ...prev, species: true }))}
                        >
                          {patient.species}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Breed</label>
                      {editingFields.breed ? (
                        <input
                          type="text"
                          value={tempPatientData?.breed || ""}
                          onChange={(e) => setTempPatientData((prev: any) => ({ ...prev, breed: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onBlur={() => tempPatientData && handleFieldEdit("breed", tempPatientData.breed)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && tempPatientData) {
                              handleFieldEdit("breed", tempPatientData.breed)
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <p
                          className={`text-gray-900 ${isEditing ? "cursor-pointer hover:bg-gray-100" : ""} px-2 py-1 rounded`}
                          onClick={() => isEditing && setEditingFields((prev) => ({ ...prev, breed: true }))}
                        >
                          {patient.breed}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Age</label>
                      {editingFields.age ? (
                        <input
                          type="number"
                          value={tempPatientData?.age || 0}
                          onChange={(e) =>
                            setTempPatientData((prev: any) => ({ ...prev, age: Number.parseInt(e.target.value) || 0 }))
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onBlur={() => tempPatientData && handleFieldEdit("age", tempPatientData.age)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && tempPatientData) {
                              handleFieldEdit("age", tempPatientData.age)
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <p
                          className={`text-gray-900 ${isEditing ? "cursor-pointer hover:bg-gray-100" : ""} px-2 py-1 rounded`}
                          onClick={() => isEditing && setEditingFields((prev) => ({ ...prev, age: true }))}
                        >
                          {patient.age} years
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Gender</label>
                      {editingFields.gender ? (
                        <input
                          type="text"
                          value={tempPatientData?.gender || ""}
                          onChange={(e) => setTempPatientData((prev: any) => ({ ...prev, gender: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onBlur={() => tempPatientData && handleFieldEdit("gender", tempPatientData.gender)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && tempPatientData) {
                              handleFieldEdit("gender", tempPatientData.gender)
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <p
                          className={`text-gray-900 ${isEditing ? "cursor-pointer hover:bg-gray-100" : ""} px-2 py-1 rounded`}
                          onClick={() => isEditing && setEditingFields((prev) => ({ ...prev, gender: true }))}
                        >
                          {patient.gender}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Weight</label>
                      {editingFields.weight ? (
                        <input
                          type="text"
                          value={tempPatientData?.weight || ""}
                          onChange={(e) => setTempPatientData((prev: any) => ({ ...prev, weight: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onBlur={() => tempPatientData && handleFieldEdit("weight", tempPatientData.weight)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && tempPatientData) {
                              handleFieldEdit("weight", tempPatientData.weight)
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <p
                          className={`text-gray-900 ${isEditing ? "cursor-pointer hover:bg-gray-100" : ""} px-2 py-1 rounded`}
                          onClick={() => isEditing && setEditingFields((prev) => ({ ...prev, weight: true }))}
                        >
                          {patient.weight}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Color</label>
                      {editingFields.color ? (
                        <input
                          type="text"
                          value={tempPatientData?.color || ""}
                          onChange={(e) => setTempPatientData((prev: any) => ({ ...prev, color: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onBlur={() => tempPatientData && handleFieldEdit("color", tempPatientData.color)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && tempPatientData) {
                              handleFieldEdit("color", tempPatientData.color)
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <p
                          className={`text-gray-900 ${isEditing ? "cursor-pointer hover:bg-gray-100" : ""} px-2 py-1 rounded`}
                          onClick={() => isEditing && setEditingFields((prev) => ({ ...prev, color: true }))}
                        >
                          {patient.color}
                        </p>
                      )}
                    </div>
                  </div>
                  {patient.microchip_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Microchip ID</label>
                      {editingFields.microchip_id ? (
                        <input
                          type="text"
                          value={tempPatientData?.microchip_id || ""}
                          onChange={(e) =>
                            setTempPatientData((prev: any) => ({ ...prev, microchip_id: e.target.value }))
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onBlur={() =>
                            tempPatientData && handleFieldEdit("microchip_id", tempPatientData.microchip_id)
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && tempPatientData) {
                              handleFieldEdit("microchip_id", tempPatientData.microchip_id)
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <p
                          className={`text-gray-900 font-mono text-sm ${isEditing ? "cursor-pointer hover:bg-gray-100" : ""} px-2 py-1 rounded`}
                          onClick={() => isEditing && setEditingFields((prev) => ({ ...prev, microchip_id: true }))}
                        >
                          {patient.microchip_id}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {patient.tags?.map((tag: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {isEditing && (
                      <button
                        className="px-2 py-1 border border-dashed border-gray-300 text-gray-500 text-xs rounded-full hover:border-gray-400"
                        onClick={() => {
                          const newTag = prompt("Enter new tag:")
                          if (newTag && tempPatientData) {
                            const updatedTags = [...(tempPatientData.tags || []), newTag]
                            setTempPatientData({ ...tempPatientData, tags: updatedTags })
                          }
                        }}
                      >
                        + Add Tag
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Records Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Medical Records</h2>
                  <button
                    onClick={() => setShowAddNote(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                  >
                    <FaPlus className="mr-2" />
                    Add SOAP Note
                  </button>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center">
                      <FaFilter className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-600">Filters:</span>
                    </div>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Filter by date"
                    />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">All Visit Types</option>
                      <option value="check-up">Check-up</option>
                      <option value="emergency">Emergency</option>
                      <option value="vaccination">Vaccination</option>
                      <option value="surgery">Surgery</option>
                    </select>
                    <input
                      type="text"
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value)}
                      placeholder="Search complaints..."
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                    {(filterDate || filterType || filterTag) && (
                      <button
                        onClick={() => {
                          setFilterDate("")
                          setFilterType("")
                          setFilterTag("")
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* SOAP Notes List */}
                <div className="p-6">
                  {filteredNotes.length > 0 ? (
                    <div className="space-y-4">
                      {filteredNotes.map((note) => (
                        <div key={note.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Note Header */}
                          <div
                            className="px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-4">
                                <span
                                  className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getVisitTypeColor(note.visit_type)}`}
                                >
                                  {note.visit_type}
                                </span>
                                <div>
                                  <h3 className="font-medium text-gray-900">
                                    Visit - {new Date(note.visit_date).toLocaleDateString()}
                                  </h3>
                                  <p className="text-sm text-gray-600">{note.chief_complaint}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">{note.veterinarian}</span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditNote(note)
                                    }}
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <FaEdit className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      printNote(note.id)
                                    }}
                                    className="p-1 text-gray-600 hover:text-gray-800"
                                    title="Print"
                                  >
                                    <FaPrint className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      exportToPDF(note.id)
                                    }}
                                    className="p-1 text-green-600 hover:text-green-800"
                                    title="Download PDF"
                                  >
                                    <FaDownload className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      emailNote(note.id)
                                    }}
                                    className="p-1 text-purple-600 hover:text-purple-800"
                                    title="Email"
                                  >
                                    <FaEnvelope className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Note Content */}
                          {expandedNote === note.id && (
                            <div className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Subjective</h4>
                                  <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded">{note.subjective}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Objective</h4>
                                  <div className="text-sm bg-green-50 p-3 rounded space-y-1">
                                    {note.objective?.temperature && (
                                      <p>
                                        <strong>Temperature:</strong> {note.objective.temperature}
                                      </p>
                                    )}
                                    {note.objective?.weight && (
                                      <p>
                                        <strong>Weight:</strong> {note.objective.weight}
                                      </p>
                                    )}
                                    {note.objective?.heart_rate && (
                                      <p>
                                        <strong>Heart Rate:</strong> {note.objective.heart_rate}
                                      </p>
                                    )}
                                    {note.objective?.respiratory_rate && (
                                      <p>
                                        <strong>Respiratory Rate:</strong> {note.objective.respiratory_rate}
                                      </p>
                                    )}
                                    {note.objective?.blood_pressure && (
                                      <p>
                                        <strong>Blood Pressure:</strong> {note.objective.blood_pressure}
                                      </p>
                                    )}
                                    {note.objective?.notes && (
                                      <p>
                                        <strong>Notes:</strong> {note.objective.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Assessment</h4>
                                  <p className="text-gray-700 text-sm bg-yellow-50 p-3 rounded">{note.assessment}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Plan</h4>
                                  <p className="text-gray-700 text-sm bg-purple-50 p-3 rounded">{note.plan}</p>
                                </div>
                              </div>

                              {note.attachments && note.attachments.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
                                  <div className="flex space-x-2">
                                    {note.attachments.map((attachment: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
                                      >
                                        <FaFileAlt className="mr-1" />
                                        <span className="text-sm">Attachment {index + 1}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                  Status:{" "}
                                  <span
                                    className={`font-medium ${note.status === "completed" ? "text-green-600" : note.status === "reviewed" ? "text-blue-600" : "text-yellow-600"}`}
                                  >
                                    {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="text-red-600 hover:text-red-800 text-sm flex items-center"
                                >
                                  <FaTrash className="mr-1" />
                                  Delete Note
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {soapNotes.length === 0 ? "No medical records yet" : "No records match your filters"}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {soapNotes.length === 0
                          ? "Start by adding the first SOAP note for this patient"
                          : "Try adjusting your filter criteria"}
                      </p>
                      <button
                        onClick={() => setShowAddNote(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Add First Note
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit SOAP Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingNote ? "Edit SOAP Note" : "Add New SOAP Note"}
              </h3>
              <button
                onClick={() => {
                  setShowAddNote(false)
                  setEditingNote(null)
                  setNewNote({
                    visit_type: "Check-up",
                    chief_complaint: "",
                    subjective: "",
                    objective: {},
                    assessment: "",
                    plan: "",
                    veterinarian: "Dr. Sarah Johnson",
                    status: "draft",
                  })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visit Type</label>
                    <select
                      value={newNote.visit_type}
                      onChange={(e) => setNewNote((prev) => ({ ...prev, visit_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Check-up">Check-up</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Vaccination">Vaccination</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Follow-up">Follow-up</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint</label>
                    <input
                      type="text"
                      value={newNote.chief_complaint || ""}
                      onChange={(e) => setNewNote((prev) => ({ ...prev, chief_complaint: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of the main concern"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Veterinarian</label>
                    <select
                      value={newNote.veterinarian}
                      onChange={(e) => setNewNote((prev) => ({ ...prev, veterinarian: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                      <option value="Dr. Mike Wilson">Dr. Mike Wilson</option>
                      <option value="Dr. Emily Chen">Dr. Emily Chen</option>
                    </select>
                  </div>
                </div>

                {/* Vitals */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Vitals & Measurements</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                      <input
                        type="text"
                        value={(newNote.objective as any)?.temperature || ""}
                        onChange={(e) =>
                          setNewNote((prev) => ({
                            ...prev,
                            objective: { ...prev.objective, temperature: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="°F"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                      <input
                        type="text"
                        value={(newNote.objective as any)?.weight || ""}
                        onChange={(e) =>
                          setNewNote((prev) => ({
                            ...prev,
                            objective: { ...prev.objective, weight: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="lbs"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate</label>
                      <input
                        type="text"
                        value={(newNote.objective as any)?.heart_rate || ""}
                        onChange={(e) =>
                          setNewNote((prev) => ({
                            ...prev,
                            objective: { ...prev.objective, heart_rate: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="bpm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Respiratory Rate</label>
                      <input
                        type="text"
                        value={(newNote.objective as any)?.respiratory_rate || ""}
                        onChange={(e) =>
                          setNewNote((prev) => ({
                            ...prev,
                            objective: { ...prev.objective, respiratory_rate: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="rpm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SOAP Sections */}
              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subjective</label>
                  <textarea
                    value={newNote.subjective || ""}
                    onChange={(e) => setNewNote((prev) => ({ ...prev, subjective: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Owner's description of symptoms, behavior, history..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objective (Physical Examination)
                  </label>
                  <textarea
                    value={(newNote.objective as any)?.notes || ""}
                    onChange={(e) =>
                      setNewNote((prev) => ({
                        ...prev,
                        objective: { ...prev.objective, notes: e.target.value },
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Physical examination findings, observations..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
                  <textarea
                    value={newNote.assessment || ""}
                    onChange={(e) => setNewNote((prev) => ({ ...prev, assessment: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Diagnosis, differential diagnoses, clinical impression..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <textarea
                    value={newNote.plan || ""}
                    onChange={(e) => setNewNote((prev) => ({ ...prev, plan: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Treatment plan, medications, follow-up instructions..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddNote(false)
                    setEditingNote(null)
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:bg-blue-400"
                >
                  {isSaving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                  {editingNote ? "Update Note" : "Save Note"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Send Email</h3>
              <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="recipient@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const mailtoLink = `mailto:${emailRecipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
                    window.open(mailtoLink)
                    setShowEmailModal(false)
                    setEmailRecipient("")
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <FaEnvelope className="mr-2" />
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
