"use client"

import { ChevronDown } from "lucide-react"

interface InventoryTabsProps {
  activeTab: string
  activeAction: string
  onTabChange: (tab: string, action: string) => void
}

export default function InventoryTabs({ activeTab, activeAction, onTabChange }: InventoryTabsProps) {
  const tabs = [
    {
      id: "stock",
      name: "Stock",
      color: "blue",
      actions: [
        { id: "view-all", name: "View All Stock", default: true },
        { id: "add-item", name: "Add Item" },
        { id: "update-quantity", name: "Update Quantity" },
        { id: "expiry-management", name: "Expiry Management" },
      ],
    },
    {
      id: "re-order",
      name: "Re-Order",
      color: "green",
      actions: [
        { id: "threshold-items", name: "Threshold Items", default: true },
        { id: "re-order-list", name: "Re-Order List" },
      ],
    },
    {
      id: "receiving",
      name: "Receiving",
      color: "orange",
      actions: [
        { id: "goods-inward-po", name: "Goods Inward with PO", default: true },
        { id: "goods-inward-no-po", name: "Goods Inward without PO" },
      ],
    },
    {
      id: "shrink-transfer",
      name: "Shrink/Transfer",
      color: "red",
      actions: [
        { id: "record-shrinkage", name: "Record Shrinkage / Loss / Damage", default: true },
        { id: "transfer-stock", name: "Transfer Stock to Another Clinic" },
        { id: "removal-log", name: "Stock Removal Log" },
      ],
    },
    {
      id: "more-tools",
      name: "More Tools",
      color: "gray",
      actions: [
        { id: "vendor-master", name: "Vendor Master", default: true },
        { id: "config-settings", name: "Future Config Settings" },
      ],
    },
  ]

  const getTabColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? "text-blue-600 border-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600",
      green: isActive ? "text-green-600 border-green-600 bg-green-50" : "text-gray-600 hover:text-green-600",
      orange: isActive ? "text-orange-600 border-orange-600 bg-orange-50" : "text-gray-600 hover:text-orange-600",
      red: isActive ? "text-red-600 border-red-600 bg-red-50" : "text-gray-600 hover:text-red-600",
      gray: isActive ? "text-gray-600 border-gray-600 bg-gray-50" : "text-gray-600 hover:text-gray-700",
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const getDropdownColorClasses = (color: string) => {
    const colors = {
      blue: "hover:bg-blue-50 hover:text-blue-600",
      green: "hover:bg-green-50 hover:text-green-600",
      orange: "hover:bg-orange-50 hover:text-orange-600",
      red: "hover:bg-red-50 hover:text-red-600",
      gray: "hover:bg-gray-50 hover:text-gray-700",
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border" style={{ overflow: "visible" }}>
      <div className="flex border-b border-gray-200 overflow-x-auto" style={{ overflow: "visible" }}>
        {tabs.map((tab) => (
          <div key={tab.id} className="relative group" style={{ zIndex: activeTab === tab.id ? 1000 : 1 }}>
            <button
              className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 border-transparent transition-all duration-200 whitespace-nowrap ${getTabColorClasses(tab.color, activeTab === tab.id)}`}
              onClick={() => {
                const defaultAction = tab.actions.find((a) => a.default)?.id || tab.actions[0].id
                onTabChange(tab.id, defaultAction)
              }}
            >
              {tab.name}
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>

            {/* Dropdown */}
            <div className="absolute top-full left-0 z-50 hidden group-hover:block">
              <div
                className="mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 fixed"
                style={{
                  position: "fixed",
                  transform: "translateY(0)",
                  zIndex: 9999,
                }}
              >
                {tab.actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => onTabChange(tab.id, action.id)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      activeTab === tab.id && activeAction === action.id
                        ? `bg-${tab.color}-50 text-${tab.color}-600 font-medium`
                        : `text-gray-700 ${getDropdownColorClasses(tab.color)}`
                    }`}
                  >
                    {action.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
