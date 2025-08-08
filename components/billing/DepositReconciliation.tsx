"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaChartLine, FaCheck, FaTimes, FaExclamationTriangle, FaPlus } from "react-icons/fa"

interface DepositRecord {
  id: string
  depositDate: string
  bankAccount: string
  expectedAmount: number
  actualAmount: number
  difference: number
  status: "matched" | "unmatched" | "pending"
  paymentModes: {
    cash: number
    card: number
    upi: number
    cheque: number
    bankTransfer: number
  }
  reconciliationNotes: string
}

export default function DepositReconciliation() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedBank, setSelectedBank] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDeposit, setNewDeposit] = useState({
    depositDate: new Date().toISOString().split("T")[0],
    bankAccount: "",
    actualAmount: 0,
    reconciliationNotes: "",
  })

  // Mock data
  const [deposits, setDeposits] = useState<DepositRecord[]>([
    {
      id: "1",
      depositDate: "2024-01-22",
      bankAccount: "SBI - ****1234",
      expectedAmount: 15420,
      actualAmount: 15420,
      difference: 0,
      status: "matched",
      paymentModes: {
        cash: 5000,
        card: 7500,
        upi: 2920,
        cheque: 0,
        bankTransfer: 0,
      },
      reconciliationNotes: "All payments matched successfully",
    },
    {
      id: "2",
      depositDate: "2024-01-21",
      bankAccount: "HDFC - ****5678",
      expectedAmount: 8750,
      actualAmount: 8500,
      difference: -250,
      status: "unmatched",
      paymentModes: {
        cash: 3000,
        card: 4500,
        upi: 1250,
        cheque: 0,
        bankTransfer: 0,
      },
      reconciliationNotes: "Card payment discrepancy - investigating",
    },
    {
      id: "3",
      depositDate: "2024-01-20",
      bankAccount: "ICICI - ****9012",
      expectedAmount: 12300,
      actualAmount: 0,
      difference: -12300,
      status: "pending",
      paymentModes: {
        cash: 4500,
        card: 6000,
        upi: 1800,
        cheque: 0,
        bankTransfer: 0,
      },
      reconciliationNotes: "Deposit not yet processed by bank",
    },
  ])

  const filteredDeposits = deposits.filter((deposit) => {
    const matchesDate = !selectedDate || deposit.depositDate === selectedDate
    const matchesBank = selectedBank === "all" || deposit.bankAccount.includes(selectedBank)
    return matchesDate && matchesBank
  })

  const addNewDeposit = () => {
    if (!newDeposit.bankAccount || newDeposit.actualAmount <= 0) {
      alert("Please fill all required fields")
      return
    }

    // Calculate expected amount from today's payments (mock calculation)
    const expectedAmount = 10000 // This would come from actual payment data

    const deposit: DepositRecord = {
      id: Date.now().toString(),
      ...newDeposit,
      expectedAmount,
      difference: newDeposit.actualAmount - expectedAmount,
      status: newDeposit.actualAmount === expectedAmount ? "matched" : "unmatched",
      paymentModes: {
        cash: Math.round(expectedAmount * 0.3),
        card: Math.round(expectedAmount * 0.4),
        upi: Math.round(expectedAmount * 0.2),
        cheque: Math.round(expectedAmount * 0.05),
        bankTransfer: Math.round(expectedAmount * 0.05),
      },
    }

    setDeposits((prev) => [deposit, ...prev])
    setNewDeposit({
      depositDate: new Date().toISOString().split("T")[0],
      bankAccount: "",
      actualAmount: 0,
      reconciliationNotes: "",
    })
    setShowAddForm(false)
    alert("Deposit record added successfully!")
  }

  const updateDepositStatus = (id: string, status: "matched" | "unmatched", notes: string) => {
    setDeposits((prev) =>
      prev.map((deposit) => (deposit.id === id ? { ...deposit, status, reconciliationNotes: notes } : deposit)),
    )
    alert(`Deposit status updated to ${status}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "matched":
        return <Badge className="bg-green-100 text-green-800">Matched</Badge>
      case "unmatched":
        return <Badge className="bg-red-100 text-red-800">Unmatched</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalExpected = filteredDeposits.reduce((sum, deposit) => sum + deposit.expectedAmount, 0)
  const totalActual = filteredDeposits.reduce((sum, deposit) => sum + deposit.actualAmount, 0)
  const totalDifference = totalActual - totalExpected

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expected</p>
                <p className="text-2xl font-bold text-blue-600">₹{totalExpected.toLocaleString()}</p>
              </div>
              <FaChartLine className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actual</p>
                <p className="text-2xl font-bold text-green-600">₹{totalActual.toLocaleString()}</p>
              </div>
              <FaChartLine className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Difference</p>
                <p className={`text-2xl font-bold ${totalDifference >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ₹{Math.abs(totalDifference).toLocaleString()}
                </p>
              </div>
              <FaExclamationTriangle
                className={`h-8 w-8 ${totalDifference >= 0 ? "text-green-600" : "text-red-600"}`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Match Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    (filteredDeposits.filter((d) => d.status === "matched").length / filteredDeposits.length) * 100 ||
                      0,
                  )}
                  %
                </p>
              </div>
              <FaChartLine className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaChartLine className="h-5 w-5" />
              <span>Deposit Reconciliation</span>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2">
              <FaPlus className="h-4 w-4" />
              <span>Add Deposit</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Deposit Form */}
          {showAddForm && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-medium mb-4">Add New Deposit Record</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deposit Date *</Label>
                  <Input
                    type="date"
                    value={newDeposit.depositDate}
                    onChange={(e) => setNewDeposit((prev) => ({ ...prev, depositDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bank Account *</Label>
                  <Select
                    value={newDeposit.bankAccount}
                    onValueChange={(value) => setNewDeposit((prev) => ({ ...prev, bankAccount: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SBI - ****1234">SBI - ****1234</SelectItem>
                      <SelectItem value="HDFC - ****5678">HDFC - ****5678</SelectItem>
                      <SelectItem value="ICICI - ****9012">ICICI - ****9012</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Actual Amount Deposited *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newDeposit.actualAmount || ""}
                    onChange={(e) =>
                      setNewDeposit((prev) => ({ ...prev, actualAmount: Number.parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reconciliation Notes</Label>
                  <Input
                    placeholder="Additional notes..."
                    value={newDeposit.reconciliationNotes}
                    onChange={(e) => setNewDeposit((prev) => ({ ...prev, reconciliationNotes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={addNewDeposit}>Add Deposit</Button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Filter by Date</Label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Filter by Bank</Label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Banks</SelectItem>
                  <SelectItem value="SBI">SBI</SelectItem>
                  <SelectItem value="HDFC">HDFC</SelectItem>
                  <SelectItem value="ICICI">ICICI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Deposits List */}
          <div className="space-y-4">
            {filteredDeposits.map((deposit) => (
              <div key={deposit.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{deposit.bankAccount}</h3>
                      {getStatusBadge(deposit.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Date: {deposit.depositDate}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <p className="text-sm text-gray-600">Expected Amount</p>
                        <p className="text-xl font-bold text-blue-600">₹{deposit.expectedAmount.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <p className="text-sm text-gray-600">Actual Amount</p>
                        <p className="text-xl font-bold text-green-600">₹{deposit.actualAmount.toLocaleString()}</p>
                      </div>
                      <div
                        className={`text-center p-3 rounded ${deposit.difference >= 0 ? "bg-green-50" : "bg-red-50"}`}
                      >
                        <p className="text-sm text-gray-600">Difference</p>
                        <p
                          className={`text-xl font-bold ${deposit.difference >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {deposit.difference >= 0 ? "+" : ""}₹{deposit.difference.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Payment Mode Breakdown */}
                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <p className="text-sm font-medium mb-2">Payment Mode Breakdown:</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                        <div>Cash: ₹{deposit.paymentModes.cash.toLocaleString()}</div>
                        <div>Card: ₹{deposit.paymentModes.card.toLocaleString()}</div>
                        <div>UPI: ₹{deposit.paymentModes.upi.toLocaleString()}</div>
                        <div>Cheque: ₹{deposit.paymentModes.cheque.toLocaleString()}</div>
                        <div>Transfer: ₹{deposit.paymentModes.bankTransfer.toLocaleString()}</div>
                      </div>
                    </div>

                    {deposit.reconciliationNotes && (
                      <p className="text-sm text-gray-600">Notes: {deposit.reconciliationNotes}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {deposit.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateDepositStatus(deposit.id, "matched", "Manually verified and matched")}
                          className="text-green-600"
                        >
                          <FaCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateDepositStatus(deposit.id, "unmatched", "Discrepancy found")}
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

          {filteredDeposits.length === 0 && (
            <div className="text-center py-8">
              <FaChartLine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No deposit records found for the selected criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
