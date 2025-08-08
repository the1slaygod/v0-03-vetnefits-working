"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FaCreditCard,
  FaFileInvoiceDollar,
  FaShoppingCart,
  FaMoneyCheckAlt,
  FaChartLine,
  FaSearch,
  FaHandHoldingUsd,
  FaChevronDown,
} from "react-icons/fa"

// Import all billing components
import AcceptPayment from "@/components/billing/AcceptPayment"
import RefundPayment from "@/components/billing/RefundPayment"
import AdvancePayments from "@/components/billing/AdvancePayments"
import ReturnGoods from "@/components/billing/ReturnGoods"
import CreateCreditNote from "@/components/billing/CreateCreditNote"
import CreateDebitNote from "@/components/billing/CreateDebitNote"
import CartItems from "@/components/billing/CartItems"
import ChequesOnHold from "@/components/billing/ChequesOnHold"
import AccountsReceivable from "@/components/billing/AccountsReceivable"
import SearchInvoice from "@/components/billing/SearchInvoice"
import PaymentsReceived from "@/components/billing/PaymentsReceived"
import DepositReconciliation from "@/components/billing/DepositReconciliation"

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Mock data for dashboard stats
  const stats = {
    todayCollection: 15420,
    pendingPayments: 8750,
    advancePayments: 3200,
    overdueAmount: 12500,
    totalInvoices: 156,
    paidInvoices: 134,
    pendingInvoices: 22,
    chequesOnHold: 5,
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "accept-payment":
        return <AcceptPayment />
      case "refund-payment":
        return <RefundPayment />
      case "advance-payments":
        return <AdvancePayments />
      case "return-goods":
        return <ReturnGoods />
      case "create-credit-note":
        return <CreateCreditNote />
      case "create-debit-note":
        return <CreateDebitNote />
      case "cart-items":
        return <CartItems />
      case "cheques-hold":
        return <ChequesOnHold />
      case "accounts-receivable":
        return <AccountsReceivable />
      case "search-invoice":
        return <SearchInvoice />
      case "payments-received":
        return <PaymentsReceived />
      case "deposit-reconciliation":
        return <DepositReconciliation />
      default:
        return (
          <div className="space-y-6">
            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{"Today's Collection"}</p>
                      <p className="text-2xl font-bold text-green-600">₹{stats.todayCollection.toLocaleString()}</p>
                    </div>
                    <FaHandHoldingUsd className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                      <p className="text-2xl font-bold text-orange-600">₹{stats.pendingPayments.toLocaleString()}</p>
                    </div>
                    <FaCreditCard className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Advance Payments</p>
                      <p className="text-2xl font-bold text-blue-600">₹{stats.advancePayments.toLocaleString()}</p>
                    </div>
                    <FaMoneyCheckAlt className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                      <p className="text-2xl font-bold text-red-600">₹{stats.overdueAmount.toLocaleString()}</p>
                    </div>
                    <FaChartLine className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Invoices</span>
                      <Badge variant="outline">{stats.totalInvoices}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Paid Invoices</span>
                      <Badge className="bg-green-100 text-green-800">{stats.paidInvoices}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pending Invoices</span>
                      <Badge className="bg-orange-100 text-orange-800">{stats.pendingInvoices}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cheques on Hold</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{stats.chequesOnHold}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Collection Rate</span>
                      <Badge className="bg-blue-100 text-blue-800">86%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Payment Time</span>
                      <Badge variant="outline">3.2 days</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Financials</h1>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === "dashboard" ? "default" : "outline"}
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center space-x-2"
          >
            <FaChartLine className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>

          {/* Payments Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <FaCreditCard className="h-4 w-4" />
                <span>Payments</span>
                <FaChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => setActiveTab("accept-payment")}>Accept Payment</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("refund-payment")}>
                Refund / Cancel Payment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("advance-payments")}>
                Accept Payments in Advance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("return-goods")}>Return Goods & Services</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Credit/Debit Notes Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <FaFileInvoiceDollar className="h-4 w-4" />
                <span>Notes</span>
                <FaChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => setActiveTab("create-credit-note")}>Create Credit Note</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("create-debit-note")}>Create Debit Note</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart & Cheques Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <FaShoppingCart className="h-4 w-4" />
                <span>Cart & Cheques</span>
                <FaChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => setActiveTab("cart-items")}>View Cart Items</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("cheques-hold")}>View Cheques on Hold</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Accounts Receivable Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <FaMoneyCheckAlt className="h-4 w-4" />
                <span>Receivables</span>
                <FaChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => setActiveTab("accounts-receivable")}>
                Account Statements
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("search-invoice")}>Search Invoice Number</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reconciliation Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <FaSearch className="h-4 w-4" />
                <span>Reconciliation</span>
                <FaChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => setActiveTab("payments-received")}>Payments Received</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("deposit-reconciliation")}>
                Deposit Reconciliation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="overflow-x-hidden">{renderTabContent()}</div>
    </div>
  )
}
