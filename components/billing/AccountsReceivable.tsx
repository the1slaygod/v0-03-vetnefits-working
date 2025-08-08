"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaChartLine, FaSearch, FaDownload, FaEye, FaEnvelope } from "react-icons/fa"

interface AccountReceivable {
  id: string
  clientName: string
  petName: string
  totalOutstanding: number
  overdueAmount: number
  currentAmount: number
  lastPaymentDate: string
  lastPaymentAmount: number
  invoiceCount: number
  daysPastDue: number
  contactInfo: {
    phone: string
    email: string
  }
}

export default function AccountsReceivable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("outstanding-desc")

  // Mock data
  const accounts: AccountReceivable[] = [
    {
      id: "1",
      clientName: "John Smith",
      petName: "Buddy",
      totalOutstanding: 3500,
      overdueAmount: 2000,
      currentAmount: 1500,
      lastPaymentDate: "2024-01-10",
      lastPaymentAmount: 1000,
      invoiceCount: 3,
      daysPastDue: 15,
      contactInfo: {
        phone: "+1-555-0123",
        email: "john.smith@email.com",
      },
    },
    {
      id: "2",
      clientName: "Sarah Johnson",
      petName: "Max",
      totalOutstanding: 1800,
      overdueAmount: 0,
      currentAmount: 1800,
      lastPaymentDate: "2024-01-20",
      lastPaymentAmount: 500,
      invoiceCount: 2,
      daysPastDue: 0,
      contactInfo: {
        phone: "+1-555-0456",
        email: "sarah.johnson@email.com",
      },
    },
    {
      id: "3",
      clientName: "Mike Wilson",
      petName: "Luna",
      totalOutstanding: 5200,
      overdueAmount: 3200,
      currentAmount: 2000,
      lastPaymentDate: "2024-01-05",
      lastPaymentAmount: 800,
      invoiceCount: 4,
      daysPastDue: 25,
      contactInfo: {
        phone: "+1-555-0789",
        email: "mike.wilson@email.com",
      },
    },
    {
      id: "4",
      clientName: "Emma Davis",
      petName: "Rocky",
      totalOutstanding: 750,
      overdueAmount: 750,
      currentAmount: 0,
      lastPaymentDate: "2023-12-28",
      lastPaymentAmount: 300,
      invoiceCount: 1,
      daysPastDue: 30,
      contactInfo: {
        phone: "+1-555-0321",
        email: "emma.davis@email.com",
      },
    },
  ]

  const filteredAccounts = accounts
    .filter((account) => {
      const matchesSearch =
        account.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.petName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "overdue" && account.overdueAmount > 0) ||
        (filterBy === "current" && account.overdueAmount === 0) ||
        (filterBy === "high-risk" && account.daysPastDue > 30)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "outstanding-desc":
          return b.totalOutstanding - a.totalOutstanding
        case "outstanding-asc":
          return a.totalOutstanding - b.totalOutstanding
        case "overdue-desc":
          return b.overdueAmount - a.overdueAmount
        case "days-past-due":
          return b.daysPastDue - a.daysPastDue
        case "client-name":
          return a.clientName.localeCompare(b.clientName)
        default:
          return 0
      }
    })

  const totalOutstanding = accounts.reduce((sum, acc) => sum + acc.totalOutstanding, 0)
  const totalOverdue = accounts.reduce((sum, acc) => sum + acc.overdueAmount, 0)
  const totalCurrent = accounts.reduce((sum, acc) => sum + acc.currentAmount, 0)

  const sendReminder = (account: AccountReceivable) => {
    console.log("Sending payment reminder to:", account.clientName)
    alert(`Payment reminder sent to ${account.clientName} at ${account.contactInfo.email}`)
  }

  const generateStatement = (account: AccountReceivable) => {
    console.log("Generating statement for:", account.clientName)
    alert(`Account statement generated for ${account.clientName}`)
  }

  const exportData = () => {
    console.log("Exporting accounts receivable data")
    alert("Accounts receivable data exported successfully!")
  }

  const getStatusBadge = (account: AccountReceivable) => {
    if (account.daysPastDue > 30) {
      return <Badge className="bg-red-100 text-red-800">High Risk</Badge>
    } else if (account.overdueAmount > 0) {
      return <Badge className="bg-orange-100 text-orange-800">Overdue</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">Current</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                <p className="text-2xl font-bold text-blue-600">₹{totalOutstanding.toLocaleString()}</p>
              </div>
              <FaChartLine className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                <p className="text-2xl font-bold text-red-600">₹{totalOverdue.toLocaleString()}</p>
              </div>
              <FaChartLine className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{totalCurrent.toLocaleString()}</p>
              </div>
              <FaChartLine className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaChartLine className="h-5 w-5" />
              <span>Accounts Receivable</span>
            </div>
            <Button onClick={exportData} className="flex items-center space-x-2">
              <FaDownload className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Search by client or pet name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline">
                  <FaSearch className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Filter By</Label>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="overdue">Overdue Only</SelectItem>
                  <SelectItem value="current">Current Only</SelectItem>
                  <SelectItem value="high-risk">High Risk (30+ days)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outstanding-desc">Outstanding (High to Low)</SelectItem>
                  <SelectItem value="outstanding-asc">Outstanding (Low to High)</SelectItem>
                  <SelectItem value="overdue-desc">Overdue Amount</SelectItem>
                  <SelectItem value="days-past-due">Days Past Due</SelectItem>
                  <SelectItem value="client-name">Client Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Accounts List */}
          <div className="space-y-4">
            {filteredAccounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{account.clientName}</h3>
                      {getStatusBadge(account)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Pet: {account.petName}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Outstanding</p>
                        <p className="font-medium text-blue-600">₹{account.totalOutstanding.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Overdue Amount</p>
                        <p className="font-medium text-red-600">₹{account.overdueAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Current Amount</p>
                        <p className="font-medium text-green-600">₹{account.currentAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Days Past Due</p>
                        <p className="font-medium">{account.daysPastDue} days</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        Last Payment: ₹{account.lastPaymentAmount.toLocaleString()} on {account.lastPaymentDate} |{" "}
                        {account.invoiceCount} invoice(s)
                      </p>
                      <p>
                        Contact: {account.contactInfo.phone} | {account.contactInfo.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => generateStatement(account)}>
                      <FaEye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => sendReminder(account)}>
                      <FaEnvelope className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-8">
              <FaChartLine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No accounts found matching your criteria</p>
            </div>
          )}

          {/* Summary */}
          {filteredAccounts.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Accounts Shown</p>
                  <p className="text-xl font-bold">{filteredAccounts.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Outstanding</p>
                  <p className="text-xl font-bold text-blue-600">
                    ₹{filteredAccounts.reduce((sum, acc) => sum + acc.totalOutstanding, 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Overdue</p>
                  <p className="text-xl font-bold text-red-600">
                    ₹{filteredAccounts.reduce((sum, acc) => sum + acc.overdueAmount, 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Collection Rate</p>
                  <p className="text-xl font-bold text-green-600">
                    {Math.round(((totalOutstanding - totalOverdue) / totalOutstanding) * 100 || 0)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
