"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { FaTimes, FaSearch } from "react-icons/fa"
import { createClient } from "@supabase/supabase-js"
import { useClinicContext } from "@/lib/supabase-realtime"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface Patient {
  id: string
  name: string
  species: string
  breed: string
  owner_name: string
  owner_phone: string
  owner_email: string
  microchip_id?: string
}

interface Room {
  id: string
  number: string
  type: string
  dailyRate: number
  status: "available" | "occupied" | "maintenance"
}

interface Admission {
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
  status: string
  estimatedDischarge?: string
  totalBill: number
  dailyRate: number
  treatments: any[]
  notes: string
  createdAt: string
  updatedAt: string
}

interface AdmitPetModalProps {
  rooms: Room[]
  onSave: (admission: Omit<Admission, "id" | "createdAt" | "updatedAt">) => void
  onClose: () => void
}

export default function AdmitPetModal({ rooms, onSave, onClose }: AdmitPetModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedPet, setSelectedPet] = useState<Patient | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const clinicContext = useClinicContext()

  const [formData, setFormData] = useState({
    doctorName: "Dr. Sarah Wilson",
    roomNumber: "",
    reason: "",
    estimatedDischarge: "",
    notes: "",
  })

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query: string) => {
      if (!query || query.length < 2 || !clinicContext?.clinicId) {
        setSearchResults([])
        setShowResults(false)
        setSearchLoading(false)
        return
      }

      setSearchLoading(true)
      try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

        // Set clinic context
        await supabase.rpc("set_clinic_context", { clinic_id: clinicContext.clinicId })

        const { data: patients, error } = await supabase
          .from("patients")
          .select("id, name, species, breed, owner_name, owner_phone, owner_email, microchip_id")
          .or(`name.ilike.%${query}%,owner_name.ilike.%${query}%,breed.ilike.%${query}%,microchip_id.ilike.%${query}%`)
          .limit(10)

        if (error) {
          console.error("Search error:", error)
          setSearchResults([])
        } else {
          setSearchResults(patients || [])
          setShowResults(true)
        }
      } catch (error) {
        console.error("Search error:", error)
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    },
    [clinicContext?.clinicId],
  )

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, debouncedSearch])

  const handlePetSelect = (pet: Patient) => {
    setSelectedPet(pet)
    setSearchTerm(pet.name)
    setShowResults(false)
    // Clear any existing errors
    setErrors({})
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedPet) newErrors.selectedPet = "Please select a patient"
    if (!formData.roomNumber) newErrors.roomNumber = "Room selection is required"
    if (!formData.reason.trim()) newErrors.reason = "Reason for admission is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !selectedPet) return

    const selectedRoom = rooms.find((r) => r.number === formData.roomNumber)
    if (!selectedRoom) return

    const admissionData: Omit<Admission, "id" | "createdAt" | "updatedAt"> = {
      petId: selectedPet.id,
      petName: selectedPet.name,
      petType: selectedPet.species,
      petBreed: selectedPet.breed,
      ownerId: selectedPet.id, // In real app, this would be separate
      ownerName: selectedPet.owner_name,
      ownerPhone: selectedPet.owner_phone,
      doctorId: "doc1",
      doctorName: formData.doctorName,
      roomNumber: formData.roomNumber,
      admissionDate: new Date().toISOString().split("T")[0],
      admissionTime: new Date().toTimeString().slice(0, 5),
      reason: formData.reason,
      status: "Active",
      estimatedDischarge: formData.estimatedDischarge || undefined,
      totalBill: selectedRoom.dailyRate * 83, // Convert to INR
      dailyRate: selectedRoom.dailyRate * 83, // Convert to INR
      treatments: [],
      notes: formData.notes,
    }

    onSave(admissionData)
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".search-container")) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Admit Pet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Pet Search */}
          <div className="search-container">
            <Label className="block text-sm font-medium text-gray-700 mb-1">Search Patient *</Label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-10 ${errors.selectedPet ? "border-red-300" : ""}`}
                placeholder="Search by pet name, owner name, or microchip ID..."
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((pet) => (
                  <div
                    key={pet.id}
                    onClick={() => handlePetSelect(pet)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{pet.name}</p>
                        <p className="text-sm text-gray-600">
                          {pet.species} • {pet.breed}
                        </p>
                        <p className="text-sm text-gray-600">Owner: {pet.owner_name}</p>
                        <p className="text-sm text-gray-600">Phone: {pet.owner_phone}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          ID: {pet.id.slice(0, 8)}
                        </Badge>
                        {pet.microchip_id && <p className="text-xs text-gray-500 mt-1">Chip: {pet.microchip_id}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {showResults && searchResults.length === 0 && searchTerm.length >= 2 && !searchLoading && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 text-center text-gray-500">
                  <FaSearch className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No patients found for "{searchTerm}"</p>
                  <p className="text-sm mt-1">Try searching by name, owner, or microchip ID</p>
                </div>
              </div>
            )}

            {errors.selectedPet && <p className="mt-1 text-sm text-red-600">{errors.selectedPet}</p>}
          </div>

          {/* Selected Pet Display */}
          {selectedPet && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-blue-900">Selected Patient: {selectedPet.name}</h3>
                  <p className="text-sm text-blue-700">
                    {selectedPet.species} • {selectedPet.breed}
                  </p>
                  <p className="text-sm text-blue-700">Owner: {selectedPet.owner_name}</p>
                  <p className="text-sm text-blue-700">Phone: {selectedPet.owner_phone}</p>
                  {selectedPet.microchip_id && (
                    <p className="text-sm text-blue-700">Microchip: {selectedPet.microchip_id}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPet(null)
                    setSearchTerm("")
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaTimes className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Admission Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-1">
                Attending Doctor *
              </Label>
              <select
                id="doctorName"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Dr. Sarah Wilson">Dr. Sarah Wilson</option>
                <option value="Dr. Mike Davis">Dr. Mike Davis</option>
                <option value="Dr. Lisa Garcia">Dr. Lisa Garcia</option>
              </select>
            </div>

            <div>
              <Label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Room Assignment *
              </Label>
              <select
                id="roomNumber"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.roomNumber ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Select a room...</option>
                {rooms
                  .filter((room) => room.status === "available")
                  .map((room) => (
                    <option key={room.id} value={room.number}>
                      {room.number} - {room.type} (₹{(room.dailyRate * 83).toLocaleString()}/day)
                    </option>
                  ))}
              </select>
              {errors.roomNumber && <p className="mt-1 text-sm text-red-600">{errors.roomNumber}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="estimatedDischarge" className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Discharge Date
            </Label>
            <Input
              type="date"
              id="estimatedDischarge"
              name="estimatedDischarge"
              value={formData.estimatedDischarge}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full"
            />
          </div>

          {/* Reason for Admission */}
          <div>
            <Label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Admission *
            </Label>
            <Textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              className={`w-full ${errors.reason ? "border-red-300" : ""}`}
              placeholder="Describe the reason for admission..."
            />
            {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full"
              placeholder="Any additional notes or special instructions..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedPet}>
              Admit Pet
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
