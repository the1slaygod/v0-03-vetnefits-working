"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"

interface StatusMenuProps {
  currentStatus: string
  onStatusChange: (status: string) => void
}

const statusOptions = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-800" },
  { value: "waiting", label: "Waiting", color: "bg-yellow-100 text-yellow-800" },
  { value: "attending", label: "Attending", color: "bg-red-100 text-red-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "no_show", label: "No-show", color: "bg-gray-100 text-gray-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-800" },
]

export function StatusMenu({ currentStatus, onStatusChange }: StatusMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const currentOption = statusOptions.find(option => option.value === currentStatus)
  
  const handleStatusSelect = (status: string) => {
    onStatusChange(status)
    setIsOpen(false)
  }
  
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-auto p-1"
      >
        <Badge 
          className={`${currentOption?.color} border cursor-pointer text-xs`}
        >
          {currentOption?.label || currentStatus}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Badge>
      </Button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-lg z-20 min-w-[120px]">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusSelect(option.value)}
                className="w-full px-3 py-2 text-left hover:bg-muted transition-colors first:rounded-t-md last:rounded-b-md"
              >
                <Badge className={`${option.color} text-xs`}>
                  {option.label}
                </Badge>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}