"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaShoppingCart, FaPlus, FaTrash, FaEdit, FaCheck } from "react-icons/fa"

interface CartItem {
  id: string
  name: string
  type: "service" | "product"
  unitPrice: number
  quantity: number
  discount: number
  total: number
  clientName: string
  petName: string
  addedDate: string
}

export default function CartItems() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Dog Vaccination - Rabies",
      type: "service",
      unitPrice: 500,
      quantity: 1,
      discount: 0,
      total: 500,
      clientName: "John Smith",
      petName: "Buddy",
      addedDate: "2024-01-22",
    },
    {
      id: "2",
      name: "Premium Dog Food - 5kg",
      type: "product",
      unitPrice: 800,
      quantity: 2,
      discount: 50,
      total: 1550,
      clientName: "Sarah Johnson",
      petName: "Max",
      addedDate: "2024-01-22",
    },
    {
      id: "3",
      name: "Health Checkup",
      type: "service",
      unitPrice: 300,
      quantity: 1,
      discount: 0,
      total: 300,
      clientName: "Mike Wilson",
      petName: "Luna",
      addedDate: "2024-01-21",
    },
  ])

  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({
    name: "",
    type: "service" as "service" | "product",
    unitPrice: 0,
    quantity: 1,
    discount: 0,
    clientName: "",
    petName: "",
  })
  const [showAddForm, setShowAddForm] = useState(false)

  const updateCartItem = (id: string, field: keyof CartItem, value: any) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          // Recalculate total when quantity, unitPrice, or discount changes
          if (field === "quantity" || field === "unitPrice" || field === "discount") {
            updated.total = updated.unitPrice * updated.quantity - updated.discount
          }
          return updated
        }
        return item
      }),
    )
  }

  const removeCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const addNewItem = () => {
    if (!newItem.name || !newItem.clientName || !newItem.petName || newItem.unitPrice <= 0) {
      alert("Please fill all required fields")
      return
    }

    const item: CartItem = {
      id: Date.now().toString(),
      ...newItem,
      total: newItem.unitPrice * newItem.quantity - newItem.discount,
      addedDate: new Date().toISOString().split("T")[0],
    }

    setCartItems((prev) => [...prev, item])
    setNewItem({
      name: "",
      type: "service",
      unitPrice: 0,
      quantity: 1,
      discount: 0,
      clientName: "",
      petName: "",
    })
    setShowAddForm(false)
  }

  const generateInvoice = () => {
    if (cartItems.length === 0) {
      alert("Cart is empty")
      return
    }

    // Group items by client
    const clientGroups = cartItems.reduce(
      (acc, item) => {
        const key = `${item.clientName}-${item.petName}`
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(item)
        return acc
      },
      {} as Record<string, CartItem[]>,
    )

    console.log("Generating invoices for:", clientGroups)
    alert(`Generated ${Object.keys(clientGroups).length} invoice(s) successfully!`)

    // Clear cart after generating invoices
    setCartItems([])
  }

  const totalCartValue = cartItems.reduce((sum, item) => sum + item.total, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaShoppingCart className="h-5 w-5" />
              <span>Cart Items</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-lg px-3 py-1">
                Total: ₹{totalCartValue.toLocaleString()}
              </Badge>
              <Button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2">
                <FaPlus className="h-4 w-4" />
                <span>Add Item</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Item Form */}
          {showAddForm && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-medium mb-4">Add New Item to Cart</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Item Name *</Label>
                  <Input
                    placeholder="Enter item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newItem.type}
                    onValueChange={(value: "service" | "product") => setNewItem((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unit Price *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newItem.unitPrice || ""}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, unitPrice: Number.parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newItem.discount || ""}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, discount: Number.parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input
                    placeholder="Enter client name"
                    value={newItem.clientName}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pet Name *</Label>
                  <Input
                    placeholder="Enter pet name"
                    value={newItem.petName}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, petName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={addNewItem}>Add to Cart</Button>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <FaShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
              <Button onClick={() => setShowAddForm(true)} className="mt-4">
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge variant={item.type === "service" ? "default" : "secondary"}>{item.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Client: {item.clientName} | Pet: {item.petName}
                      </p>
                      <p className="text-xs text-gray-500">Added: {item.addedDate}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                      >
                        {editingItem === item.id ? <FaCheck className="h-4 w-4" /> : <FaEdit className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeCartItem(item.id)}>
                        <FaTrash className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  {editingItem === item.id ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateCartItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateCartItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Discount</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.discount}
                          onChange={(e) => updateCartItem(item.id, "discount", Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Total</Label>
                        <div className="p-2 bg-gray-100 rounded border">
                          <p className="font-medium">₹{item.total.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Unit Price</p>
                        <p className="font-medium">₹{item.unitPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Quantity</p>
                        <p className="font-medium">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Discount</p>
                        <p className="font-medium">₹{item.discount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total</p>
                        <p className="font-medium text-green-600">₹{item.total.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Cart Actions */}
          {cartItems.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">{cartItems.length} items in cart</p>
                <p className="text-lg font-bold">Total: ₹{totalCartValue.toLocaleString()}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setCartItems([])}>
                  Clear Cart
                </Button>
                <Button onClick={generateInvoice} className="flex items-center space-x-2">
                  <FaCheck className="h-4 w-4" />
                  <span>Generate Invoice(s)</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
