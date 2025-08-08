"use client"

import { useState } from "react"
import { FaPlus, FaTrash, FaDownload } from "react-icons/fa"
import type { InventoryItem } from "../../app/inventory/page"

interface ReOrderItem {
  id: string
  itemId: string
  itemName: string
  currentStock: number
  minStock: number
  orderQuantity: number
  unitPrice: number
  supplier: string
  priority: "low" | "medium" | "high" | "critical"
}

interface ReOrderViewProps {
  items: InventoryItem[]
}

export default function ReOrderView({ items }: ReOrderViewProps) {
  const [reorderList, setReorderList] = useState<ReOrderItem[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  // Auto-populate with low stock items
  useState(() => {
    const lowStockItems = items.filter((item) => item.quantity <= item.minStock)
    const initialReorderList: ReOrderItem[] = lowStockItems.map((item) => ({
      id: `reorder-${item.id}`,
      itemId: item.id,
      itemName: item.name,
      currentStock: item.quantity,
      minStock: item.minStock,
      orderQuantity: Math.max(item.minStock * 2 - item.quantity, item.minStock),
      unitPrice: item.unitPrice,
      supplier: item.supplier || "Not specified",
      priority: item.quantity === 0 ? "critical" : item.quantity <= item.minStock * 0.5 ? "high" : "medium",
    }))
    setReorderList(initialReorderList)
  })

  const addToReorderList = (item: InventoryItem) => {
    const existingItem = reorderList.find((r) => r.itemId === item.id)
    if (existingItem) return

    const newReorderItem: ReOrderItem = {
      id: `reorder-${item.id}`,
      itemId: item.id,
      itemName: item.name,
      currentStock: item.quantity,
      minStock: item.minStock,
      orderQuantity: Math.max(item.minStock * 2 - item.quantity, item.minStock),
      unitPrice: item.unitPrice,
      supplier: item.supplier || "Not specified",
      priority: item.quantity === 0 ? "critical" : item.quantity <= item.minStock * 0.5 ? "high" : "medium",
    }
    setReorderList([...reorderList, newReorderItem])
  }

  const removeFromReorderList = (id: string) => {
    setReorderList(reorderList.filter((item) => item.id !== id))
  }

  const updateOrderQuantity = (id: string, quantity: number) => {
    setReorderList(reorderList.map((item) => (item.id === id ? { ...item, orderQuantity: quantity } : item)))
  }

  const totalOrderValue = reorderList.reduce((sum, item) => sum + item.orderQuantity * item.unitPrice, 0)
  const totalItems = reorderList.reduce((sum, item) => sum + item.orderQuantity, 0)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const availableItems = items.filter((item) => !reorderList.some((r) => r.itemId === item.id))

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{reorderList.length}</div>
          <div className="text-sm text-blue-700">Items to Reorder</div>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{totalItems}</div>
          <div className="text-sm text-green-700">Total Quantity</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">${totalOrderValue.toFixed(2)}</div>
          <div className="text-sm text-purple-700">Total Value</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Reorder List</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Item
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
            <FaDownload className="mr-2" />
            Export PO
          </button>
        </div>
      </div>

      {/* Reorder List */}
      {reorderList.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reorderList
                  .sort((a, b) => {
                    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
                    return priorityOrder[a.priority] - priorityOrder[b.priority]
                  })
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                        <div className="text-xs text-gray-500">Min Stock: {item.minStock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${item.currentStock === 0 ? "text-red-600" : "text-gray-900"}`}
                        >
                          {item.currentStock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          value={item.orderQuantity}
                          onChange={(e) => updateOrderQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${(item.orderQuantity * item.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.supplier}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}
                        >
                          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => removeFromReorderList(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {reorderList.length} items • {totalItems} total quantity
              </div>
              <div className="text-lg font-semibold text-gray-900">Total: ${totalOrderValue.toFixed(2)}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="text-gray-400 mb-4">No items in reorder list</div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Items to Reorder
          </button>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add Items to Reorder List</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        Current: {item.quantity} | Min: {item.minStock} | ${item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addToReorderList(item)
                        setShowAddModal(false)
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
              {availableItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">All items are already in the reorder list</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
