"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FaMoneyCheckAlt, FaCheck, FaTimes, FaEye, FaPlus } from "react-icons/fa"

interface Cheque {
  id: string
  chequeNumber: string
  bankName: string
  amount: number
  clientName: string
  petName: string
  receivedDate: string
  chequeDate: string
  status: "on-hold" | "cleared" | "bounced"
  reason: string
  notes: string
}

export default function ChequesOnHold() {
  const [cheques, setCheques] = useState<Cheque[]>([
    {
      id: "1",
      chequeNumber: "123456",
      bankName: "State Bank of India",
      amount: 2500,
      clientName: "John Smith",
      petName: "Buddy",
      receivedDate: "2024-01-20",
      chequeDate: "2024-01-22",
      status: "on-hold",
      reason: "Post-dated cheque",
      notes: "Cheque dated for future clearance",
    },
    {
      id: "2",
      chequeNumber: "789012",
      bankName: "HDFC Bank",
      amount: 1800,
      clientName: "Sarah Johnson",
      petName: "Max",
      receivedDate: "2024-01-21",
      chequeDate: "2024-01-21",
      status: "on-hold",
      reason: "Verification pending",
      notes: "Waiting for bank verification",
    },
    {
      id: "3",
      chequeNumber: "345678",
      bankName: "ICICI Bank",
      amount: 3200,
      clientName: "Mike Wilson",
      petName: "Luna",
      receivedDate: "2024-01-18",
      chequeDate: "2024-01-25",
      status: "cleared",
      reason: "Cleared successfully",
      notes: "Amount credited to account",
    },
  ])

  const [selectedCheque, setSelectedCheque] = useState<Cheque | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCheque, setNewCheque] = useState({
    chequeNumber: "",
    bankName: "",
    amount: 0,
    clientName: "",
    petName: "",
    chequeDate: "",
    reason: "",
    notes: "",
  })

  const updateChequeStatus = (id: string, status: "cleared" | "bounced", reason: string) => {
    setCheques((prev) =>
      prev.map((cheque) =>
        cheque.id === id
          ? {
              ...cheque,
              status,
              reason,
              notes: status === "cleared" ? "Amount credited to account" : "Cheque returned by bank",
            }
          : cheque,
      ),
    )
    setSelectedCheque(null)
    alert(`Cheque ${status === "cleared" ? "cleared" : "marked as bounced"} successfully!`)
  }

  const addNewCheque = () => {
    if (!newCheque.chequeNumber || !newCheque.bankName || !newCheque.clientName || newCheque.amount <= 0) {
      alert("Please fill all required fields")
      return
    }

    const cheque: Cheque = {
      id: Date.now().toString(),
      ...newCheque,
      receivedDate: new Date().toISOString().split("T")[0],
      status: "on-hold",
    }

    setCheques((prev) => [...prev, cheque])
    setNewCheque({
      chequeNumber: "",
      bankName: "",
      amount: 0,
      clientName: "",
      petName: "",
      chequeDate: "",
      reason: "",
      notes: "",
    })
    setShowAddForm(false)
    alert("Cheque added successfully!")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on-hold":
        return <Badge className="bg-yellow-100 text-yellow-800">On Hold</Badge>
      case "cleared":
        return <Badge className="bg-green-100 text-green-800">Cleared</Badge>
      case "bounced":
        return <Badge className="bg-red-100 text-red-800">Bounced</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const onHoldCheques = cheques.filter((c) => c.status === "on-hold")
  const totalOnHoldAmount = onHoldCheques.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaMoneyCheckAlt className="h-5 w-5" />
              <span>Cheques on Hold</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-lg px-3 py-1">
                On Hold: ₹{totalOnHoldAmount.toLocaleString()}
              </Badge>
              <Button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2">
                <FaPlus className="h-4 w-4" />
                <span>Add Cheque</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Cheque Form */}
          {showAddForm && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-medium mb-4">Add New Cheque</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cheque Number *</Label>
                  <Input
                    placeholder="Enter cheque number"
                    value={newCheque.chequeNumber}
                    onChange={(e) => setNewCheque((prev) => ({ ...prev, chequeNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bank Name *</Label>
                  <Input
                    placeholder="Enter bank name"
                    value={newCheque.bankName}
                    onChange={(e) => setNewCheque((prev) => ({ ...prev, bankName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newCheque.amount || ""}
                    onChange={(e) =>
                      setNewCheque((prev) => ({ ...prev, amount: Number.parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cheque Date</Label>
                  <Input
                    type="date"
                    value={newCheque.chequeDate}
                    onChange={(e) => setNewCheque((prev) => ({ ...prev, chequeDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input
                    placeholder="Enter client name"
                    value={newCheque.clientName}
                    onChange={(e) => setNewCheque((prev) => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pet Name</Label>
                  <Input
                    placeholder="Enter pet name"
                    value={newCheque.petName}
                    onChange={(e) => setNewCheque((prev) => ({ ...prev, petName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reason for Hold</Label>
                  <Select
                    value={newCheque.reason}
                    onValueChange={(value) => setNewCheque((prev) => ({ ...prev, reason: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post-dated">Post-dated cheque</SelectItem>
                      <SelectItem value="verification-pending">Verification pending</SelectItem>
                      <SelectItem value="insufficient-funds">Insufficient funds suspected</SelectItem>
                      <SelectItem value="signature-mismatch">Signature verification</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes..."
                    value={newCheque.notes}
                    onChange={(e) => setNewCheque((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={addNewCheque}>Add Cheque</Button>
              </div>
            </div>
          )}

          {/* Cheques List */}
          <div className="space-y-4">
            {cheques.map((cheque) => (
              <div key={cheque.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">Cheque #{cheque.chequeNumber}</h3>
                      {getStatusBadge(cheque.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Bank</p>
                        <p className="font-medium">{cheque.bankName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-medium text-green-600">₹{cheque.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Client</p>
                        <p className="font-medium">{cheque.clientName}</p>
                        {cheque.petName && <p className="text-xs text-gray-500">Pet: {cheque.petName}</p>}
                      </div>
                      <div>
                        <p className="text-gray-600">Cheque Date</p>
                        <p className="font-medium">{cheque.chequeDate}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <p className="text-gray-600">
                        Received: {cheque.receivedDate} | Reason: {cheque.reason}
                      </p>
                      {cheque.notes && <p className="text-gray-500 mt-1">Notes: {cheque.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedCheque(cheque)}>
                      <FaEye className="h-4 w-4" />
                    </Button>
                    {cheque.status === "on-hold" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateChequeStatus(cheque.id, "cleared", "Cleared successfully")}
                          className="text-green-600"
                        >
                          <FaCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateChequeStatus(cheque.id, "bounced", "Cheque bounced")}
                          className="text-red-600"
                        >
                          <FaTimes className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {cheques.length === 0 && (
            <div className="text-center py-8">
              <FaMoneyCheckAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No cheques on hold</p>
              <Button onClick={() => setShowAddForm(true)} className="mt-4">
                Add First Cheque
              </Button>
            </div>
          )}

          {/* Summary */}
          {cheques.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">On Hold</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {onHoldCheques.length} (₹{totalOnHoldAmount.toLocaleString()})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cleared</p>
                  <p className="text-xl font-bold text-green-600">
                    {cheques.filter((c) => c.status === "cleared").length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bounced</p>
                  <p className="text-xl font-bold text-red-600">
                    {cheques.filter((c) => c.status === "bounced").length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cheque Details Modal */}
      {selectedCheque && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Cheque Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Cheque Number</p>
                <p className="font-medium">{selectedCheque.chequeNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bank</p>
                <p className="font-medium">{selectedCheque.bankName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-medium">₹{selectedCheque.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Client</p>
                <p className="font-medium">{selectedCheque.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                {getStatusBadge(selectedCheque.status)}
              </div>
              <div>
                <p className="text-sm text-gray-600">Reason</p>
                <p className="font-medium">{selectedCheque.reason}</p>
              </div>
              {selectedCheque.notes && (
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="font-medium">{selectedCheque.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedCheque(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
