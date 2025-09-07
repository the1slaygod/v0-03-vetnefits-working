"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Camera, Phone, DollarSign } from "lucide-react"
import { WhiteboardRow } from "../types"

interface WhiteboardTableProps {
  data: WhiteboardRow[]
  onStatusChange: (id: string, status: string) => void
  onPhotoUpload: (id: string) => void
}

export function WhiteboardTable({ data, onStatusChange, onPhotoUpload }: WhiteboardTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "attending":
        return "bg-red-100 text-red-800 border-red-200"
      case "waiting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "--:--"
    const date = new Date(isoString)
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: false 
    })
  }

  const calculateWaitingTime = (checkedInAt: string | null) => {
    if (!checkedInAt) return "--"
    const checkedIn = new Date(checkedInAt)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - checkedIn.getTime()) / (1000 * 60))
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m`
    } else {
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      return `${hours}h ${minutes}m`
    }
  }

  const calculateTurnaroundTime = (attendingAt: string | null, completedAt: string | null) => {
    if (!attendingAt) return "--"
    
    const attending = new Date(attendingAt)
    const end = completedAt ? new Date(completedAt) : new Date()
    const diffMinutes = Math.floor((end.getTime() - attending.getTime()) / (1000 * 60))
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m`
    } else {
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      return `${hours}h ${minutes}m`
    }
  }

  const isImminentAppointment = (apptTime: string) => {
    const appt = new Date(apptTime)
    const now = new Date()
    const diffMinutes = (appt.getTime() - now.getTime()) / (1000 * 60)
    return Math.abs(diffMinutes) <= 5 // Within ±5 minutes
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients in queue</h3>
        <p className="text-gray-500">Patients will appear here when they check in.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Sticky Header */}
          <thead className="bg-gray-50 border-b sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-900">Status</th>
              <th className="px-3 py-2 text-left font-medium text-gray-900">Appt Time</th>
              <th className="px-3 py-2 text-left font-medium text-gray-900">Check In</th>
              <th className="px-3 py-2 text-left font-medium text-gray-900">Client</th>
              <th className="px-3 py-2 text-left font-medium text-gray-900">Patient</th>
              <th className="px-3 py-2 text-left font-medium text-gray-900">Photo</th>
              <th className="px-3 py-2 text-left font-medium text-gray-900">Type</th>
              <th className="px-3 py-2 text-left font-medium text-gray-900">Confirmed</th>
              <th className="px-3 py-2 text-left font-medium text-gray-900">Complaint</th>
              <th className="px-3 py-2 text-left font-medium text-gray-900">Provider</th>
              <th className="px-3 py-2 text-left font-medium text-gray-900">Waiting Time</th>
              <th className="px-3 py-2 text-left font-medium text-gray-900">Turnaround</th>
              <th className="px-3 py-2 text-left font-medium text-gray-900">Billing</th>
              <th className="px-3 py-2 text-left font-medium text-gray-900">Sno</th>
            </tr>
          </thead>
          
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.id}
                className={`
                  border-b hover:bg-gray-50 transition-colors
                  ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}
                  ${hoveredRow === row.id ? "bg-blue-50" : ""}
                `}
                onMouseEnter={() => setHoveredRow(row.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Status Column */}
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-2">
                    {isImminentAppointment(row.apptTimeISO) && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                    <Select
                      value={row.status}
                      onValueChange={(value) => onStatusChange(row.id, value)}
                    >
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <Badge className={`${getStatusBadge(row.status)} text-xs px-2 py-0`}>
                          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="attending">Attending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="no_show">No Show</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </td>

                {/* Appointment Time */}
                <td className="px-3 py-2 font-mono text-xs">
                  {formatTime(row.apptTimeISO)}
                </td>

                {/* Check In Time */}
                <td className="px-3 py-2 font-mono text-xs">
                  {formatTime(row.checkedInAtISO)}
                </td>

                {/* Client */}
                <td className="px-3 py-2">
                  <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                    {row.client}
                  </button>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" />
                    (Click for contact)
                  </div>
                </td>

                {/* Patient */}
                <td className="px-3 py-2">
                  <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                    {row.patient}
                  </button>
                </td>

                {/* Photo */}
                <td className="px-3 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPhotoUpload(row.id)}
                    className="h-8 w-20 text-xs"
                  >
                    <Camera className="w-3 h-3 mr-1" />
                    {row.photoUrl ? "Replace" : "Upload"}
                  </Button>
                </td>

                {/* Appointment Type */}
                <td className="px-3 py-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {row.apptType}
                  </span>
                </td>

                {/* Confirmed */}
                <td className="px-3 py-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    row.confirmed 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {row.confirmed ? "True" : "False"}
                  </span>
                </td>

                {/* Complaint */}
                <td className="px-3 py-2 max-w-[200px]">
                  <div 
                    className="text-xs text-gray-700 truncate cursor-help"
                    title={row.complaint}
                  >
                    {row.complaint}
                  </div>
                </td>

                {/* Provider */}
                <td className="px-3 py-2 text-xs">
                  {row.provider}
                </td>

                {/* Waiting Time */}
                <td className="px-3 py-2">
                  <span className={`text-xs font-mono ${
                    row.status === "waiting" ? "text-orange-600 font-medium" : "text-gray-500"
                  }`}>
                    {row.status === "waiting" ? calculateWaitingTime(row.checkedInAtISO) : "--"}
                  </span>
                </td>

                {/* Turnaround Time */}
                <td className="px-3 py-2">
                  <span className="text-xs font-mono text-gray-500">
                    {row.status === "attending" || row.status === "completed" 
                      ? calculateTurnaroundTime(row.attendingAtISO, row.completedAtISO)
                      : "--"
                    }
                  </span>
                </td>

                {/* Billing */}
                <td className="px-3 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Open billing interface
                      console.log("Opening billing for patient:", row.client)
                    }}
                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                    title="Open Billing"
                  >
                    <DollarSign className="w-4 h-4" />
                  </Button>
                </td>

                {/* Serial Number */}
                <td className="px-3 py-2 text-xs text-gray-500">
                  {row.sno}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}