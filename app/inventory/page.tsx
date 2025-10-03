"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Sidebar from "../../components/Sidebar"
import InventoryTabs from "../../components/inventory/InventoryTabs"
import StockView from "../../components/inventory/StockView"
import AddItemModal from "../../components/inventory/AddItemModal"
import UpdateQuantityView from "../../components/inventory/UpdateQuantityView"
import ExpiryManagementView from "../../components/inventory/ExpiryManagementView"
import ReOrderView from "../../components/inventory/ReOrderView"
import ThresholdItemsView from "../../components/inventory/ThresholdItemsView"
import ReceivingView from "../../components/inventory/ReceivingView"
import ShrinkTransferView from "../../components/inventory/ShrinkTransferView"
import VendorMasterModal from "../../components/inventory/VendorMasterModal"

export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  minStock: number
  unitPrice: number
  expiryDate?: string
  binLocation?: string
  supplier?: string
  lastUpdated: string
  batchNumber?: string
  receivedQty?: number
  salesQty?: number
}

export interface Vendor {
  id: string
  name: string
  gst: string
  contact: string
  email: string
  address?: string
}

export interface ShrinkRecord {
  id: string
  itemId: string
  itemName: string
  quantity: number
  reason: "damage" | "loss" | "transfer" | "expired"
  remarks: string
  date: string
  transferToClinic?: string
}

export default function InventoryPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("stock")
  const [activeAction, setActiveAction] = useState("view-all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showVendorModal, setShowVendorModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Mock data
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "Heartworm Prevention",
      category: "Medication",
      quantity: 45,
      minStock: 20,
      unitPrice: 25.99,
      expiryDate: "2024-12-31",
      binLocation: "A1",
      supplier: "VetSupply Co",
      lastUpdated: "2024-01-20",
      batchNumber: "HW2024001",
      receivedQty: 50,
      salesQty: 5,
    },
    {
      id: "2",
      name: "Flea & Tick Shampoo",
      category: "Grooming",
      quantity: 8,
      minStock: 15,
      unitPrice: 12.5,
      expiryDate: "2024-08-15",
      binLocation: "B2",
      supplier: "Pet Care Plus",
      lastUpdated: "2024-01-18",
      batchNumber: "FT2024002",
      receivedQty: 20,
      salesQty: 12,
    },
    {
      id: "3",
      name: "Surgical Gloves",
      category: "Supplies",
      quantity: 150,
      minStock: 50,
      unitPrice: 0.25,
      binLocation: "C1",
      supplier: "Medical Supplies Inc",
      lastUpdated: "2024-01-19",
      batchNumber: "SG2024003",
      receivedQty: 200,
      salesQty: 50,
    },
    {
      id: "4",
      name: "Dog Food (Premium)",
      category: "Food",
      quantity: 25,
      minStock: 30,
      unitPrice: 45.99,
      expiryDate: "2024-06-30",
      binLocation: "D1",
      supplier: "Pet Nutrition Co",
      lastUpdated: "2024-01-17",
      batchNumber: "DF2024004",
      receivedQty: 40,
      salesQty: 15,
    },
    {
      id: "5",
      name: "Antibiotics",
      category: "Medication",
      quantity: 12,
      minStock: 20,
      unitPrice: 89.99,
      expiryDate: "2024-09-15",
      binLocation: "A2",
      supplier: "VetSupply Co",
      lastUpdated: "2024-01-16",
      batchNumber: "AB2024005",
      receivedQty: 25,
      salesQty: 13,
    },
  ])

  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: "1",
      name: "VetSupply Co",
      gst: "GST123456789",
      contact: "+1 (555) 123-4567",
      email: "orders@vetsupply.com",
      address: "123 Supply St, City, State 12345",
    },
    {
      id: "2",
      name: "Pet Care Plus",
      gst: "GST987654321",
      contact: "+1 (555) 987-6543",
      email: "sales@petcareplus.com",
      address: "456 Care Ave, City, State 67890",
    },
  ])

  const [shrinkRecords, setShrinkRecords] = useState<ShrinkRecord[]>([
    {
      id: "1",
      itemId: "2",
      itemName: "Flea & Tick Shampoo",
      quantity: 2,
      reason: "damage",
      remarks: "Bottles broken during transport",
      date: "2024-01-15",
    },
  ])

  // Handle URL params
  useEffect(() => {
    const tab = searchParams.get("tab") || "stock"
    const action = searchParams.get("action") || "view-all"
    setActiveTab(tab)
    setActiveAction(action)
  }, [searchParams])

  // ------------------------------------------------------------------
  // Open / close modals based on the current tab & action
  // ------------------------------------------------------------------
  useEffect(() => {
    // “Add Item” modal
    if (activeTab === "stock" && activeAction === "add-item") {
      setShowAddModal(true)
    }

    // “Vendor Master” modal
    if (activeTab === "more-tools" && activeAction === "vendor-master") {
      setShowVendorModal(true)
    }
    // NOTE: do NOT add a setter for other combinations here – keeps effect cheap
  }, [activeTab, activeAction])

  const updateURL = (tab: string, action: string) => {
    const params = new URLSearchParams()
    params.set("tab", tab)
    params.set("action", action)
    router.push(`/inventory?${params.toString()}`)
  }

  const handleTabChange = (tab: string, action: string) => {
    setActiveTab(tab)
    setActiveAction(action)
    updateURL(tab, action)
  }

  const handleAddItem = (newItem: Omit<InventoryItem, "id" | "lastUpdated">) => {
    const item: InventoryItem = {
      ...newItem,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split("T")[0],
    }
    setItems([...items, item])
    setShowAddModal(false)
  }

  const handleEditItem = (updatedItem: InventoryItem) => {
    setItems(
      items.map((item) =>
        item.id === updatedItem.id ? { ...updatedItem, lastUpdated: new Date().toISOString().split("T")[0] } : item,
      ),
    )
    setEditingItem(null)
  }

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString().split("T")[0] } : item,
      ),
    )
  }

  const handleAddVendor = (newVendor: Omit<Vendor, "id">) => {
    const vendor: Vendor = {
      ...newVendor,
      id: Date.now().toString(),
    }
    setVendors([...vendors, vendor])
  }

  const handleAddShrinkRecord = (record: Omit<ShrinkRecord, "id" | "date">) => {
    const shrinkRecord: ShrinkRecord = {
      ...record,
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
    }
    setShrinkRecords([...shrinkRecords, shrinkRecord])

    // Update item quantity
    setItems(
      items.map((item) =>
        item.id === record.itemId ? { ...item, quantity: Math.max(0, item.quantity - record.quantity) } : item,
      ),
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "stock":
        switch (activeAction) {
          case "view-all":
            return (
              <StockView
                items={items}
                searchTerm={searchTerm}
                categoryFilter={categoryFilter}
                onEdit={setEditingItem}
                onDelete={handleDeleteItem}
                onAddNew={() => setShowAddModal(true)}
              />
            )
          case "add-item":
            return (
              <StockView
                items={items}
                searchTerm={searchTerm}
                categoryFilter={categoryFilter}
                onEdit={setEditingItem}
                onDelete={handleDeleteItem}
                onAddNew={() => setShowAddModal(true)}
              />
            )
          case "update-quantity":
            return <UpdateQuantityView items={items} onUpdateQuantity={handleUpdateQuantity} />
          case "expiry-management":
            return <ExpiryManagementView items={items} onEdit={setEditingItem} />
          default:
            return null
        }
      case "re-order":
        switch (activeAction) {
          case "threshold-items":
            return <ThresholdItemsView items={items} />
          case "re-order-list":
            return <ReOrderView items={items} />
          default:
            return null
        }
      case "receiving":
        return <ReceivingView items={items} onUpdateItems={setItems} />
      case "shrink-transfer":
        return (
          <ShrinkTransferView items={items} shrinkRecords={shrinkRecords} onAddShrinkRecord={handleAddShrinkRecord} />
        )
      case "more-tools":
        switch (activeAction) {
          case "vendor-master":
            return <div className="p-6">Opening Vendor Master...</div>
          default:
            return <div className="p-6">More tools coming soon...</div>
        }
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600 mt-2">Manage your clinic's inventory and supplies</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="medication">Medication</option>
                <option value="supplies">Supplies</option>
                <option value="grooming">Grooming</option>
                <option value="food">Food</option>
              </select>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <InventoryTabs activeTab={activeTab} activeAction={activeAction} onTabChange={handleTabChange} />
          </div>

          {/* Content */}
          <div className="mt-6" style={{ position: "relative", zIndex: 1 }}>
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Modals */}
      {(showAddModal || editingItem) && (
        <AddItemModal
          item={editingItem}
          onSave={editingItem ? handleEditItem : handleAddItem}
          onClose={() => {
            setShowAddModal(false)
            setEditingItem(null)
            updateURL("stock", "view-all") // <-- return to list view
          }}
        />
      )}

      {showVendorModal && (
        <VendorMasterModal
          vendors={vendors}
          onAddVendor={handleAddVendor}
          onClose={() => {
            setShowVendorModal(false)
            updateURL("more-tools", "none") // <-- any safe default
          }}
        />
      )}
    </div>
  )
}
