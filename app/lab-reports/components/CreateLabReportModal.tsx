"use client"

import { useState } from "react"
import { FaPlus, FaFlask, FaSpinner, FaUpload } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createLabReport } from "@/app/actions/lab-reports-actions"
import { toast } from "sonner"

export default function CreateLabReportModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    patient_id: "",
    pet_id: "",
    emr_record_id: "",
    test_name: "",
    test_type: "blood_work" as "blood_work" | "urine_analysis" | "fecal_exam" | "skin_scraping" | "biopsy" | "x_ray" | "ultrasound" | "other",
    ordered_date: new Date().toISOString().split('T')[0],
    collected_date: "",
    status: "ordered" as "ordered" | "collected" | "in_progress" | "completed" | "cancelled",
    results: "",
    normal_ranges: "",
    abnormal_findings: "",
    interpretation: "",
    recommendations: "",
    lab_name: "",
    veterinarian: "",
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.patient_id || !formData.pet_id || !formData.test_name || !formData.veterinarian) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    
    try {
      const result = await createLabReport({
        patient_id: formData.patient_id,
        pet_id: formData.pet_id,
        emr_record_id: formData.emr_record_id || undefined,
        test_name: formData.test_name,
        test_type: formData.test_type,
        ordered_date: formData.ordered_date,
        collected_date: formData.collected_date || undefined,
        status: formData.status,
        results: formData.results || undefined,
        normal_ranges: formData.normal_ranges || undefined,
        abnormal_findings: formData.abnormal_findings || undefined,
        interpretation: formData.interpretation || undefined,
        recommendations: formData.recommendations || undefined,
        lab_name: formData.lab_name || undefined,
        veterinarian: formData.veterinarian,
        notes: formData.notes || undefined
      })
      
      if (result.success) {
        toast.success("Lab report created successfully")
        setIsOpen(false)
        // Reset form
        setFormData({
          patient_id: "",
          pet_id: "",
          emr_record_id: "",
          test_name: "",
          test_type: "blood_work",
          ordered_date: new Date().toISOString().split('T')[0],
          collected_date: "",
          status: "ordered",
          results: "",
          normal_ranges: "",
          abnormal_findings: "",
          interpretation: "",
          recommendations: "",
          lab_name: "",
          veterinarian: "",
          notes: ""
        })
        // Refresh the page to show new report
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to create lab report")
      }
    } catch (error) {
      console.error("Error creating lab report:", error)
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
          Create Lab Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaFlask className="text-blue-600" />
            Create New Lab Report
          </DialogTitle>
          <DialogDescription>
            Order a new laboratory test and track results
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Test Details</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="notes">Notes & Files</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
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
                <Label htmlFor="emr_record_id">EMR Record ID (optional)</Label>
                <Input
                  id="emr_record_id"
                  name="emr_record_id"
                  value={formData.emr_record_id}
                  onChange={handleInputChange}
                  placeholder="Link to existing EMR record"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test_name">Test Name *</Label>
                  <Input
                    id="test_name"
                    name="test_name"
                    value={formData.test_name}
                    onChange={handleInputChange}
                    placeholder="Complete Blood Count (CBC)"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="test_type">Test Type *</Label>
                  <Select 
                    value={formData.test_type} 
                    onValueChange={(value) => setFormData(prev => ({...prev, test_type: value as any}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood_work">Blood Work</SelectItem>
                      <SelectItem value="urine_analysis">Urine Analysis</SelectItem>
                      <SelectItem value="fecal_exam">Fecal Exam</SelectItem>
                      <SelectItem value="skin_scraping">Skin Scraping</SelectItem>
                      <SelectItem value="biopsy">Biopsy</SelectItem>
                      <SelectItem value="x_ray">X-Ray</SelectItem>
                      <SelectItem value="ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="veterinarian">Veterinarian *</Label>
                <Input
                  id="veterinarian"
                  name="veterinarian"
                  value={formData.veterinarian}
                  onChange={handleInputChange}
                  placeholder="Dr. Sarah Wilson"
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ordered_date">Ordered Date *</Label>
                  <Input
                    id="ordered_date"
                    name="ordered_date"
                    type="date"
                    value={formData.ordered_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="collected_date">Collected Date</Label>
                  <Input
                    id="collected_date"
                    name="collected_date"
                    type="date"
                    value={formData.collected_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({...prev, status: value as any}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ordered">Ordered</SelectItem>
                      <SelectItem value="collected">Collected</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lab_name">Laboratory Name</Label>
                  <Input
                    id="lab_name"
                    name="lab_name"
                    value={formData.lab_name}
                    onChange={handleInputChange}
                    placeholder="IDEXX Laboratories"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <div>
                <Label htmlFor="results">Test Results</Label>
                <Textarea
                  id="results"
                  name="results"
                  value={formData.results}
                  onChange={handleInputChange}
                  placeholder="Enter test results and values"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="normal_ranges">Normal Ranges</Label>
                <Textarea
                  id="normal_ranges"
                  name="normal_ranges"
                  value={formData.normal_ranges}
                  onChange={handleInputChange}
                  placeholder="Reference ranges for normal values"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="abnormal_findings">Abnormal Findings</Label>
                <Textarea
                  id="abnormal_findings"
                  name="abnormal_findings"
                  value={formData.abnormal_findings}
                  onChange={handleInputChange}
                  placeholder="Any abnormal or concerning findings"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="interpretation">Interpretation</Label>
                <Textarea
                  id="interpretation"
                  name="interpretation"
                  value={formData.interpretation}
                  onChange={handleInputChange}
                  placeholder="Clinical interpretation of results"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  id="recommendations"
                  name="recommendations"
                  value={formData.recommendations}
                  onChange={handleInputChange}
                  placeholder="Follow-up recommendations based on results"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional notes or instructions"
                  rows={4}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FaUpload />
                    File Upload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">File upload functionality coming soon</p>
                    <p className="text-sm text-gray-500">Upload lab report PDFs, images, and documents</p>
                  </div>
                </CardContent>
              </Card>
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
                "Create Lab Report"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}