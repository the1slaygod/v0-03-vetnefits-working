"use client"

import type React from "react"

import { useState } from "react"
import { FaTimes, FaUpload, FaFile } from "react-icons/fa"

interface UploadReportModalProps {
  onClose: () => void
  onSubmit: (report: any) => void
}

export default function UploadReportModal({ onClose, onSubmit }: UploadReportModalProps) {
  const [formData, setFormData] = useState({
    petId: "",
    petName: "",
    ownerName: "",
    testType: "",
    subType: "",
    appointmentId: "",
    notes: "",
    file: null as File | null,
  })
  const [dragActive, setDragActive] = useState(false)

  const testTypes = [
    { value: "Blood Test", label: "Blood Test", subTypes: ["CBC", "LFT", "KFT", "Lipid Profile", "Thyroid Panel"] },
    { value: "Urine Test", label: "Urine Test", subTypes: ["Urinalysis", "Urine Culture", "Microalbumin"] },
    { value: "Imaging", label: "Imaging", subTypes: ["X-Ray", "Ultrasound", "CT Scan", "MRI"] },
    { value: "Pathology", label: "Pathology", subTypes: ["Biopsy", "Cytology", "Histopathology"] },
    { value: "Microbiology", label: "Microbiology", subTypes: ["Culture", "Sensitivity", "Gram Stain"] },
  ]

  const mockPets = [
    { id: "PET001", name: "Max", owner: "John Smith" },
    { id: "PET002", name: "Bella", owner: "Sarah Johnson" },
    { id: "PET003", name: "Charlie", owner: "Mike Davis" },
    { id: "PET004", name: "Luna", owner: "Emily Brown" },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-fill owner name when pet is selected
    if (name === "petId") {
      const selectedPet = mockPets.find((pet) => pet.id === value)
      if (selectedPet) {
        setFormData((prev) => ({
          ...prev,
          petName: selectedPet.name,
          ownerName: selectedPet.owner,
        }))
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.dataTransfer.files[0] }))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files[0] }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const report = {
      petId: formData.petId,
      petName: formData.petName,
      ownerName: formData.ownerName,
      testType: formData.testType,
      subType: formData.subType,
      appointmentId: formData.appointmentId,
      notes: formData.notes,
      reportType: "uploaded",
      fileName: formData.file?.name,
      doctorName: "Dr. Smith",
    }

    onSubmit(report)
    onClose()
  }

  const selectedTestType = testTypes.find((type) => type.value === formData.testType)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Lab Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Pet Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Pet *</label>
              <select
                name="petId"
                value={formData.petId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a pet...</option>
                {mockPets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} - {pet.owner}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Appointment ID (Optional)</label>
              <input
                type="text"
                name="appointmentId"
                value={formData.appointmentId}
                onChange={handleInputChange}
                placeholder="APT001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Test Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Type *</label>
              <select
                name="testType"
                value={formData.testType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select test type...</option>
                {testTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub Type *</label>
              <select
                name="subType"
                value={formData.subType}
                onChange={handleInputChange}
                required
                disabled={!selectedTestType}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select sub type...</option>
                {selectedTestType?.subTypes.map((subType) => (
                  <option key={subType} value={subType}>
                    {subType}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Report File *</label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.file ? (
                <div className="flex items-center justify-center space-x-2">
                  <FaFile className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formData.file.name}</p>
                    <p className="text-xs text-gray-500">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, file: null }))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    {"Drag and drop your file here, or "}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                      browse
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500">Supports PDF, JPG, PNG files up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional notes about this report..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.petId || !formData.testType || !formData.subType || !formData.file}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Upload Report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
