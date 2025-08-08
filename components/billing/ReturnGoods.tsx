"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FaSearch, FaUndo, FaShoppingCart } from "react-icons/fa"

interface BillItem {
  id: string
  invoiceNumber: string
  clientName: string
  petName: string
  itemName: string
  itemType: "service" | "product"
  quantity: number
  unitPrice: number
  totalPrice: number
  billDate: string
  returnableQuantity: number
}

interface ReturnItem extends BillItem {
  returnQuantity: number
  returnReason: string
}

export default function ReturnGoods() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState<ReturnItem[]>([])
  const [returnMode, setReturnMode] = useState<"refund" | "credit">("credit")
  const [notes, setNotes] = useState("")

  // Mock data
  const billItems: BillItem[] = [
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      clientName: "John Smith",
      petName: "Buddy",
      itemName: "Dog Vaccination - Rabies",
      itemType: "service",
      quantity: 1,
      unitPrice: 500,
      totalPrice: 500,
      billDate: "2024-01-15",
      returnableQuantity: 0, // Services typically can't be returned
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-001",
      clientName: "John Smith",
      petName: "Buddy",
      itemName: "Dog Food - Premium 5kg",
      itemType: "product",
      quantity: 2,
      unitPrice: 800,
      totalPrice: 1600,
      billDate: "2024-01-15",
      returnableQuantity: 2,
    },
    {
      id: "3",
      invoiceNumber: "INV-2024-002",
      clientName: "Sarah Johnson",
      petName: "Max",
      itemName: "Flea Treatment Spray",
      itemType: "product",
      quantity: 1,
      unitPrice: 350,
      totalPrice: 350,
      billDate: "2024-01-20",
      returnableQuantity: 1,
    },
    {
      id: "4",
      invoiceNumber: "INV-2024-003",
      clientName: "Mike Wilson",
      petName: "Luna",
      itemName: "Cat Litter - 10kg",
      itemType: "product",
      quantity: 3,
      unitPrice: 200,
      totalPrice: 600,
      billDate: "2024-01-18",
      returnableQuantity: 1, // 2 already used/opened
    },
  ]

  const filteredItems = billItems.filter(
    (item) =>
      (item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      item.returnableQuantity > 0,
  )

  const handleItemSelect = (item: BillItem) => {
    const existingItem = selectedItems.find((si) => si.id === item.id)
    if (existingItem) {
      setSelectedItems((prev) => prev.filter((si) => si.id !== item.id))
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          ...item,
          returnQuantity: 1,
          returnReason: "",
        },
      ])
    }
  }

  const updateReturnQuantity = (itemId: string, quantity: number) => {
    setSelectedItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, returnQuantity: quantity } : item)))
  }

  const updateReturnReason = (itemId: string, reason: string) => {
    setSelectedItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, returnReason: reason } : item)))
  }

  const handleReturnSubmit = () => {
    if (selectedItems.length === 0) {
      alert("Please select items to return")
      return
    }

    const invalidItems = selectedItems.filter(
      (item) => !item.returnReason || item.returnQuantity <= 0 || item.returnQuantity > item.returnableQuantity,
    )

    if (invalidItems.length > 0) {
      alert("Please fill all required fields and check quantities")
      return
    }

    // Simulate API call
    console.log("Processing return:", {
      items: selectedItems,
      returnMode,
      notes,
    })

    alert(`Return processed successfully! ${returnMode === "refund" ? "Refund" : "Credit"} will be applied.`)

    // Reset form
    setSelectedItems([])
    setReturnMode("credit")
    setNotes("")
    setSearchTerm("")
  }

  const totalReturnAmount = selectedItems.reduce((sum, item) => sum + item.unitPrice * item.returnQuantity, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FaUndo className="h-5 w-5" />
            <span>Return Goods & Services</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <Label>Search Past Bills</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Search by invoice, client, pet, or item name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <FaSearch className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bill Items */}
          {searchTerm && (
            <div className="space-y-4">
              <Label>Returnable Items</Label>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedItems.some((si) => si.id === item.id) ? "bg-blue-50 border-blue-200" : ""
                    }`}
                    onClick={() => handleItemSelect(item)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="font-medium">{item.itemName}</p>
                          <Badge variant={item.itemType === "service" ? "default" : "secondary"}>{item.itemType}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Invoice: {item.invoiceNumber}</p>
                            <p className="text-gray-600">
                              Client: {item.clientName} ({item.petName})
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Date: {item.billDate}</p>
                            <p className="text-gray-600">Unit Price: ₹{item.unitPrice}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm">
                          <span className="text-gray-600">Original Qty: {item.quantity}</span>
                          <span className="text-green-600 font-medium">Returnable: {item.returnableQuantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <div className="p-4 text-center text-gray-500">No returnable items found matching your search</div>
                )}
              </div>
            </div>
          )}

          {/* Selected Items for Return */}
          {selectedItems.length > 0 && (
            <div className="space-y-4">
              <Label>Items to Return</Label>
              <div className="space-y-4">
                {selectedItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-gray-600">
                          {item.clientName} - {item.petName} ({item.invoiceNumber})
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedItems((prev) => prev.filter((si) => si.id !== item.id))}
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Return Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          max={item.returnableQuantity}
                          value={item.returnQuantity}
                          onChange={(e) => updateReturnQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                        />
                        <p className="text-xs text-gray-500">Max: {item.returnableQuantity}</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Return Reason</Label>
                        <Select value={item.returnReason} onValueChange={(value) => updateReturnReason(item.id, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="defective">Defective Product</SelectItem>
                            <SelectItem value="wrong-item">Wrong Item Delivered</SelectItem>
                            <SelectItem value="expired">Expired Product</SelectItem>
                            <SelectItem value="not-needed">No Longer Needed</SelectItem>
                            <SelectItem value="duplicate">Duplicate Order</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Return Amount</Label>
                        <div className="p-2 bg-white rounded border">
                          <p className="font-medium">₹{(item.unitPrice * item.returnQuantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Return Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <p className="font-medium">Total Return Amount:</p>
                  <p className="text-xl font-bold text-green-600">₹{totalReturnAmount.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Return Mode</Label>
                    <Select value={returnMode} onValueChange={(value: "refund" | "credit") => setReturnMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit">Store Credit</SelectItem>
                        <SelectItem value="refund">Cash Refund</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about the return..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedItems([])
                    setReturnMode("credit")
                    setNotes("")
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleReturnSubmit} className="flex items-center space-x-2">
                  <FaShoppingCart className="h-4 w-4" />
                  <span>Process Return</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
