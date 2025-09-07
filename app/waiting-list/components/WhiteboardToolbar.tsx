"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronLeft, ChevronRight, Search, Maximize2, Plus } from "lucide-react"
import { WhiteboardFilters } from "../types"

interface WhiteboardToolbarProps {
  filters: WhiteboardFilters
  onFiltersChange: (filters: WhiteboardFilters) => void
  onAddPatient: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

export function WhiteboardToolbar({
  filters,
  onFiltersChange,
  onAddPatient,
  isFullscreen,
  onToggleFullscreen
}: WhiteboardToolbarProps) {
  const [searchQuery, setSearchQuery] = useState(filters.q)

  const today = new Date().toISOString().split("T")[0]

  const goToPreviousDay = () => {
    const currentDate = new Date(filters.dateISO)
    currentDate.setDate(currentDate.getDate() - 1)
    onFiltersChange({
      ...filters,
      dateISO: currentDate.toISOString().split("T")[0]
    })
  }

  const goToNextDay = () => {
    const currentDate = new Date(filters.dateISO)
    currentDate.setDate(currentDate.getDate() + 1)
    onFiltersChange({
      ...filters,
      dateISO: currentDate.toISOString().split("T")[0]
    })
  }

  const goToToday = () => {
    onFiltersChange({
      ...filters,
      dateISO: today
    })
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    // Debounce search
    setTimeout(() => {
      onFiltersChange({
        ...filters,
        q: value
      })
    }, 300)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
    return date.toLocaleDateString("en-US", options)
  }

  const isToday = filters.dateISO === today

  return (
    <div className="bg-white border-b border-gray-200 p-4 space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Patient Waiting List <span className="text-sm text-gray-500">(Whiteboard)</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={onAddPatient} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add to Queue
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onToggleFullscreen}
            className="flex items-center gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center space-x-4 flex-wrap">
        {/* Date Navigation */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Date:</span>
          <div className="flex items-center space-x-1 border rounded-lg p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToPreviousDay}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center space-x-2 px-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium min-w-[100px] text-center">
                {formatDate(filters.dateISO)}
              </span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToNextDay}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {!isToday && (
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          )}
        </div>

        {/* Show Clients Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Show:</span>
          <Select
            value={filters.show}
            onValueChange={(value) => onFiltersChange({
              ...filters,
              show: value as any
            })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="attending">Attending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Provider Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Provider:</span>
          <Select
            value={filters.providerId}
            onValueChange={(value) => onFiltersChange({
              ...filters,
              providerId: value
            })}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="dr-johnson">Dr. Johnson</SelectItem>
              <SelectItem value="dr-martinez">Dr. Martinez</SelectItem>
              <SelectItem value="dr-smith">Dr. Smith</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Appointment Type Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Type:</span>
          <Select
            value={filters.apptType}
            onValueChange={(value) => onFiltersChange({
              ...filters,
              apptType: value
            })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="checkup">Checkup</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="surgery">Surgery</SelectItem>
              <SelectItem value="vaccination">Vaccination</SelectItem>
              <SelectItem value="dental">Dental</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search patients, pets, complaints..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  )
}