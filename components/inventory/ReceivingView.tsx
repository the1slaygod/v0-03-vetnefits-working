"use client"

import { useState } from "react"
import { FaPlus, FaCheck, FaFileInvoice } from "react-icons/fa"
import type { InventoryItem } from "../../app/inventory/page"

interface ReceivingViewProps {
  items: InventoryItem[]
  onUpdateItems: (items: InventoryItem[]) => void
}

interface ReceivingRecord {
  id: string
  poNumber?: string
  supplierName: string
  receivedDate: string
  items: {
    itemId: string
    itemName: string
    orderedQty: number
    receivedQty: number
    unitPrice: number
  }[]
  totalValue: number
  status: "pending" | "completed"
}

export default function ReceivingView({ items, onUpdateItems }: ReceivingViewProps) {
  const [activeTab, setActiveTab] = useState<"with-po" | "without-po">("with-po")
  const [showReceivingForm, setShowReceivingForm] = useState(false)
  const [receivingRecords, setReceivingRecords] = useState<ReceivingRecord[]>([
    {
      id: "1",
      poNumber: "PO-2024-001",
      supplierName: "VetSupply Co",
      receivedDate: "2024-01-20",
      items: [
        {
          itemId: "1",
          itemName: "Heartworm Prevention",
          orderedQty: 50,
          receivedQty: 50,
          unitPrice: 25.99,
        },
      ],
      totalValue: 1299.5,
      status: "completed",
    },
  ])

  const [newReceiving, setNewReceiving] = useState({
    poNumber: "",
    supplierName: "",
    items: [] as { itemId: string; itemName: string; orderedQty: number; receivedQty: number; unitPrice: number }[],
  })

  const handleReceiveGoods = (record: ReceivingRecord) => {
    // Update inventory quantities
    const updatedItems = items.map((item) => {
      const receivedItem = record.items.find((r) => r.itemId === item.id)
      if (receivedItem) {
        return {
          ...item,
          quantity: item.quantity + receivedItem.receivedQty,
          lastUpdated: new Date().toISOString().split("T")[0],
        }
      }
      return item
    })

    onUpdateItems(updatedItems)

    // Update record status
    setReceivingRecords((records) =>
      records.map((r) => (r.id === record.id ? { ...r, status: "completed" as const } : r)),
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("with-po")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "with-po"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Goods Inward with PO
          </button>
          <button
            onClick={() => setActiveTab("without-po")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "without-po"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Goods Inward without PO
          </button>
        </nav>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {activeTab === "with-po" ? "Receiving with Purchase Order" : "Receiving without Purchase Order"}
        </h2>
        <button
          onClick={() => setShowReceivingForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          New Receiving
        </button>
      </div>

      {/* Receiving Records */}
      <div className="space-y-4">
        {receivingRecords
          .filter((record) => (activeTab === "with-po" ? record.poNumber : !record.poNumber))
          .map((record) => (
            <div key={record.id} className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {record.poNumber ? `PO: ${record.poNumber}` : "Direct Receiving"}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {record.status === "completed" ? "Completed" : "Pending"}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      Supplier: {record.supplierName} • Date: {new Date(record.receivedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">${record.totalValue.toFixed(2)}</div>
                    {record.status === "pending" && (
                      <button
                        onClick={() => handleReceiveGoods(record)}
                        className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center"
                      >
                        <FaCheck className="mr-1" />
                        Receive
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="pb-2">Item</th>
                        <th className="pb-2">Ordered</th>
                        <th className="pb-2">Received</th>
                        <th className="pb-2">Unit Price</th>
                        <th className="pb-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {record.items.map((item, index) => (
                        <tr key={index} className="text-sm">
                          <td className="py-2 font-medium text-gray-900">{item.itemName}</td>
                          <td className="py-2 text-gray-600">{item.orderedQty}</td>
                          <td className="py-2">
                            <span
                              className={`font-medium ${
                                item.receivedQty === item.orderedQty
                                  ? "text-green-600"
                                  : item.receivedQty > item.orderedQty
                                    ? "text-blue-600"
                                    : "text-yellow-600"
                              }`}
                            >
                              {item.receivedQty}
                            </span>
                          </td>
                          <td className="py-2 text-gray-600">${item.unitPrice.toFixed(2)}</td>
                          <td className="py-2 font-medium text-gray-900">
                            ${(item.receivedQty * item.unitPrice).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
      </div>

      {receivingRecords.filter((record) => (activeTab === "with-po" ? record.poNumber : !record.poNumber)).length ===
        0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <FaFileInvoice className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No receiving records</h3>
          <p className="text-gray-600 mb-4">
            {activeTab === "with-po" ? "No goods received with purchase orders yet" : "No direct goods received yet"}
          </p>
          <button
            onClick={() => setShowReceivingForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Receiving
          </button>
        </div>
      )}

      {/* Receiving Form Modal */}
      {showReceivingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                New Receiving - {activeTab === "with-po" ? "With PO" : "Without PO"}
              </h2>
              <button onClick={() => setShowReceivingForm(false)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {activeTab === "with-po" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                    <input
                      type="text"
                      value={newReceiving.poNumber}
                      onChange={(e) => setNewReceiving({ ...newReceiving, poNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter PO number"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={newReceiving.supplierName}
                    onChange={(e) => setNewReceiving({ ...newReceiving, supplierName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter supplier name"
                  />
                </div>
              </div>

              <div className="text-center py-8 text-gray-500">Receiving form implementation would go here...</div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReceivingForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Receiving
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
