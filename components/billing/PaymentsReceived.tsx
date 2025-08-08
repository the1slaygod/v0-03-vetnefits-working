"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaHandHoldingUsd, FaSearch, FaDownload, FaEye, FaFilter } from "react-icons/fa"

interface PaymentReceived {
  id: string
  receiptNumber: string
  invoiceNumber: string
  clientName: string
  petName: string
  amount: number
  paymentMode: string
  paymentDate: string
  receivedBy: string
  reference: string
  status: "completed" | "pending" | "failed"
  notes: string
}

export default function PaymentsReceived() {
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentModeFilter, setPaymentModeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<PaymentReceived | null>(null)

  // Mock data
  const payments: PaymentReceived[] = [
    {
      id: "1",
      receiptNumber: "RCP-2024-001",
      invoiceNumber: "INV-2024-001",
      clientName: "John Smith",
      petName: "Buddy",
      amount: 2500,
      paymentMode: "card",
      paymentDate: "2024-01-16",
      receivedBy: "Dr. Smith",
      reference: "TXN123456789",
      status: "completed",
      notes: "Payment for vaccination and checkup",
    },
    {
      id: "2",
      receiptNumber: "RCP-2024-002",
      invoiceNumber: "INV-2024-002",
      clientName: "Sarah Johnson",
      petName: "Max",
      amount: 1000,
      paymentMode: "cash",
      paymentDate: "2024-01-22",
      receivedBy: "Dr. Johnson",
      reference: "",
      status: "completed",
      notes: "Partial payment for surgery",
    },
    {
      id: "3",
      receiptNumber: "RCP-2024-003",
      invoiceNumber: "INV-2024-005",
      clientName: "Lisa Brown",
      petName: "Whiskers",
      amount: 1200,
      paymentMode: "upi",
      paymentDate: "2024-01-26",
      receivedBy: "Dr. Smith",
      reference: "UPI987654321",
      status: "completed",
      notes: "Full payment for spaying procedure",
    },
    {
      id: "4",
      receiptNumber: "RCP-2024-004",
      invoiceNumber: "INV-2024-006",
      clientName: "Robert Davis",
      petName: "Charlie",
      amount: 800,
      paymentMode: "cheque",
      paymentDate: "2024-01-28",
      receivedBy: "Dr. Johnson",
      reference: "CHQ456789",
      status: "pending",
      notes: "Cheque under clearance",
    },
    {
      id: "5",
      receiptNumber: "RCP-2024-005",
      invoiceNumber: "INV-2024-007",
      clientName: "Maria Garcia",
      petName: "Bella",
      amount: 450,
      paymentMode: "bank-transfer",
      paymentDate: "2024-01-29",
      receivedBy: "Dr. Smith",
      reference: "TRF789123456",
      status: "completed",
      notes: "Payment for grooming services",
    },
  ]

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.petName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPaymentMode = paymentModeFilter === "all" || payment.paymentMode === paymentModeFilter
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter

    const matchesDateRange = (() => {
      if (!dateFrom && !dateTo) return true
      const paymentDate = new Date(payment.paymentDate)
      const fromDate = dateFrom ? new Date(dateFrom) : null
      const toDate = dateTo ? new Date(dateTo) : null

      if (fromDate && toDate) {
        return paymentDate >= fromDate && paymentDate <= toDate
      } else if (fromDate) {
        return paymentDate >= fromDate
      } else if (toDate) {
        return paymentDate <= toDate
      }
      return true
    })()

    return matchesSearch && matchesPaymentMode && matchesStatus && matchesDateRange
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
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

  const viewPaymentDetails = (payment: PaymentReceived) => {
    setSelectedPayment(payment)
  }

  const exportPayments = () => {
    console.log("Exporting payments data")
    alert("Payments data exported successfully!")
  }

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const completedAmount = filteredPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0)
  const pendingAmount = filteredPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Received</p>
                <p className="text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</p>
              </div>
              <FaHandHoldingUsd className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">₹{completedAmount.toLocaleString()}</p>
              </div>
              <FaHandHoldingUsd className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">₹{pendingAmount.toLocaleString()}</p>
              </div>
              <FaHandHoldingUsd className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaHandHoldingUsd className="h-5 w-5" />
              <span>Payments Received</span>
            </div>
            <Button onClick={exportPayments} className="flex items-center space-x-2">
              <FaDownload className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Search by receipt, invoice, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline">
                  <FaSearch className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Date To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setPaymentModeFilter("all")
                  setStatusFilter("all")
                  setDateFrom("")
                  setDateTo("")
                }}
                className="w-full"
              >
                <FaFilter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Payments List */}
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{payment.receiptNumber}</h3>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Invoice</p>
                        <p className="font-medium">{payment.invoiceNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Client</p>
                        <p className="font-medium">{payment.clientName}</p>
                        <p className="text-xs text-gray-500">Pet: {payment.petName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-medium text-green-600">₹{payment.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Payment Mode</p>
                        <p className="font-medium">{getPaymentModeLabel(payment.paymentMode)}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        Date: {payment.paymentDate} | Received by: {payment.receivedBy}
                        {payment.reference && ` | Ref: ${payment.reference}`}
                      </p>
                      {payment.notes && <p className="mt-1">Notes: {payment.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => viewPaymentDetails(payment)}>
                      <FaEye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <FaHandHoldingUsd className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No payments found matching your criteria</p>
            </div>
          )}

          {/* Summary */}
          {filteredPayments.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-xl font-bold">{filteredPayments.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-xl font-bold text-blue-600">
                    {filteredPayments.filter((p) => p.status === "completed").length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {filteredPayments.filter((p) => p.status === "pending").length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Payment Details</h3>
              <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                ×
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Receipt Number</p>
                <p className="font-medium">{selectedPayment.receiptNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Invoice Number</p>
                <p className="font-medium">{selectedPayment.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Client</p>
                <p className="font-medium">{selectedPayment.clientName}</p>
                <p className="text-sm text-gray-500">Pet: {selectedPayment.petName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-medium text-lg">₹{selectedPayment.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Mode</p>
                <p className="font-medium">{getPaymentModeLabel(selectedPayment.paymentMode)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Date</p>
                <p className="font-medium">{selectedPayment.paymentDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Received By</p>
                <p className="font-medium">{selectedPayment.receivedBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                {getStatusBadge(selectedPayment.status)}
              </div>
              {selectedPayment.reference && (
                <div>
                  <p className="text-sm text-gray-600">Reference</p>
                  <p className="font-medium">{selectedPayment.reference}</p>
                </div>
              )}
              {selectedPayment.notes && (
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="font-medium">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
