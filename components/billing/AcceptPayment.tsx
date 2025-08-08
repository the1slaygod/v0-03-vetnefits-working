"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FaSearch, FaCreditCard, FaMoneyBillWave, FaCheck } from "react-icons/fa"

interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  amount: number
  paidAmount: number
  balance: number
  services: string[]
}

interface Client {
  id: string
  name: string
  phone: string
  pets: { id: string; name: string; species: string }[]
}

export default function AcceptPayment() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMode, setPaymentMode] = useState("")
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data
  const clients: Client[] = [
    {
      id: "1",
      name: "John Smith",
      phone: "+1-555-0123",
      pets: [
        { id: "1", name: "Buddy", species: "Dog" },
        { id: "2", name: "Whiskers", species: "Cat" },
      ],
    },
    {
      id: "2",
      name: "Sarah Johnson",
      phone: "+1-555-0456",
      pets: [{ id: "3", name: "Max", species: "Dog" }],
    },
  ]

  const outstandingInvoices: Invoice[] = [
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      date: "2024-01-15",
      amount: 2500,
      paidAmount: 1000,
      balance: 1500,
      services: ["Vaccination", "Health Checkup"],
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      date: "2024-01-20",
      amount: 1800,
      paidAmount: 0,
      balance: 1800,
      services: ["Surgery", "Medication"],
    },
  ]

  const filteredClients = clients.filter(
    (client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.phone.includes(searchTerm),
  )

  const selectedInvoiceData = outstandingInvoices.filter((inv) => selectedInvoices.includes(inv.id))

  const totalSelectedAmount = selectedInvoiceData.reduce((sum, inv) => sum + inv.balance, 0)

  const handleInvoiceToggle = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId) ? prev.filter((id) => id !== invoiceId) : [...prev, invoiceId],
    )
  }

  const handlePaymentSubmit = () => {
    if (!selectedClient || selectedInvoices.length === 0 || !paymentAmount || !paymentMode) {
      alert("Please fill all required fields")
      return
    }

    // Simulate API call
    console.log("Processing payment:", {
      client: selectedClient,
      invoices: selectedInvoices,
      amount: Number.parseFloat(paymentAmount),
      mode: paymentMode,
      date: paymentDate,
      reference,
      notes,
    })

    alert("Payment processed successfully!")

    // Reset form
    setSelectedClient(null)
    setSelectedInvoices([])
    setPaymentAmount("")
    setPaymentMode("")
    setReference("")
    setNotes("")
    setSearchTerm("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FaCreditCard className="h-5 w-5" />
            <span>Accept Payment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-4">
            <Label>Select Client/Pet</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Search by client name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <FaSearch className="h-4 w-4" />
              </Button>
            </div>

            {searchTerm && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedClient?.id === client.id ? "bg-blue-50 border-blue-200" : ""
                    }`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-gray-600">{client.phone}</p>
                        <div className="flex space-x-2 mt-1">
                          {client.pets.map((pet) => (
                            <Badge key={pet.id} variant="outline" className="text-xs">
                              {pet.name} ({pet.species})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outstanding Invoices */}
          {selectedClient && (
            <div className="space-y-4">
              <Label>Outstanding Invoices</Label>
              <div className="border rounded-lg">
                {outstandingInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedInvoices.includes(invoice.id) ? "bg-blue-50 border-blue-200" : ""
                    }`}
                    onClick={() => handleInvoiceToggle(invoice.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <Badge variant="outline">{invoice.date}</Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">Services: {invoice.services.join(", ")}</p>
                          <div className="flex space-x-4 text-sm">
                            <span>Total: ₹{invoice.amount}</span>
                            <span>Paid: ₹{invoice.paidAmount}</span>
                            <span className="font-medium text-red-600">Balance: ₹{invoice.balance}</span>
                          </div>
                        </div>
                      </div>
                      {selectedInvoices.includes(invoice.id) && <FaCheck className="h-5 w-5 text-green-600" />}
                    </div>
                  </div>
                ))}
              </div>

              {selectedInvoices.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium">Total Selected Amount: ₹{totalSelectedAmount.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {/* Payment Details */}
          {selectedInvoices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={totalSelectedAmount}
                />
                <p className="text-xs text-gray-500">Maximum: ₹{totalSelectedAmount.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <Label>Payment Mode *</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Payment Date</Label>
                <Input id="date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  placeholder="Transaction/Cheque reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          {selectedInvoices.length > 0 && (
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedClient(null)
                  setSelectedInvoices([])
                  setPaymentAmount("")
                  setSearchTerm("")
                }}
              >
                Cancel
              </Button>
              <Button onClick={handlePaymentSubmit} className="flex items-center space-x-2">
                <FaMoneyBillWave className="h-4 w-4" />
                <span>Process Payment</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
