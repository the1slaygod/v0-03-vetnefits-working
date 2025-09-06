"use client"

import { useState } from "react"
import { FaPlus, FaUser, FaPaw, FaSpinner } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { addToWaitingList } from "@/app/actions/waiting-list-actions"
import { toast } from "sonner"

export default function AddToWaitingListModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    patient_id: "",
    pet_id: "",
    appointment_id: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    reason: "",
    notes: "",
    estimated_duration: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.patient_id || !formData.pet_id || !formData.reason) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    
    try {
      const result = await addToWaitingList({
        patient_id: formData.patient_id,
        pet_id: formData.pet_id,
        appointment_id: formData.appointment_id || undefined,
        priority: formData.priority,
        reason: formData.reason,
        notes: formData.notes || undefined,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : undefined
      })
      
      if (result.success) {
        toast.success("Added to waiting list successfully")
        setIsOpen(false)
        // Reset form
        setFormData({
          patient_id: "",
          pet_id: "",
          appointment_id: "",
          priority: "normal",
          reason: "",
          notes: "",
          estimated_duration: ""
        })
        // Refresh the page to show new entry
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to add to waiting list")
      }
    } catch (error) {
      console.error("Error adding to waiting list:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <FaPlus />
          Add to Waiting List
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaUser className="text-blue-600" />
            Add Patient to Waiting List
          </DialogTitle>
          <DialogDescription>
            Check in a patient and add them to the queue
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient_id">Patient ID *</Label>
              <Input
                id="patient_id"
                name="patient_id"
                value={formData.patient_id}
                onChange={handleInputChange}
                placeholder="Enter patient ID"
                required
              />
            </div>
            <div>
              <Label htmlFor="pet_id">Pet ID *</Label>
              <Input
                id="pet_id"
                name="pet_id"
                value={formData.pet_id}
                onChange={handleInputChange}
                placeholder="Enter pet ID"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="appointment_id">Appointment ID (optional)</Label>
            <Input
              id="appointment_id"
              name="appointment_id"
              value={formData.appointment_id}
              onChange={handleInputChange}
              placeholder="Link to existing appointment"
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => setFormData(prev => ({...prev, priority: value as any}))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Routine visit</SelectItem>
                <SelectItem value="normal">Normal - Standard appointment</SelectItem>
                <SelectItem value="high">High - Needs attention soon</SelectItem>
                <SelectItem value="urgent">Urgent - Emergency case</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Reason for Visit *</Label>
            <Textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Brief description of why the patient is here"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any special instructions or information"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
            <Input
              id="estimated_duration"
              name="estimated_duration"
              type="number"
              value={formData.estimated_duration}
              onChange={handleInputChange}
              placeholder="30"
              min="5"
              max="180"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
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