"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaSearch, FaEye, FaDownload, FaPrint, FaEdit } from "react-icons/fa"

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  petName: string
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  invoiceDate: string
  dueDate: string
  status: "paid" | "partial" | "unpaid" | "overdue"
  services: string[]
  paymentMode?: string
  lastPaymentDate?: string
}

export default function SearchInvoice() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchBy, setSearchBy] = useState("invoice-number")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Mock data
  const invoices: Invoice[] = [
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      clientName: "John Smith",
      petName: "Buddy",
      totalAmount: 2500,
      paidAmount: 2500,
      balanceAmount: 0,
      invoiceDate: "2024-01-15",
      dueDate: "2024-01-30",
      status: "paid",
      services: ["Vaccination", "Health Checkup"],
      paymentMode: "Card",
      lastPaymentDate: "2024-01-16",
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      clientName: "Sarah Johnson",
      petName: "Max",
      totalAmount: 1800,
      paidAmount: 1000,
      balanceAmount: 800,
      invoiceDate: "2024-01-20",
      dueDate: "2024-02-04",
      status: "partial",
      services: ["Surgery", "Medication"],
      paymentMode: "Cash",
      lastPaymentDate: "2024-01-22",
    },
    {
      id: "3",
      invoiceNumber: "INV-2024-003",
      clientName: "Mike Wilson",
      petName: "Luna",
      totalAmount: 3200,
      paidAmount: 0,
      balanceAmount: 3200,
      invoiceDate: "2024-01-18",
      dueDate: "2024-02-02",
      status: "unpaid",
      services: ["Dental Cleaning", "X-Ray", "Blood Test"],
    },
    {
      id: "4",
      invoiceNumber: "INV-2024-004",
      clientName: "Emma Davis",
      petName: "Rocky",
      totalAmount: 750,
      paidAmount: 0,
      balanceAmount: 750,
      invoiceDate: "2023-12-28",
      dueDate: "2024-01-12",
      status: "overdue",
      services: ["Grooming", "Nail Trimming"],
    },
    {
      id: "5",
      invoiceNumber: "INV-2024-005",
      clientName: "Lisa Brown",
      petName: "Whiskers",
      totalAmount: 1200,
      paidAmount: 1200,
      balanceAmount: 0,
      invoiceDate: "2024-01-25",
      dueDate: "2024-02-09",
      status: "paid",
      services: ["Spaying", "Post-op Care"],
      paymentMode: "UPI",
      lastPaymentDate: "2024-01-26",
    },
  ]

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = (() => {
      switch (searchBy) {
        case "invoice-number":
          return invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
        case "client-name":
          return invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
        case "pet-name":
          return invoice.petName.toLowerCase().includes(searchTerm.toLowerCase())
        case "amount":
          return invoice.totalAmount.toString().includes(searchTerm)
        default:
          return true
      }
    })()

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    const matchesDateRange = (() => {
      if (!dateFrom && !dateTo) return true
      const invoiceDate = new Date(invoice.invoiceDate)
      const fromDate = dateFrom ? new Date(dateFrom) : null
      const toDate = dateTo ? new Date(dateTo) : null

      if (fromDate && toDate) {
        return invoiceDate >= fromDate && invoiceDate <= toDate
      } else if (fromDate) {
        return invoiceDate >= fromDate
      } else if (toDate) {
        return invoiceDate <= toDate
      }
      return true
    })()

    return matchesSearch && matchesStatus && matchesDateRange
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
      case "unpaid":
        return <Badge className="bg-blue-100 text-blue-800">Unpaid</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const viewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
  }

  const downloadInvoice = (invoice: Invoice) => {
    console.log("Downloading invoice:", invoice.invoiceNumber)
    alert(`Invoice ${invoice.invoiceNumber} downloaded successfully!`)
  }

  const printInvoice = (invoice: Invoice) => {
    console.log("Printing invoice:", invoice.invoiceNumber)
    alert(`Invoice ${invoice.invoiceNumber} sent to printer!`)
  }

  const editInvoice = (invoice: Invoice) => {
    console.log("Editing invoice:", invoice.invoiceNumber)
    alert(`Opening invoice ${invoice.invoiceNumber} for editing...`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FaSearch className="h-5 w-5" />
            <span>Search Invoice</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search By</Label>
              <Select value={searchBy} onValueChange={setSearchBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice-number">Invoice Number</SelectItem>
                  <SelectItem value="client-name">Client Name</SelectItem>
                  <SelectItem value="pet-name">Pet Name</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search Term</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter search term..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline">
                  <FaSearch className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
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
                  setStatusFilter("all")
                  setDateFrom("")
                  setDateTo("")
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Search Results ({filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? "s" : ""})
              </h3>
            </div>

            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Client</p>
                        <p className="font-medium">{invoice.clientName}</p>
                        <p className="text-xs text-gray-500">Pet: {invoice.petName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-medium">₹{invoice.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">
                          Paid: ₹{invoice.paidAmount.toLocaleString()} | Balance: ₹
                          {invoice.balanceAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date</p>
                        <p className="font-medium">{invoice.invoiceDate}</p>
                        <p className="text-xs text-gray-500">Due: {invoice.dueDate}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Services: {invoice.services.join(", ")}</p>
                      {invoice.lastPaymentDate && (
                        <p>
                          Last Payment: {invoice.lastPaymentDate} ({invoice.paymentMode})
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => viewInvoice(invoice)}>
                      <FaEye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadInvoice(invoice)}>
                      <FaDownload className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => printInvoice(invoice)}>
                      <FaPrint className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => editInvoice(invoice)}>
                      <FaEdit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredInvoices.length === 0 && (
              <div className="text-center py-8">
                <FaSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No invoices found matching your search criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Invoice Details</h3>
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                ×
              </Button>
            </div>

            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedInvoice.invoiceNumber}</h2>
                    <p className="text-gray-600">Date: {selectedInvoice.invoiceDate}</p>
                    <p className="text-gray-600">Due Date: {selectedInvoice.dueDate}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(selectedInvoice.status)}
                    <p className="text-2xl font-bold mt-2">₹{selectedInvoice.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Client Information</h4>
                  <p className="text-gray-600">Name: {selectedInvoice.clientName}</p>
                  <p className="text-gray-600">Pet: {selectedInvoice.petName}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Payment Information</h4>
                  <p className="text-gray-600">Total Amount: ₹{selectedInvoice.totalAmount.toLocaleString()}</p>
                  <p className="text-gray-600">Paid Amount: ₹{selectedInvoice.paidAmount.toLocaleString()}</p>
                  <p className="text-gray-600">Balance: ₹{selectedInvoice.balanceAmount.toLocaleString()}</p>
                  {selectedInvoice.lastPaymentDate && (
                    <p className="text-gray-600">
                      Last Payment: {selectedInvoice.lastPaymentDate} ({selectedInvoice.paymentMode})
                    </p>
                  )}
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="font-medium mb-2">Services Provided</h4>
                <div className="space-y-2">
                  {selectedInvoice.services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{service}</span>
                      <span className="font-medium">
                        ₹{Math.round(selectedInvoice.totalAmount / selectedInvoice.services.length).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => downloadInvoice(selectedInvoice)}>
                  <FaDownload className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => printInvoice(selectedInvoice)}>
                  <FaPrint className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button onClick={() => editInvoice(selectedInvoice)}>
                  <FaEdit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
