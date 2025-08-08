"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaSearch, FaUndo, FaExclamationTriangle } from "react-icons/fa"

interface Payment {
  id: string
  invoiceNumber: string
  clientName: string
  petName: string
  amount: number
  paymentMode: string
  paymentDate: string
  reference: string
  status: "completed" | "refunded" | "partial-refund"
}

export default function RefundPayment() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [refundAmount, setRefundAmount] = useState("")
  const [refundReason, setRefundReason] = useState("")
  const [refundMode, setRefundMode] = useState("")
  const [refundReference, setRefundReference] = useState("")

  // Mock data
  const payments: Payment[] = [
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      clientName: "John Smith",
      petName: "Buddy",
      amount: 2500,
      paymentMode: "card",
      paymentDate: "2024-01-15",
      reference: "TXN123456",
      status: "completed",
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      clientName: "Sarah Johnson",
      petName: "Max",
      amount: 1800,
      paymentMode: "cash",
      paymentDate: "2024-01-20",
      reference: "",
      status: "completed",
    },
    {
      id: "3",
      invoiceNumber: "INV-2024-003",
      clientName: "Mike Wilson",
      petName: "Luna",
      amount: 3200,
      paymentMode: "upi",
      paymentDate: "2024-01-18",
      reference: "UPI789012",
      status: "partial-refund",
    },
  ]

  const filteredPayments = payments.filter(
    (payment) =>
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.petName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRefundSubmit = () => {
    if (!selectedPayment || !refundAmount || !refundReason || !refundMode) {
      alert("Please fill all required fields")
      return
    }

    const refundAmountNum = Number.parseFloat(refundAmount)
    if (refundAmountNum > selectedPayment.amount) {
      alert("Refund amount cannot exceed original payment amount")
      return
    }

    // Simulate API call
    console.log("Processing refund:", {
      paymentId: selectedPayment.id,
      refundAmount: refundAmountNum,
      reason: refundReason,
      mode: refundMode,
      reference: refundReference,
    })

    alert("Refund processed successfully!")

    // Reset form
    setSelectedPayment(null)
    setRefundAmount("")
    setRefundReason("")
    setRefundMode("")
    setRefundReference("")
    setSearchTerm("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "refunded":
        return <Badge className="bg-red-100 text-red-800">Refunded</Badge>
      case "partial-refund":
        return <Badge className="bg-yellow-100 text-yellow-800">Partial Refund</Badge>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FaUndo className="h-5 w-5" />
            <span>Refund / Cancel Payment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <Label>Search Payment</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Search by invoice ID, client name, or pet name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <FaSearch className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Payment Results */}
          {searchTerm && (
            <div className="space-y-4">
              <Label>Payment History</Label>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedPayment?.id === payment.id ? "bg-blue-50 border-blue-200" : ""
                    }`}
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="font-medium">{payment.invoiceNumber}</p>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Client: {payment.clientName}</p>
                            <p className="text-gray-600">Pet: {payment.petName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Amount: ₹{payment.amount.toLocaleString()}</p>
                            <p className="text-gray-600">Date: {payment.paymentDate}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm">
                          <span className="text-gray-600">Mode: {getPaymentModeLabel(payment.paymentMode)}</span>
                          {payment.reference && <span className="text-gray-600">Ref: {payment.reference}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredPayments.length === 0 && (
                  <div className="p-4 text-center text-gray-500">No payments found matching your search</div>
                )}
              </div>
            </div>
          )}

          {/* Refund Form */}
          {selectedPayment && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <FaExclamationTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Refund Details</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Original Payment: ₹{selectedPayment.amount.toLocaleString()} via{" "}
                      {getPaymentModeLabel(selectedPayment.paymentMode)}
                      {selectedPayment.status === "partial-refund" && (
                        <span className="block mt-1">This payment has already been partially refunded.</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refund-amount">Refund Amount *</Label>
                  <Input
                    id="refund-amount"
                    type="number"
                    placeholder="Enter refund amount"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    max={selectedPayment.amount}
                  />
                  <p className="text-xs text-gray-500">Maximum: ₹{selectedPayment.amount.toLocaleString()}</p>
                </div>

                <div className="space-y-2">
                  <Label>Refund Mode *</Label>
                  <Select value={refundMode} onValueChange={setRefundMode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select refund mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Same as Original Payment</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refund-reference">Refund Reference</Label>
                  <Input
                    id="refund-reference"
                    placeholder="Refund transaction reference"
                    value={refundReference}
                    onChange={(e) => setRefundReference(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Refund Reason *</Label>
                  <Select value={refundReason} onValueChange={setRefundReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service-cancelled">Service Cancelled</SelectItem>
                      <SelectItem value="duplicate-payment">Duplicate Payment</SelectItem>
                      <SelectItem value="service-not-provided">Service Not Provided</SelectItem>
                      <SelectItem value="customer-request">Customer Request</SelectItem>
                      <SelectItem value="billing-error">Billing Error</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPayment(null)
                    setRefundAmount("")
                    setRefundReason("")
                    setRefundMode("")
                    setRefundReference("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRefundSubmit}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                >
                  <FaUndo className="h-4 w-4" />
                  <span>Process Refund</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
