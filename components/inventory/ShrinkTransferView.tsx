"use client"

import type React from "react"

import { useState } from "react"
import { FaPlus, FaHistory, FaExclamationTriangle } from "react-icons/fa"
import type { InventoryItem, ShrinkRecord } from "../../app/inventory/page"

interface ShrinkTransferViewProps {
  items: InventoryItem[]
  shrinkRecords: ShrinkRecord[]
  onAddShrinkRecord: (record: Omit<ShrinkRecord, "id" | "date">) => void
}

export default function ShrinkTransferView({ items, shrinkRecords, onAddShrinkRecord }: ShrinkTransferViewProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    itemId: "",
    quantity: 0,
    reason: "damage" as "damage" | "loss" | "transfer" | "expired",
    remarks: "",
    transferToClinic: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedItem = items.find((item) => item.id === formData.itemId)
    if (!selectedItem) return

    onAddShrinkRecord({
      itemId: formData.itemId,
      itemName: selectedItem.name,
      quantity: formData.quantity,
      reason: formData.reason,
      remarks: formData.remarks,
      transferToClinic: formData.reason === "transfer" ? formData.transferToClinic : undefined,
    })

    setFormData({
      itemId: "",
      quantity: 0,
      reason: "damage",
      remarks: "",
      transferToClinic: "",
    })
    setShowForm(false)
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "damage":
        return "bg-red-100 text-red-800"
      case "loss":
        return "bg-orange-100 text-orange-800"
      case "transfer":
        return "bg-blue-100 text-blue-800"
      case "expired":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalShrinkValue = shrinkRecords.reduce((sum, record) => {
    const item = items.find((i) => i.id === record.itemId)
    return sum + (item ? record.quantity * item.unitPrice : 0)
  }, 0)

  const reasonCounts = shrinkRecords.reduce(
    (acc, record) => {
      acc[record.reason] = (acc[record.reason] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-red-600">{reasonCounts.damage || 0}</div>
              <div className="text-sm text-red-700">Damage</div>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-orange-600">{reasonCounts.loss || 0}</div>
              <div className="text-sm text-orange-700">Loss</div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center">
            <FaHistory className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{reasonCounts.transfer || 0}</div>
              <div className="text-sm text-blue-700">Transfers</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
          <div className="flex items-center">
            <FaHistory className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-purple-600">${totalShrinkValue.toFixed(2)}</div>
              <div className="text-sm text-purple-700">Total Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Shrinkage & Transfer Records</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          Record Shrinkage
        </button>
      </div>

      {/* Records Table */}
      {shrinkRecords.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value Lost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shrinkRecords
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record) => {
                    const item = items.find((i) => i.id === record.itemId)
                    const valueLost = item ? record.quantity * item.unitPrice : 0

                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.itemName}</div>
                          {record.transferToClinic && (
                            <div className="text-xs text-gray-500">To: {record.transferToClinic}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getReasonColor(record.reason)}`}
                          >
                            {record.reason.charAt(0).toUpperCase() + record.reason.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          ${valueLost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{record.remarks}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <FaHistory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shrinkage records</h3>
          <p className="text-gray-600 mb-4">No shrinkage, loss, or transfer records have been created yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Record First Entry
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Record Shrinkage/Transfer</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Item *</label>
                <select
                  value={formData.itemId}
                  onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose an item...</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Current: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value as any })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="damage">Damage</option>
                  <option value="loss">Loss</option>
                  <option value="transfer">Transfer to Another Clinic</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {formData.reason === "transfer" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transfer to Clinic *</label>
                  <input
                    type="text"
                    value={formData.transferToClinic}
                    onChange={(e) => setFormData({ ...formData, transferToClinic: e.target.value })}
                    required
                    placeholder="Enter clinic name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
