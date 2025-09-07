"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, User, Cat, Loader2, Plus, Phone, Mail } from "lucide-react"
import { PatientSearchResult, PetSearchResult } from "../types"
import { toast } from "sonner"

interface ImprovedAddToWaitingListModalProps {
  onAdd: (data: {
    patient_id: string
    pet_id: string
    priority: "low" | "normal" | "high" | "urgent"
    reason: string
    notes?: string
    estimated_duration?: number
  }) => Promise<void>
}

export function ImprovedAddToWaitingListModal({ onAdd }: ImprovedAddToWaitingListModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null)
  const [selectedPet, setSelectedPet] = useState<PetSearchResult | null>(null)
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState("")

  // Search patients as user types
  useEffect(() => {
    const searchPatients = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      setSearching(true)
      try {
        const response = await fetch(`/api/patients/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        setSearchResults(data.data || [])
      } catch (error) {
        console.error("Search error:", error)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchPatients, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handlePatientSelect = (patient: PatientSearchResult) => {
    setSelectedPatient(patient)
    setSelectedPet(null)
    setSearchQuery(patient.name)
    setSearchResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPatient || !selectedPet) {
      toast.error("Please select both patient and pet")
      return
    }

    if (!reason.trim()) {
      toast.error("Please enter a reason for the visit")
      return
    }

    setLoading(true)
    try {
      await onAdd({
        patient_id: selectedPatient.id,
        pet_id: selectedPet.id,
        priority,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        estimated_duration: estimatedDuration ? parseInt(estimatedDuration) : undefined
      })

      // Reset form
      setSelectedPatient(null)
      setSelectedPet(null)
      setSearchQuery("")
      setPriority("normal")
      setReason("")
      setNotes("")
      setEstimatedDuration("")
      setOpen(false)
      
      toast.success("Added to waiting list successfully!")
    } catch (error) {
      console.error("Add to waiting list error:", error)
      toast.error("Failed to add to waiting list")
    } finally {
      setLoading(false)
    }
  }

  const clearSelection = () => {
    setSelectedPatient(null)
    setSelectedPet(null)
    setSearchQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add to Queue
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Add Patient to Waiting List
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Search */}
          <div className="space-y-2">
            <Label htmlFor="patient-search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Patient
            </Label>
            <div className="relative">
              <Input
                id="patient-search"
                placeholder="Type patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && !selectedPatient && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handlePatientSelect(patient)}
                    className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-start gap-3"
                  >
                    <User className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {patient.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {patient.email}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {patient.pets.length} pet{patient.pets.length !== 1 ? 's' : ''} registered
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Patient */}
            {selectedPatient && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">{selectedPatient.name}</div>
                    <div className="text-sm text-gray-500">{selectedPatient.phone}</div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-gray-500"
                >
                  Change
                </Button>
              </div>
            )}
          </div>

          {/* Pet Selection */}
          {selectedPatient && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Cat className="w-4 h-4" />
                Select Pet
              </Label>
              <Select
                value={selectedPet?.id || ""}
                onValueChange={(petId) => {
                  const pet = selectedPatient.pets.find(p => p.id === petId)
                  setSelectedPet(pet || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a pet..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedPatient.pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      <div className="flex items-center gap-2">
                        <Cat className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{pet.name}</span>
                        <span className="text-sm text-gray-500">
                          ({pet.species}, {pet.breed}, {pet.age}y)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit *</Label>
            <Input
              id="reason"
              placeholder="e.g., Annual checkup, Vaccination, Emergency..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Estimated Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Estimated Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="30"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              min="5"
              max="300"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedPatient || !selectedPet || !reason.trim() || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add to Queue"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}