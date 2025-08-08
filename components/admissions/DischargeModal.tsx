"use client"

import type React from "react"
import { useState } from "react"
import { FaTimes, FaCalculator } from "react-icons/fa"
import type { Admission } from "../../app/admissions/page"

interface DischargeModalProps {
  admission: Admission
  onSave: (data: any) => void
  onClose: () => void
}

export default function DischargeModal({ admission, onSave, onClose }: DischargeModalProps) {
  const [formData, setFormData] = useState({
    dischargeDate: new Date().toISOString().split("T")[0],
    dischargeTime: new Date().toTimeString().slice(0, 5),
    dischargeNotes: "",
    followUpRequired: false,
    followUpDate: "",
    followUpInstructions: "",
    medicationsDispensed: "",
    finalBill: admission.totalBill,
    paymentStatus: "Pending" as "Pending" | "Paid" | "Partial",
    paymentMethod: "Cash" as "Cash" | "Card" | "Check" | "Insurance",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? Number.parseFloat(value) || 0
            : value,
    }))
  }

  const calculateStayDuration = () => {
    const admissionDate = new Date(admission.admissionDate)
    const dischargeDate = new Date(formData.dischargeDate)
    const diffTime = Math.abs(dischargeDate.getTime() - admissionDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays) // Minimum 1 day
  }

  const calculateTotalBill = () => {
    const stayDuration = calculateStayDuration()
    const roomCharges = stayDuration * admission.dailyRate
    const treatmentCharges = admission.treatments.reduce((sum, treatment) => sum + treatment.cost, 0)
    return roomCharges + treatmentCharges
  }

  const handleCalculateBill = () => {
    const totalBill = calculateTotalBill()
    setFormData((prev) => ({ ...prev, finalBill: totalBill }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const dischargeData = {
      ...formData,
      totalBill: formData.finalBill,
      stayDuration: calculateStayDuration(),
    }

    onSave(dischargeData)
  }

  const stayDuration = calculateStayDuration()
  const calculatedBill = calculateTotalBill()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Discharge {admission.petName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Admission Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Admission Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Admitted:</span> {new Date(admission.admissionDate).toLocaleDateString()}{" "}
                at {admission.admissionTime}
              </div>
              <div>
                <span className="font-medium">Room:</span> {admission.roomNumber}
              </div>
              <div>
                <span className="font-medium">Doctor:</span> {admission.doctorName}
              </div>
            </div>
          </div>

          {/* Discharge Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Date *</label>
              <input
                type="date"
                name="dischargeDate"
                value={formData.dischargeDate}
                onChange={handleChange}
                min={admission.admissionDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Time *</label>
              <input
                type="time"
                name="dischargeTime"
                value={formData.dischargeTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Discharge Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Notes</label>
            <textarea
              name="dischargeNotes"
              value={formData.dischargeNotes}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter discharge notes, condition at discharge, etc..."
            />
          </div>

          {/* Follow-up Care */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="followUpRequired"
                checked={formData.followUpRequired}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Follow-up appointment required</label>
            </div>

            {formData.followUpRequired && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleChange}
                    min={formData.dischargeDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Instructions</label>
                  <textarea
                    name="followUpInstructions"
                    value={formData.followUpInstructions}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Instructions for follow-up care..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Medications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medications Dispensed</label>
            <textarea
              name="medicationsDispensed"
              value={formData.medicationsDispensed}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="List medications given to owner with dosage instructions..."
            />
          </div>

          {/* Billing Information */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Billing Information</h3>
              <button
                type="button"
                onClick={handleCalculateBill}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <FaCalculator className="mr-1 h-3 w-3" />
                Calculate
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Stay Duration:</span> {stayDuration} {stayDuration === 1 ? "day" : "days"}
              </div>
              <div>
                <span className="font-medium">Room Charges:</span> ${(stayDuration * admission.dailyRate).toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Treatment Charges:</span> $
                {admission.treatments.reduce((sum, t) => sum + t.cost, 0).toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Final Bill Amount</label>
                <input
                  type="number"
                  name="finalBill"
                  value={formData.finalBill}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Calculated: ${calculatedBill.toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit/Debit Card</option>
                  <option value="Check">Check</option>
                  <option value="Insurance">Insurance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Discharge Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
