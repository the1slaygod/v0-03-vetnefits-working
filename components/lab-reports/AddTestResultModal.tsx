"use client"

import type React from "react"

import { useState } from "react"
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa"

interface TestParameter {
  name: string
  value: string
  unit: string
  referenceRange: string
  status: "normal" | "abnormal" | "critical"
}

interface AddTestResultModalProps {
  onClose: () => void
  onSubmit: (report: any) => void
}

export default function AddTestResultModal({ onClose, onSubmit }: AddTestResultModalProps) {
  const [formData, setFormData] = useState({
    petId: "",
    petName: "",
    ownerName: "",
    testType: "",
    subType: "",
    appointmentId: "",
    notes: "",
  })

  const [testParameters, setTestParameters] = useState<TestParameter[]>([])

  const testTypes = [
    {
      value: "Blood Test",
      label: "Blood Test",
      subTypes: [
        {
          value: "CBC",
          label: "Complete Blood Count",
          parameters: [
            { name: "WBC", unit: "K/μL", range: "5.0-15.0" },
            { name: "RBC", unit: "M/μL", range: "5.5-8.5" },
            { name: "Hemoglobin", unit: "g/dL", range: "12.0-18.0" },
            { name: "Hematocrit", unit: "%", range: "37-55" },
            { name: "Platelets", unit: "K/μL", range: "200-500" },
          ],
        },
        {
          value: "LFT",
          label: "Liver Function Test",
          parameters: [
            { name: "ALT", unit: "U/L", range: "10-100" },
            { name: "AST", unit: "U/L", range: "10-100" },
            { name: "ALP", unit: "U/L", range: "20-150" },
            { name: "Total Bilirubin", unit: "mg/dL", range: "0.1-0.5" },
          ],
        },
      ],
    },
    {
      value: "Urine Test",
      label: "Urine Test",
      subTypes: [
        {
          value: "Urinalysis",
          label: "Urinalysis",
          parameters: [
            { name: "Protein", unit: "", range: "Negative" },
            { name: "Glucose", unit: "", range: "Negative" },
            { name: "Ketones", unit: "", range: "Negative" },
            { name: "Blood", unit: "", range: "Negative" },
            { name: "Bacteria", unit: "", range: "None" },
          ],
        },
      ],
    },
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

    // Load test parameters when subType is selected
    if (name === "subType") {
      const selectedTestType = testTypes.find((type) => type.value === formData.testType)
      const selectedSubType = selectedTestType?.subTypes.find((sub) => sub.value === value)

      if (selectedSubType) {
        const newParameters = selectedSubType.parameters.map((param) => ({
          name: param.name,
          value: "",
          unit: param.unit,
          referenceRange: param.range,
          status: "normal" as const,
        }))
        setTestParameters(newParameters)
      }
    }
  }

  const handleParameterChange = (index: number, field: keyof TestParameter, value: string) => {
    const updatedParameters = [...testParameters]
    updatedParameters[index] = { ...updatedParameters[index], [field]: value }

    // Auto-determine status based on value and reference range
    if (field === "value" && value) {
      const param = updatedParameters[index]
      if (param.referenceRange.includes("-")) {
        const [min, max] = param.referenceRange.split("-").map((v) => Number.parseFloat(v))
        const numValue = Number.parseFloat(value)
        if (!isNaN(numValue) && !isNaN(min) && !isNaN(max)) {
          if (numValue < min || numValue > max) {
            updatedParameters[index].status = "abnormal"
          } else {
            updatedParameters[index].status = "normal"
          }
        }
      } else if (param.referenceRange === "Negative" && value !== "Negative") {
        updatedParameters[index].status = "abnormal"
      }
    }

    setTestParameters(updatedParameters)
  }

  const addCustomParameter = () => {
    setTestParameters([
      ...testParameters,
      {
        name: "",
        value: "",
        unit: "",
        referenceRange: "",
        status: "normal",
      },
    ])
  }

  const removeParameter = (index: number) => {
    setTestParameters(testParameters.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const results = testParameters.reduce((acc, param) => {
      if (param.name && param.value) {
        acc[param.name.toLowerCase().replace(/\s+/g, "_")] = {
          value: param.value,
          unit: param.unit,
          range: param.referenceRange,
          status: param.status,
        }
      }
      return acc
    }, {} as any)

    const report = {
      petId: formData.petId,
      petName: formData.petName,
      ownerName: formData.ownerName,
      testType: formData.testType,
      subType: formData.subType,
      appointmentId: formData.appointmentId,
      notes: formData.notes,
      reportType: "structured",
      results,
      doctorName: "Dr. Smith",
    }

    onSubmit(report)
    onClose()
  }

  const selectedTestType = testTypes.find((type) => type.value === formData.testType)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Test Result</h2>
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
                  <option key={subType.value} value={subType.value}>
                    {subType.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Test Parameters */}
          {testParameters.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Test Parameters</h3>
                <button
                  type="button"
                  onClick={addCustomParameter}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="mr-2 h-3 w-3" />
                  Add Custom Parameter
                </button>
              </div>

              <div className="space-y-4">
                {testParameters.map((param, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parameter</label>
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Parameter name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => handleParameterChange(index, "value", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Result value"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <input
                        type="text"
                        value={param.unit}
                        onChange={(e) => handleParameterChange(index, "unit", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Unit"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reference Range</label>
                      <input
                        type="text"
                        value={param.referenceRange}
                        onChange={(e) => handleParameterChange(index, "referenceRange", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Normal range"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={param.status}
                        onChange={(e) =>
                          handleParameterChange(index, "status", e.target.value as "normal" | "abnormal" | "critical")
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="normal">Normal</option>
                        <option value="abnormal">Abnormal</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeParameter(index)}
                        className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional notes about this test..."
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
              disabled={!formData.petId || !formData.testType || !formData.subType || testParameters.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Save Test Result
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
