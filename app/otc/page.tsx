"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Plus, Download, Receipt, DollarSign, Package } from "lucide-react"

interface OTCSale {
  id: string
  productName: string
  quantity: number
  price: number
  totalAmount: number
  buyerName?: string
  buyerPhone?: string
  petName?: string
  petId?: string
  clinicId: string
  soldOn: string
  soldBy: string
  receiptNumber: string
  createdAt: string
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
}

export default function OTCPage() {
  // Format currency to INR
  const formatINR = (amount: number) => {
    return (amount * 83).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  const [activeTab, setActiveTab] = useState("new-sale")
  const [showNewSale, setShowNewSale] = useState(false)

  // Mock products
  const [products] = useState<Product[]>([
    { id: "1", name: "Flea Shampoo", price: 1327, stock: 25, category: "Grooming" }, // 15.99 * 83
    { id: "2", name: "Dog Treats", price: 706, stock: 50, category: "Food" }, // 8.5 * 83
    { id: "3", name: "Cat Litter", price: 1078, stock: 30, category: "Supplies" }, // 12.99 * 83
    { id: "4", name: "Pet Vitamins", price: 2074, stock: 15, category: "Health" }, // 24.99 * 83
    { id: "5", name: "Dental Chews", price: 1556, stock: 40, category: "Health" }, // 18.75 * 83
  ])

  const [sales, setSales] = useState<OTCSale[]>([
    {
      id: "1",
      productName: "Flea Shampoo",
      quantity: 2,
      price: 15.99,
      totalAmount: 31.98,
      buyerName: "John Smith",
      buyerPhone: "(555) 123-4567",
      petName: "Buddy",
      petId: "pet1",
      clinicId: "clinic1",
      soldOn: "2024-01-25",
      soldBy: "Dr. Sarah Wilson",
      receiptNumber: "OTC-001",
      createdAt: "2024-01-25T10:30:00Z",
    },
  ])

  const [newSale, setNewSale] = useState({
    productName: "",
    quantity: 1,
    price: 0,
    buyerName: "",
    buyerPhone: "",
    petName: "",
    soldBy: "Dr. Sarah Wilson",
  })

  const handleProductSelect = (product: Product) => {
    setNewSale({
      ...newSale,
      productName: product.name,
      price: product.price,
    })
  }

  const handleAddSale = () => {
    if (!newSale.productName || newSale.quantity <= 0) return

    const sale: OTCSale = {
      id: Date.now().toString(),
      ...newSale,
      totalAmount: newSale.price * newSale.quantity,
      clinicId: "clinic1",
      soldOn: new Date().toISOString().split("T")[0],
      receiptNumber: `OTC-${String(sales.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
    }

    setSales([sale, ...sales])
    setNewSale({
      productName: "",
      quantity: 1,
      price: 0,
      buyerName: "",
      buyerPhone: "",
      petName: "",
      soldBy: "Dr. Sarah Wilson",
    })
    setShowNewSale(false)
  }

  const generateReceipt = (sale: OTCSale) => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>OTC Receipt - ${sale.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; max-width: 400px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .receipt-info { margin: 10px 0; }
            .total { font-size: 18px; font-weight: bold; border-top: 1px solid #333; padding-top: 10px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Vetnefits Veterinary Clinic</h2>
            <p>Over-the-Counter Receipt</p>
            <p>Receipt #: ${sale.receiptNumber}</p>
          </div>
          <div class="receipt-info">
            <p><strong>Date:</strong> ${new Date(sale.soldOn).toLocaleDateString()}</p>
            <p><strong>Sold By:</strong> ${sale.soldBy}</p>
            ${sale.buyerName ? `<p><strong>Customer:</strong> ${sale.buyerName}</p>` : ""}
            ${sale.buyerPhone ? `<p><strong>Phone:</strong> ${sale.buyerPhone}</p>` : ""}
            ${sale.petName ? `<p><strong>Pet:</strong> ${sale.petName}</p>` : ""}
          </div>
          <div style="border-top: 1px solid #ccc; padding-top: 10px;">
            <p><strong>Product:</strong> ${sale.productName}</p>
            <p><strong>Quantity:</strong> ${sale.quantity}</p>
            <p><strong>Unit Price:</strong> ${formatINR(sale.price)}</p>
          </div>
          <div class="total">
            <p>Total Amount: ${formatINR(sale.totalAmount)}</p>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Keep this receipt for your records</p>
          </div>
        </body>
      </html>
    `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const todaysSales = sales.filter((sale) => sale.soldOn === new Date().toISOString().split("T")[0])
  const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Over-the-Counter (OTC) Sales</h1>
          <p className="text-gray-600 mt-2">Manage product sales and generate receipts</p>
        </div>
        <Button onClick={() => setShowNewSale(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-green-600">{formatINR(todaysRevenue)}</div>
              <div className="text-sm text-gray-600">Today's Revenue</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <ShoppingCart className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{todaysSales.length}</div>
              <div className="text-sm text-gray-600">Today's Sales</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Package className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-purple-600">{products.length}</div>
              <div className="text-sm text-gray-600">Products Available</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Receipt className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-orange-600">{sales.length}</div>
              <div className="text-sm text-gray-600">Total Sales</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new-sale">New Sale</TabsTrigger>
          <TabsTrigger value="sales-history">Sales History</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="new-sale" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Quick Sale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{product.name}</h3>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                    <p className="text-lg font-bold text-green-600">{formatINR(product.price)}</p>
                    <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales-history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="mr-2 h-5 w-5" />
                Sales History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sales.map((sale) => (
                  <div key={sale.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{sale.productName}</h3>
                          <Badge variant="outline">#{sale.receiptNumber}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p>
                              <strong>Quantity:</strong> {sale.quantity}
                            </p>
                            <p>
                              <strong>Unit Price:</strong> {formatINR(sale.price)}
                            </p>
                            <p>
                              <strong>Total:</strong> {formatINR(sale.totalAmount)}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Date:</strong> {new Date(sale.soldOn).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Sold By:</strong> {sale.soldBy}
                            </p>
                            {sale.buyerName && (
                              <p>
                                <strong>Customer:</strong> {sale.buyerName}
                              </p>
                            )}
                          </div>
                          <div>
                            {sale.buyerPhone && (
                              <p>
                                <strong>Phone:</strong> {sale.buyerPhone}
                              </p>
                            )}
                            {sale.petName && (
                              <p>
                                <strong>Pet:</strong> {sale.petName}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" onClick={() => generateReceipt(sale)}>
                          <Receipt className="h-4 w-4 mr-1" />
                          Print
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => generateReceipt(sale)}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Product Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-600">Category: {product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{formatINR(product.price)}</p>
                        <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Sale Modal */}
      {showNewSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">New OTC Sale</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product</label>
                <select
                  value={newSale.productName}
                  onChange={(e) => {
                    const product = products.find((p) => p.name === e.target.value)
                    setNewSale({
                      ...newSale,
                      productName: e.target.value,
                      price: product?.price || 0,
                    })
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.name}>
                      {product.name} - ${product.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={newSale.quantity}
                  onChange={(e) => setNewSale({ ...newSale, quantity: Number.parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newSale.price}
                  onChange={(e) => setNewSale({ ...newSale, price: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name (Optional)</label>
                <Input
                  value={newSale.buyerName}
                  onChange={(e) => setNewSale({ ...newSale, buyerName: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                <Input
                  value={newSale.buyerPhone}
                  onChange={(e) => setNewSale({ ...newSale, buyerPhone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pet Name (Optional)</label>
                <Input
                  value={newSale.petName}
                  onChange={(e) => setNewSale({ ...newSale, petName: e.target.value })}
                  placeholder="Pet name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sold By</label>
                <select
                  value={newSale.soldBy}
                  onChange={(e) => setNewSale({ ...newSale, soldBy: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Dr. Sarah Wilson">Dr. Sarah Wilson</option>
                  <option value="Dr. Mike Davis">Dr. Mike Davis</option>
                  <option value="Dr. Lisa Garcia">Dr. Lisa Garcia</option>
                </select>
              </div>
              {newSale.price > 0 && newSale.quantity > 0 && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">Total: ${(newSale.price * newSale.quantity).toFixed(2)}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowNewSale(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSale}>Complete Sale</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
