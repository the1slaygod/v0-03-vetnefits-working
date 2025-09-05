"use client"

import { useState, useEffect } from "react"
import { WhiteboardToolbar } from "@/components/waiting-list/WhiteboardToolbar"
import { WhiteboardTable } from "@/components/waiting-list/WhiteboardTable"
import { useWhiteboard, useUpdateStatus, useUpdatePhoto } from "@/hooks/useWhiteboard"
import type { WhiteboardFilters } from "@/lib/types/whiteboard"

export default function WaitingListPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [filters, setFilters] = useState<WhiteboardFilters>({
    dateISO: new Date().toISOString().split("T")[0],
    show: "all",
  })

  // Fetch whiteboard data
  const { data: whiteboardData = [], isLoading, error } = useWhiteboard(filters)
  
  // Mutations for updating status and photo
  const updateStatusMutation = useUpdateStatus()
  const updatePhotoMutation = useUpdatePhoto()

  // Handle status update
  const handleStatusUpdate = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status })
  }

  // Handle photo update
  const handlePhotoUpdate = (id: string, fileUrl: string) => {
    updatePhotoMutation.mutate({ id, fileUrl })
  }

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Whiteboard</h2>
          <p className="text-muted-foreground">
            Failed to load whiteboard data. Please check your database connection.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-screen ${isFullscreen ? "p-0" : ""}`}>
      {/* Page Header */}
      {!isFullscreen && (
        <div className="px-6 py-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Patient Waiting List</h1>
              <p className="text-muted-foreground">
                Real-time patient whiteboard - {whiteboardData.length} appointments today
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <WhiteboardToolbar
        filters={filters}
        onFiltersChange={setFilters}
        onFullscreenToggle={toggleFullscreen}
      />

      {/* Main Table Area */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading appointments...</p>
            </div>
          </div>
        ) : (
          <WhiteboardTable
            data={whiteboardData}
            onStatusUpdate={handleStatusUpdate}
            onPhotoUpdate={handlePhotoUpdate}
          />
        )}
      </div>
    </div>
  )
}