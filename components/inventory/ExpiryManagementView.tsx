"use client"

import { FaExclamationTriangle, FaEdit, FaCalendarAlt } from "react-icons/fa"
import type { InventoryItem } from "../../app/inventory/page"

interface ExpiryManagementViewProps {
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
}

export default function ExpiryManagementView({ items, onEdit }: ExpiryManagementViewProps) {
  const today = new Date()

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return { status: "no-expiry", daysLeft: null, color: "text-gray-500" }

    const expiry = new Date(expiryDate)
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysLeft < 0) return { status: "expired", daysLeft, color: "text-red-600" }
    if (daysLeft <= 7) return { status: "critical", daysLeft, color: "text-red-600" }
    if (daysLeft <= 30) return { status: "warning", daysLeft, color: "text-yellow-600" }
    if (daysLeft <= 90) return { status: "caution", daysLeft, color: "text-orange-600" }
    return { status: "good", daysLeft, color: "text-green-600" }
  }

  const expiredItems = items.filter((item) => {
    const status = getExpiryStatus(item.expiryDate)
    return status.status === "expired"
  })

  const criticalItems = items.filter((item) => {
    const status = getExpiryStatus(item.expiryDate)
    return status.status === "critical"
  })

  const warningItems = items.filter((item) => {
    const status = getExpiryStatus(item.expiryDate)
    return status.status === "warning"
  })

  const cautionItems = items.filter((item) => {
    const status = getExpiryStatus(item.expiryDate)
    return status.status === "caution"
  })

  const noExpiryItems = items.filter((item) => !item.expiryDate)

  const allExpiryItems = [...expiredItems, ...criticalItems, ...warningItems, ...cautionItems].sort((a, b) => {
    const aStatus = getExpiryStatus(a.expiryDate)
    const bStatus = getExpiryStatus(b.expiryDate)
    return (aStatus.daysLeft || 0) - (bStatus.daysLeft || 0)
  })

  const renderItemRow = (item: InventoryItem) => {
    const expiryStatus = getExpiryStatus(item.expiryDate)

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
          {item.expiryDate ? (
            <div className={`text-sm ${expiryStatus.color}`}>{new Date(item.expiryDate).toLocaleDateString()}</div>
          ) : (
            <span className="text-gray-400">No expiry</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`flex items-center ${expiryStatus.color}`}>
            {expiryStatus.status !== "no-expiry" && expiryStatus.status !== "good" && (
              <FaExclamationTriangle className="h-4 w-4 mr-2" />
            )}
            <span className="text-sm font-medium">
              {expiryStatus.status === "expired" && `Expired ${Math.abs(expiryStatus.daysLeft!)} days ago`}
              {expiryStatus.status === "critical" && `${expiryStatus.daysLeft} days left`}
              {expiryStatus.status === "warning" && `${expiryStatus.daysLeft} days left`}
              {expiryStatus.status === "caution" && `${expiryStatus.daysLeft} days left`}
              {expiryStatus.status === "good" && `${expiryStatus.daysLeft} days left`}
              {expiryStatus.status === "no-expiry" && "No expiry date"}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              expiryStatus.status === "expired"
                ? "bg-red-100 text-red-800"
                : expiryStatus.status === "critical"
                  ? "bg-red-100 text-red-800"
                  : expiryStatus.status === "warning"
                    ? "bg-yellow-100 text-yellow-800"
                    : expiryStatus.status === "caution"
                      ? "bg-orange-100 text-orange-800"
                      : expiryStatus.status === "good"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
            }`}
          >
            {expiryStatus.status === "expired"
              ? "Expired"
              : expiryStatus.status === "critical"
                ? "Critical"
                : expiryStatus.status === "warning"
                  ? "Warning"
                  : expiryStatus.status === "caution"
                    ? "Caution"
                    : expiryStatus.status === "good"
                      ? "Good"
                      : "No Expiry"}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900">
            <FaEdit className="h-4 w-4" />
          </button>
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-red-600">{expiredItems.length}</div>
              <div className="text-sm text-red-700">Expired</div>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center">
            <FaCalendarAlt className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-red-600">{criticalItems.length}</div>
              <div className="text-sm text-red-700">≤ 7 days</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center">
            <FaCalendarAlt className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">{warningItems.length}</div>
              <div className="text-sm text-yellow-700">≤ 30 days</div>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <div className="flex items-center">
            <FaCalendarAlt className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-orange-600">{cautionItems.length}</div>
              <div className="text-sm text-orange-700">≤ 90 days</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center">
            <FaCalendarAlt className="h-5 w-5 text-gray-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-gray-600">{noExpiryItems.length}</div>
              <div className="text-sm text-gray-700">No Expiry</div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Requiring Attention */}
      {allExpiryItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Items Requiring Attention</h2>
            <p className="text-sm text-gray-600">Items that are expired or expiring soon</p>
          </div>
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
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Left
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">{allExpiryItems.map(renderItemRow)}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Items with Expiry */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Items with Expiry Dates</h2>
          <p className="text-sm text-gray-600">Complete list of items with expiry information</p>
        </div>
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
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Left
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
              {items
                .sort((a, b) => {
                  const aStatus = getExpiryStatus(a.expiryDate)
                  const bStatus = getExpiryStatus(b.expiryDate)
                  if (!a.expiryDate && !b.expiryDate) return 0
                  if (!a.expiryDate) return 1
                  if (!b.expiryDate) return -1
                  return (aStatus.daysLeft || 0) - (bStatus.daysLeft || 0)
                })
                .map(renderItemRow)}
            </tbody>
          </table>
        </div>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">Add some inventory items to manage their expiry dates</p>
        </div>
      )}
    </div>
  )
}
