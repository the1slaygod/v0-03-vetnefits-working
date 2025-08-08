"use client"

import { useState } from "react"
import { FaSave, FaExclamationTriangle } from "react-icons/fa"
import type { InventoryItem } from "../../app/inventory/page"

interface UpdateQuantityViewProps {
  items: InventoryItem[]
  onUpdateQuantity: (id: string, newQuantity: number) => void
}

export default function UpdateQuantityView({ items, onUpdateQuantity }: UpdateQuantityViewProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    items.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {}),
  )
  const [updatedItems, setUpdatedItems] = useState<Set<string>>(new Set())

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setQuantities((prev) => ({ ...prev, [id]: newQuantity }))
    setUpdatedItems((prev) => new Set([...prev, id]))
  }

  const handleUpdate = (id: string) => {
    onUpdateQuantity(id, quantities[id])
    setUpdatedItems((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const handleUpdateAll = () => {
    updatedItems.forEach((id) => {
      onUpdateQuantity(id, quantities[id])
    })
    setUpdatedItems(new Set())
  }

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    return expiry < today
  }

  const hasChanges = updatedItems.size > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Update Quantities</h2>
          <p className="text-gray-600">Adjust stock quantities for your inventory items</p>
        </div>
        {hasChanges && (
          <button
            onClick={handleUpdateAll}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FaSave className="mr-2" />
            Update All ({updatedItems.size})
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-blue-600 mr-3">
            <FaSave className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800">Total Items: {items.length}</h3>
            <p className="text-sm text-blue-600">
              {hasChanges ? `${updatedItems.size} items have pending changes` : "No pending changes"}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales/Received
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Alert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => {
                const hasChanged = quantities[item.id] !== item.quantity
                const expiringSoon = isExpiringSoon(item.expiryDate)
                const expired = isExpired(item.expiryDate)
                const isLowStock = quantities[item.id] <= item.minStock

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 ${hasChanged ? "bg-yellow-50" : ""} ${isLowStock ? "border-l-4 border-red-400" : ""}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                        <div className="text-xs text-gray-400">Min Stock: {item.minStock}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={quantities[item.id]}
                        onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 0)}
                        className={`w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          hasChanged ? "border-yellow-400 bg-yellow-50" : "border-gray-300"
                        } ${isLowStock ? "border-red-400 bg-red-50" : ""}`}
                      />
                      {isLowStock && <div className="text-xs text-red-600 mt-1">Low Stock!</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Sales: {item.salesQty || 0}</div>
                        <div>Received: {item.receivedQty || 0}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.expiryDate ? (
                        <div
                          className={`text-sm ${expired ? "text-red-600" : expiringSoon ? "text-yellow-600" : "text-gray-900"}`}
                        >
                          {new Date(item.expiryDate).toLocaleDateString()}
                          {(expired || expiringSoon) && (
                            <div className="flex items-center mt-1">
                              <FaExclamationTriangle className="h-3 w-3 mr-1" />
                              <span className="text-xs">{expired ? "Expired" : "Expiring Soon"}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasChanged ? (
                        <button
                          onClick={() => handleUpdate(item.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Update
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No changes</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
