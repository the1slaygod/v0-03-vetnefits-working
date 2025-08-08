"use client"

import type React from "react"
import { useState } from "react"
import { FaTimes, FaTrash, FaClock, FaStethoscope, FaPills, FaSyringe } from "react-icons/fa"
import type { Admission, Treatment } from "../../app/admissions/page"

interface TreatmentTimelineModalProps {
  admission: Admission
  onClose: () => void
}

export default function TreatmentTimelineModal({ admission, onClose }: TreatmentTimelineModalProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "add-treatment">("timeline")
  const [treatments, setTreatments] = useState<Treatment[]>(admission.treatments)
  const [newTreatment, setNewTreatment] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    type: "Medication" as Treatment["type"],
    description: "",
    doctorName: admission.doctorName,
    cost: 0,
    status: "Scheduled" as Treatment["status"],
  })

  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault()

    const treatment: Treatment = {
      id: `treatment-${Date.now()}`,
      ...newTreatment,
    }

    setTreatments([...treatments, treatment])
    setNewTreatment({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      type: "Medication",
      description: "",
      doctorName: admission.doctorName,
      cost: 0,
      status: "Scheduled",
    })
    setActiveTab("timeline")
  }

  const handleUpdateTreatmentStatus = (treatmentId: string, status: Treatment["status"]) => {
    setTreatments(treatments.map((t) => (t.id === treatmentId ? { ...t, status } : t)))
  }

  const handleDeleteTreatment = (treatmentId: string) => {
    if (confirm("Are you sure you want to delete this treatment?")) {
      setTreatments(treatments.filter((t) => t.id !== treatmentId))
    }
  }

  const getTypeIcon = (type: Treatment["type"]) => {
    switch (type) {
      case "Medication":
        return <FaPills className="h-4 w-4" />
      case "Procedure":
        return <FaSyringe className="h-4 w-4" />
      case "Surgery":
        return <FaStethoscope className="h-4 w-4" />
      case "Observation":
        return <FaClock className="h-4 w-4" />
      case "Therapy":
        return <FaStethoscope className="h-4 w-4" />
      default:
        return <FaStethoscope className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Treatment["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const sortedTreatments = treatments.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateB.getTime() - dateA.getTime()
  })

  const totalCost = treatments.reduce((sum, treatment) => sum + treatment.cost, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Treatment Timeline - {admission.petName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Patient Info Header */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Patient:</span> {admission.petName} ({admission.petType})
            </div>
            <div>
              <span className="font-medium">Owner:</span> {admission.ownerName}
            </div>
            <div>
              <span className="font-medium">Room:</span> {admission.roomNumber}
            </div>
            <div>
              <span className="font-medium">Doctor:</span> {admission.doctorName}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "timeline"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Treatment Timeline ({treatments.length})
            </button>
            <button
              onClick={() => setActiveTab("add-treatment")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "add-treatment"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Add Treatment
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "timeline" && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Treatments:</span> {treatments.length}
                  </div>
                  <div>
                    <span className="font-medium">Completed:</span>{" "}
                    {treatments.filter((t) => t.status === "Completed").length}
                  </div>
                  <div>
                    <span className="font-medium">Total Cost:</span> ${totalCost.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {sortedTreatments.length > 0 ? (
                <div className="space-y-4">
                  {sortedTreatments.map((treatment) => (
                    <div key={treatment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">{getTypeIcon(treatment.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-medium text-gray-900">{treatment.type}</h4>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(treatment.status)}`}
                              >
                                {treatment.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{treatment.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>
                                {new Date(treatment.date).toLocaleDateString()} at {treatment.time}
                              </span>
                              <span>{treatment.doctorName}</span>
                              <span>${treatment.cost.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {treatment.status === "Scheduled" && (
                            <>
                              <button
                                onClick={() => handleUpdateTreatmentStatus(treatment.id, "Completed")}
                                className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-300 rounded"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleUpdateTreatmentStatus(treatment.id, "Cancelled")}
                                className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteTreatment(treatment.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaStethoscope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No treatments recorded</h3>
                  <p className="text-gray-600 mb-4">Add treatments to track the patient's care timeline</p>
                  <button
                    onClick={() => setActiveTab("add-treatment")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First Treatment
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "add-treatment" && (
            <form onSubmit={handleAddTreatment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={newTreatment.date}
                    onChange={(e) => setNewTreatment({ ...newTreatment, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input
                    type="time"
                    value={newTreatment.time}
                    onChange={(e) => setNewTreatment({ ...newTreatment, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Type *</label>
                  <select
                    value={newTreatment.type}
                    onChange={(e) => setNewTreatment({ ...newTreatment, type: e.target.value as Treatment["type"] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Medication">Medication</option>
                    <option value="Procedure">Procedure</option>
                    <option value="Observation">Observation</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Therapy">Therapy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newTreatment.status}
                    onChange={(e) =>
                      setNewTreatment({ ...newTreatment, status: e.target.value as Treatment["status"] })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={newTreatment.description}
                  onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the treatment, medication dosage, procedure details, etc..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                  <select
                    value={newTreatment.doctorName}
                    onChange={(e) => setNewTreatment({ ...newTreatment, doctorName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Dr. Sarah Wilson">Dr. Sarah Wilson</option>
                    <option value="Dr. Mike Davis">Dr. Mike Davis</option>
                    <option value="Dr. Lisa Garcia">Dr. Lisa Garcia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    value={newTreatment.cost}
                    onChange={(e) => setNewTreatment({ ...newTreatment, cost: Number.parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("timeline")}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Treatment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
