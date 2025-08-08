"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FaFileInvoiceDollar } from "react-icons/fa"

export default function CreateDebitNote() {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [debitAmount, setDebitAmount] = useState("")
  const [debitReason, setDebitReason] = useState("")
  const [description, setDescription] = useState("")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FaFileInvoiceDollar className="h-5 w-5" />
            <span>Create Debit Note</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Debit Note functionality coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
