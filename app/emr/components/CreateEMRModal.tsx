"use client"

import { useState } from "react"
import { FaPlus, FaUser, FaPaw, FaCalendarAlt, FaSpinner } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { createEMRRecord } from "@/app/actions/emr-actions"
import { toast } from "sonner"

export default function CreateEMRModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    patient_id: "",
    pet_id: "",
    appointment_id: "",
    visit_type: "",
    chief_complaint: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    vital_signs: {
      temperature: "",
      weight: "",
      heart_rate: "",
      respiratory_rate: "",
      blood_pressure_systolic: "",
      blood_pressure_diastolic: ""
    },
    medications: [] as string[],
    treatments: [] as string[],
    follow_up_required: false,
    follow_up_date: "",
    follow_up_notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const vitalSigns = Object.fromEntries(
        Object.entries(formData.vital_signs).filter(([_, value]) => value !== "")
      )

      const result = await createEMRRecord({
        patient_id: formData.patient_id,
        pet_id: formData.pet_id,
        appointment_id: formData.appointment_id || undefined,
        visit_type: formData.visit_type,
        chief_complaint: formData.chief_complaint,
        subjective: formData.subjective,
        objective: formData.objective,
        assessment: formData.assessment,
        plan: formData.plan,
        vital_signs: Object.keys(vitalSigns).length > 0 ? vitalSigns : undefined,
        medications: formData.medications,
        treatments: formData.treatments,
        follow_up_required: formData.follow_up_required,
        follow_up_date: formData.follow_up_date || undefined,
        follow_up_notes: formData.follow_up_notes || undefined
      })

      if (result.success) {
        toast.success("EMR record created successfully")
        setIsOpen(false)
        // Reset form
        setFormData({
          patient_id: "",
          pet_id: "",
          appointment_id: "",
          visit_type: "",
          chief_complaint: "",
          subjective: "",
          objective: "",
          assessment: "",
          plan: "",
          vital_signs: {
            temperature: "",
            weight: "",
            heart_rate: "",
            respiratory_rate: "",
            blood_pressure_systolic: "",
            blood_pressure_diastolic: ""
          },
          medications: [],
          treatments: [],
          follow_up_required: false,
          follow_up_date: "",
          follow_up_notes: ""
        })
        // Refresh the page to show new record
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to create EMR record")
      }
    } catch (error) {
      console.error("Error creating EMR record:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, ""]
    }))
  }

  const updateMedication = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => i === index ? value : med)
    }))
  }

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  const addTreatment = () => {
    setFormData(prev => ({
      ...prev,
      treatments: [...prev.treatments, ""]
    }))
  }

  const updateTreatment = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      treatments: prev.treatments.map((treatment, i) => i === index ? value : treatment)
    }))
  }

  const removeTreatment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      treatments: prev.treatments.filter((_, i) => i !== index)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <FaPlus />
          Create EMR Record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaUser className="text-blue-600" />
            Create Electronic Medical Record
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive medical record including SOAP notes, vital signs, and treatment plans.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="soap">SOAP Notes</TabsTrigger>
              <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
              <TabsTrigger value="treatment">Treatment</TabsTrigger>
              <TabsTrigger value="followup">Follow-up</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient_id">Patient ID *</Label>
                  <Input
                    id="patient_id"
                    value={formData.patient_id}
                    onChange={(e) => setFormData(prev => ({...prev, patient_id: e.target.value}))}
                    placeholder="Enter patient ID"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pet_id">Pet ID *</Label>
                  <Input
                    id="pet_id"
                    value={formData.pet_id}
                    onChange={(e) => setFormData(prev => ({...prev, pet_id: e.target.value}))}
                    placeholder="Enter pet ID"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="appointment_id">Appointment ID (optional)</Label>
                <Input
                  id="appointment_id"
                  value={formData.appointment_id}
                  onChange={(e) => setFormData(prev => ({...prev, appointment_id: e.target.value}))}
                  placeholder="Link to existing appointment"
                />
              </div>

              <div>
                <Label htmlFor="visit_type">Visit Type *</Label>
                <Select value={formData.visit_type} onValueChange={(value) => setFormData(prev => ({...prev, visit_type: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine_checkup">Routine Checkup</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="chief_complaint">Chief Complaint *</Label>
                <Textarea
                  id="chief_complaint"
                  value={formData.chief_complaint}
                  onChange={(e) => setFormData(prev => ({...prev, chief_complaint: e.target.value}))}
                  placeholder="Describe the main reason for the visit"
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="soap" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="subjective">Subjective</Label>
                  <Textarea
                    id="subjective"
                    value={formData.subjective}
                    onChange={(e) => setFormData(prev => ({...prev, subjective: e.target.value}))}
                    placeholder="Patient history, symptoms reported by owner"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="objective">Objective</Label>
                  <Textarea
                    id="objective"
                    value={formData.objective}
                    onChange={(e) => setFormData(prev => ({...prev, objective: e.target.value}))}
                    placeholder="Physical examination findings, vital signs, test results"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="assessment">Assessment</Label>
                  <Textarea
                    id="assessment"
                    value={formData.assessment}
                    onChange={(e) => setFormData(prev => ({...prev, assessment: e.target.value}))}
                    placeholder="Diagnosis, differential diagnoses, clinical impression"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="plan">Plan</Label>
                  <Textarea
                    id="plan"
                    value={formData.plan}
                    onChange={(e) => setFormData(prev => ({...prev, plan: e.target.value}))}
                    placeholder="Treatment plan, medications, follow-up instructions"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vitals" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temperature">Temperature (°F)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.vital_signs.temperature}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vital_signs: {...prev.vital_signs, temperature: e.target.value}
                    }))}
                    placeholder="101.5"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.vital_signs.weight}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vital_signs: {...prev.vital_signs, weight: e.target.value}
                    }))}
                    placeholder="45.2"
                  />
                </div>
                <div>
                  <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                  <Input
                    id="heart_rate"
                    type="number"
                    value={formData.vital_signs.heart_rate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vital_signs: {...prev.vital_signs, heart_rate: e.target.value}
                    }))}
                    placeholder="120"
                  />
                </div>
                <div>
                  <Label htmlFor="respiratory_rate">Respiratory Rate (rpm)</Label>
                  <Input
                    id="respiratory_rate"
                    type="number"
                    value={formData.vital_signs.respiratory_rate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vital_signs: {...prev.vital_signs, respiratory_rate: e.target.value}
                    }))}
                    placeholder="25"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="treatment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.medications.map((medication, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={medication}
                        onChange={(e) => updateMedication(index, e.target.value)}
                        placeholder="Enter medication name, dosage, and instructions"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeMedication(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addMedication}>
                    Add Medication
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Treatments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.treatments.map((treatment, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={treatment}
                        onChange={(e) => updateTreatment(index, e.target.value)}
                        placeholder="Enter treatment or procedure details"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeTreatment(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addTreatment}>
                    Add Treatment
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="followup" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="follow_up_required"
                  checked={formData.follow_up_required}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    follow_up_required: checked as boolean
                  }))}
                />
                <Label htmlFor="follow_up_required">Follow-up appointment required</Label>
              </div>

              {formData.follow_up_required && (
                <>
                  <div>
                    <Label htmlFor="follow_up_date">Follow-up Date</Label>
                    <Input
                      id="follow_up_date"
                      type="date"
                      value={formData.follow_up_date}
                      onChange={(e) => setFormData(prev => ({...prev, follow_up_date: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="follow_up_notes">Follow-up Notes</Label>
                    <Textarea
                      id="follow_up_notes"
                      value={formData.follow_up_notes}
                      onChange={(e) => setFormData(prev => ({...prev, follow_up_notes: e.target.value}))}
                      placeholder="Instructions for follow-up visit"
                    />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create EMR Record"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}