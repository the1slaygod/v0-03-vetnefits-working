"use client"

import { useState } from "react"
import { Search, Calendar, Filter, Maximize2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { WhiteboardFilters } from "@/lib/types/whiteboard"

interface WhiteboardToolbarProps {
  filters: WhiteboardFilters
  onFiltersChange: (filters: WhiteboardFilters) => void
  onFullscreenToggle: () => void
}

export function WhiteboardToolbar({
  filters,
  onFiltersChange,
  onFullscreenToggle,
}: WhiteboardToolbarProps) {
  const [searchValue, setSearchValue] = useState(filters.q || "")

  // Handle date navigation
  const navigateDate = (direction: "prev" | "next") => {
    const currentDate = new Date(filters.dateISO)
    const newDate = new Date(currentDate)
    
    if (direction === "prev") {
      newDate.setDate(currentDate.getDate() - 1)
    } else {
      newDate.setDate(currentDate.getDate() + 1)
    }
    
    onFiltersChange({
      ...filters,
      dateISO: newDate.toISOString().split("T")[0]
    })
  }

  // Handle search with debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({
      ...filters,
      q: searchValue
    })
  }

  const setToday = () => {
    const today = new Date().toISOString().split("T")[0]
    onFiltersChange({
      ...filters,
      dateISO: today
    })
  }

  const formatDisplayDate = (dateISO: string) => {
    const date = new Date(dateISO)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"
    
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-background border-b">
      {/* Date Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateDate("prev")}
          className="px-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant={filters.dateISO === new Date().toISOString().split("T")[0] ? "default" : "outline"}
          size="sm"
          onClick={setToday}
          className="min-w-[100px]"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {formatDisplayDate(filters.dateISO)}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateDate("next")}
          className="px-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Show Clients Filter */}
      <div className="flex items-center gap-2">
        <Label htmlFor="show-filter" className="text-sm whitespace-nowrap">
          Show Clients
        </Label>
        <select
          id="show-filter"
          value={filters.show}
          onChange={(e) => onFiltersChange({
            ...filters,
            show: e.target.value as WhiteboardFilters["show"]
          })}
          className="px-3 py-1 border rounded-md bg-background text-sm min-w-[120px]"
        >
          <option value="all">All</option>
          <option value="scheduled">Scheduled</option>
          <option value="waiting">Waiting</option>
          <option value="attending">Attending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Provider Filter */}
      <div className="flex items-center gap-2">
        <Label htmlFor="provider-filter" className="text-sm whitespace-nowrap">
          Provider
        </Label>
        <select
          id="provider-filter"
          value={filters.providerId || "all"}
          onChange={(e) => onFiltersChange({
            ...filters,
            providerId: e.target.value === "all" ? undefined : e.target.value
          })}
          className="px-3 py-1 border rounded-md bg-background text-sm min-w-[120px]"
        >
          <option value="all">All Providers</option>
          <option value="dr-sarah">Dr. Sarah Johnson</option>
          <option value="dr-mike">Dr. Mike Wilson</option>
        </select>
      </div>

      {/* Appointment Type Filter */}
      <div className="flex items-center gap-2">
        <Label htmlFor="type-filter" className="text-sm whitespace-nowrap">
          Appt Type
        </Label>
        <select
          id="type-filter"
          value={filters.apptType || "all"}
          onChange={(e) => onFiltersChange({
            ...filters,
            apptType: e.target.value === "all" ? undefined : e.target.value
          })}
          className="px-3 py-1 border rounded-md bg-background text-sm min-w-[120px]"
        >
          <option value="all">All Types</option>
          <option value="consultation">Consultation</option>
          <option value="vaccination">Vaccination</option>
          <option value="surgery">Surgery</option>
          <option value="checkup">Checkup</option>
        </select>
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-[300px]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search clients, pets, complaints..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
      </form>

      {/* Fullscreen Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={onFullscreenToggle}
        title="Toggle Fullscreen"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  )
}