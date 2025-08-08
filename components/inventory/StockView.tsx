"use client"
import { FaEdit, FaTrash, FaPlus, FaExclamationTriangle } from "react-icons/fa"
import type { InventoryItem } from "../../app/inventory/page"

interface StockViewProps {
  items: InventoryItem[]
  searchTerm: string
  categoryFilter: string
  onEdit: (item: InventoryItem) => void
  onDelete: (id: string) => void
  onAddNew: () => void
}

export default function StockView({ items, searchTerm, categoryFilter, onEdit, onDelete, onAddNew }: StockViewProps) {
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category.toLowerCase() === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) return { status: "out-of-stock", color: "bg-red-100 text-red-800", text: "Out of Stock" }
    if (item.quantity <= item.minStock)
      return { status: "low-stock", color: "bg-yellow-100 text-yellow-800", text: "Low Stock" }
    return { status: "in-stock", color: "bg-green-100 text-green-800", text: "In Stock" }
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

  const totalValue = filteredItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const lowStockCount = filteredItems.filter((item) => item.quantity <= item.minStock).length
  const expiringSoonCount = filteredItems.filter((item) => isExpiringSoon(item.expiryDate)).length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{filteredItems.length}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
          <div className="text-sm text-gray-600">Low Stock Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{expiringSoonCount}</div>
          <div className="text-sm text-gray-600">Expiring Soon</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Stock Items</h2>
        <button
          onClick={onAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          Add New Item
        </button>
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
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item)
                const expiringSoon = isExpiringSoon(item.expiryDate)
                const expired = isExpired(item.expiryDate)

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                        {item.batchNumber && <div className="text-xs text-gray-400">Batch: {item.batchNumber}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                      <div className="text-xs text-gray-500">Min: {item.minStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${item.unitPrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Total: ${(item.quantity * item.unitPrice).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.expiryDate ? (
                        <div
                          className={`text-sm ${expired ? "text-red-600" : expiringSoon ? "text-yellow-600" : "text-gray-900"}`}
                        >
                          {new Date(item.expiryDate).toLocaleDateString()}
                          {(expired || expiringSoon) && <FaExclamationTriangle className="inline ml-1 h-3 w-3" />}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.binLocation || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900">
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900">
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No items found</div>
          <button
            onClick={onAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Item
          </button>
        </div>
      )}
    </div>
  )
}
