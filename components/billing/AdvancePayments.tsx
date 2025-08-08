"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FaSearch, FaMoneyBillWave, FaHistory, FaPlus } from "react-icons/fa"

interface Client {
  id: string
  name: string
  phone: string
  pets: { id: string; name: string; species: string }[]
  advanceBalance: number
}

interface AdvancePayment {
  id: string
  clientName: string
  petName: string
  amount: number
  paymentMode: string
  paymentDate: string
  reference: string
  usedAmount: number
  remainingBalance: number
  status: "active" | "used" | "refunded"
}

export default function AdvancePayments() {
  const [activeTab, setActiveTab] = useState<"accept" | "history">("accept")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMode, setPaymentMode] = useState("")
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")

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
      advanceBalance: 1500,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      phone: "+1-555-0456",
      pets: [{ id: "3", name: "Max", species: "Dog" }],
      advanceBalance: 0,
    },
    {
      id: "3",
      name: "Mike Wilson",
      phone: "+1-555-0789",
      pets: [{ id: "4", name: "Luna", species: "Cat" }],
      advanceBalance: 2300,
    },
  ]

  const advancePayments: AdvancePayment[] = [
    {
      id: "1",
      clientName: "John Smith",
      petName: "Buddy",
      amount: 2000,
      paymentMode: "card",
      paymentDate: "2024-01-10",
      reference: "TXN789012",
      usedAmount: 500,
      remainingBalance: 1500,
      status: "active",
    },
    {
      id: "2",
      clientName: "Mike Wilson",
      petName: "Luna",
      amount: 3000,
      paymentMode: "upi",
      paymentDate: "2024-01-12",
      reference: "UPI456789",
      usedAmount: 700,
      remainingBalance: 2300,
      status: "active",
    },
    {
      id: "3",
      clientName: "Emma Davis",
      petName: "Rocky",
      amount: 1500,
      paymentMode: "cash",
      paymentDate: "2024-01-08",
      reference: "",
      usedAmount: 1500,
      remainingBalance: 0,
      status: "used",
    },
  ]

  const filteredClients = clients.filter(
    (client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.phone.includes(searchTerm),
  )

  const handleAdvancePaymentSubmit = () => {
    if (!selectedClient || !paymentAmount || !paymentMode) {
      alert("Please fill all required fields")
      return
    }

    // Simulate API call
    console.log("Processing advance payment:", {
      client: selectedClient,
      amount: Number.parseFloat(paymentAmount),
      mode: paymentMode,
      date: paymentDate,
      reference,
      notes,
    })

    alert("Advance payment processed successfully!")

    // Reset form
    setSelectedClient(null)
    setPaymentAmount("")
    setPaymentMode("")
    setReference("")
    setNotes("")
    setSearchTerm("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "used":
        return <Badge className="bg-gray-100 text-gray-800">Fully Used</Badge>
      case "refunded":
        return <Badge className="bg-red-100 text-red-800">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentModeLabel = (mode: string) => {
    const modes: { [key: string]: string } = {
      cash: "Cash",
      card: "Credit/Debit Card",
      upi: "UPI",
      cheque: "Cheque",
      "bank-transfer": "Bank Transfer",
    }
    return modes[mode] || mode
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === "accept" ? "default" : "outline"}
          onClick={() => setActiveTab("accept")}
          className="flex items-center space-x-2"
        >
          <FaPlus className="h-4 w-4" />
          <span>Accept Advance Payment</span>
        </Button>
        <Button
          variant={activeTab === "history" ? "default" : "outline"}
          onClick={() => setActiveTab("history")}
          className="flex items-center space-x-2"
        >
          <FaHistory className="h-4 w-4" />
          <span>Advance Payment History</span>
        </Button>
      </div>

      {activeTab === "accept" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FaMoneyBillWave className="h-5 w-5" />
              <span>Accept Advance Payment</span>
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
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Current Advance</p>
                          <p className="font-medium text-green-600">₹{client.advanceBalance.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Details */}
            {selectedClient && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium">Selected Client: {selectedClient.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Current Advance Balance: ₹{selectedClient.advanceBalance.toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Advance Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter advance amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
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
                      placeholder="Purpose of advance payment..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedClient(null)
                      setPaymentAmount("")
                      setSearchTerm("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAdvancePaymentSubmit} className="flex items-center space-x-2">
                    <FaMoneyBillWave className="h-4 w-4" />
                    <span>Accept Advance Payment</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FaHistory className="h-5 w-5" />
              <span>Advance Payment History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {advancePayments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium">{payment.clientName}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                      <p className="text-sm text-gray-600">Pet: {payment.petName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">₹{payment.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{payment.paymentDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Payment Mode</p>
                      <p className="font-medium">{getPaymentModeLabel(payment.paymentMode)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Used Amount</p>
                      <p className="font-medium text-red-600">₹{payment.usedAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Remaining Balance</p>
                      <p className="font-medium text-green-600">₹{payment.remainingBalance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Reference</p>
                      <p className="font-medium">{payment.reference || "N/A"}</p>
                    </div>
                  </div>

                  {payment.remainingBalance > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <Button size="sm" variant="outline">
                        Use in Invoice
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
