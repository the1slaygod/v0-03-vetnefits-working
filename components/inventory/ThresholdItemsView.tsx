"use client"

import { FaExclamationTriangle, FaShoppingCart } from "react-icons/fa"
import type { InventoryItem } from "../../app/inventory/page"

interface ThresholdItemsViewProps {
  items: InventoryItem[]
}

export default function ThresholdItemsView({ items }: ThresholdItemsViewProps) {
  const lowStockItems = items.filter((item) => item.quantity <= item.minStock)
  const outOfStockItems = items.filter((item) => item.quantity === 0)
  const criticalItems = items.filter((item) => item.quantity > 0 && item.quantity <= item.minStock * 0.5)

  const totalValue = lowStockItems.reduce((sum, item) => sum + item.minStock * item.unitPrice, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
              <div className="text-sm text-red-700">Out of Stock</div>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-orange-600">{criticalItems.length}</div>
              <div className="text-sm text-orange-700">Critical Level</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center">
            <FaShoppingCart className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
              <div className="text-sm text-yellow-700">Below Threshold</div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center">
            <FaShoppingCart className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-blue-600">${totalValue.toFixed(2)}</div>
              <div className="text-sm text-blue-700">Reorder Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Items */}
      {lowStockItems.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Items Below Threshold</h2>
            <p className="text-sm text-gray-600">Items that need to be reordered</p>
          </div>
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
                    Min Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggested Order
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
                {lowStockItems
                  .sort((a, b) => {
                    // Sort by priority: out of stock first, then by percentage of min stock
                    if (a.quantity === 0 && b.quantity > 0) return -1
                    if (b.quantity === 0 && a.quantity > 0) return 1
                    return a.quantity / a.minStock - b.quantity / b.minStock
                  })
                  .map((item) => {
                    const suggestedOrder = Math.max(item.minStock * 2 - item.quantity, item.minStock)
                    const priority =
                      item.quantity === 0 ? "Critical" : item.quantity <= item.minStock * 0.5 ? "High" : "Medium"
                    const priorityColor =
                      priority === "Critical"
                        ? "bg-red-100 text-red-800"
                        : priority === "High"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-yellow-100 text-yellow-800"

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.category}</div>
                            <div className="text-xs text-gray-400">${item.unitPrice.toFixed(2)} per unit</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm font-medium ${item.quantity === 0 ? "text-red-600" : "text-gray-900"}`}
                          >
                            {item.quantity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.minStock}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{suggestedOrder}</div>
                          <div className="text-xs text-gray-500">
                            Est. ${(suggestedOrder * item.unitPrice).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.supplier || "Not specified"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColor}`}>
                            {priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors mr-2">
                            Create PO
                          </button>
                          <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors">
                            Quick Order
                          </button>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <FaShoppingCart className="mx-auto h-12 w-12 text-green-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All Items Well Stocked</h3>
          <p className="text-gray-600">No items are currently below their minimum stock threshold</p>
        </div>
      )}
    </div>
  )
}
