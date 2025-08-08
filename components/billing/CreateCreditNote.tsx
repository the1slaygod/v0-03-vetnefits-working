"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FaSearch, FaFileInvoiceDollar, FaPlus } from "react-icons/fa"

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  petName: string
  totalAmount: number
  paidAmount: number
  date: string
  status: "paid" | "partial" | "unpaid"
}

export default function CreateCreditNote() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [creditAmount, setCreditAmount] = useState("")
  const [creditReason, setCreditReason] = useState("")
  const [creditDate, setCreditDate] = useState(new Date().toISOString().split("T")[0])
  const [description, setDescription] = useState("")
  const [reference, setReference] = useState("")

  // Mock data
  const invoices: Invoice[] = [
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      clientName: "John Smith",
      petName: "Buddy",
      totalAmount: 2500,
      paidAmount: 2500,
      date: "2024-01-15",
      status: "paid",
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      clientName: "Sarah Johnson",
      petName: "Max",
      totalAmount: 1800,
      paidAmount: 1000,
      date: "2024-01-20",
      status: "partial",
    },
    {
      id: "3",
      invoiceNumber: "INV-2024-003",
      clientName: "Mike Wilson",
      petName: "Luna",
      totalAmount: 3200,
      paidAmount: 0,
      date: "2024-01-18",
      status: "unpaid",
    },
  ]

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.petName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreditNoteSubmit = () => {
    if (!selectedInvoice || !creditAmount || !creditReason || !description) {
      alert("Please fill all required fields")
      return
    }

    const creditAmountNum = Number.parseFloat(creditAmount)
    if (creditAmountNum > selectedInvoice.totalAmount) {
      alert("Credit amount cannot exceed invoice total")
      return
    }

    // Simulate API call
    console.log("Creating credit note:", {
      invoiceId: selectedInvoice.id,
      creditAmount: creditAmountNum,
      reason: creditReason,
      description,
      date: creditDate,
      reference,
    })

    alert("Credit note created successfully!")

    // Reset form
    setSelectedInvoice(null)
    setCreditAmount("")
    setCreditReason("")
    setDescription("")
    setReference("")
    setSearchTerm("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
      case "unpaid":
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FaFileInvoiceDollar className="h-5 w-5" />
            <span>Create Credit Note</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Search */}
          <div className="space-y-4">
            <Label>Select Invoice</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Search by invoice number, client, or pet name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <FaSearch className="h-4 w-4" />
              </Button>
            </div>

            {searchTerm && (
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {filteredInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedInvoice?.id === invoice.id ? "bg-blue-50 border-blue-200" : ""
                    }`}
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Client: {invoice.clientName}</p>
                            <p className="text-gray-600">Pet: {invoice.petName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Date: {invoice.date}</p>
                            <p className="text-gray-600">Total: ₹{invoice.totalAmount.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="text-gray-600">
                            Paid: ₹{invoice.paidAmount.toLocaleString()} | Balance: ₹
                            {(invoice.totalAmount - invoice.paidAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredInvoices.length === 0 && (
                  <div className="p-4 text-center text-gray-500">No invoices found matching your search</div>
                )}
              </div>
            )}
          </div>

          {/* Credit Note Form */}
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium">Selected Invoice: {selectedInvoice.invoiceNumber}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Client: {selectedInvoice.clientName} | Pet: {selectedInvoice.petName}
                </p>
                <p className="text-sm text-gray-600">Invoice Total: ₹{selectedInvoice.totalAmount.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credit-amount">Credit Amount *</Label>
                  <Input
                    id="credit-amount"
                    type="number"
                    placeholder="Enter credit amount"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    max={selectedInvoice.totalAmount}
                  />
                  <p className="text-xs text-gray-500">Maximum: ₹{selectedInvoice.totalAmount.toLocaleString()}</p>
                </div>

                <div className="space-y-2">
                  <Label>Credit Reason *</Label>
                  <Select value={creditReason} onValueChange={setCreditReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service-not-provided">Service Not Provided</SelectItem>
                      <SelectItem value="billing-error">Billing Error</SelectItem>
                      <SelectItem value="discount-applied">Discount Applied</SelectItem>
                      <SelectItem value="return-goods">Return of Goods</SelectItem>
                      <SelectItem value="overpayment">Overpayment Adjustment</SelectItem>
                      <SelectItem value="promotional-credit">Promotional Credit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credit-date">Credit Date</Label>
                  <Input
                    id="credit-date"
                    type="date"
                    value={creditDate}
                    onChange={(e) => setCreditDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    placeholder="Internal reference (optional)"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the credit note..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              {/* Preview */}
              {creditAmount && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">Credit Note Preview</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">
                        Credit Amount: ₹{Number.parseFloat(creditAmount || "0").toLocaleString()}
                      </p>
                      <p className="text-gray-600">Original Invoice: {selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        New Balance: ₹
                        {(selectedInvoice.totalAmount - Number.parseFloat(creditAmount || "0")).toLocaleString()}
                      </p>
                      <p className="text-gray-600">Credit Date: {creditDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedInvoice(null)
                    setCreditAmount("")
                    setCreditReason("")
                    setDescription("")
                    setReference("")
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreditNoteSubmit} className="flex items-center space-x-2">
                  <FaPlus className="h-4 w-4" />
                  <span>Create Credit Note</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
