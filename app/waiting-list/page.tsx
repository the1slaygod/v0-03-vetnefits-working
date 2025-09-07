"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WhiteboardToolbar } from "./components/WhiteboardToolbar"
import { WhiteboardTable } from "./components/WhiteboardTable"
import { ImprovedAddToWaitingListModal } from "./components/ImprovedAddToWaitingListModal"
import { useWhiteboard } from "./hooks/useWhiteboard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Activity, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: true
    }
  }
})

function WhiteboardContent() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const {
    rows,
    filters,
    setFilters,
    isLoading,
    error,
    updateStatus,
    uploadPhoto,
    addToWaitingList,
    stats
  } = useWhiteboard()

  const handleAddToWaitingList = async (data: {
    patient_id: string
    pet_id: string
    priority: "low" | "normal" | "high" | "urgent"
    reason: string
    notes?: string
    estimated_duration?: number
  }) => {
    try {
      await addToWaitingList(data)
      toast.success("Patient added to waiting list successfully!")
    } catch (error) {
      console.error("Add to waiting list error:", error)
      toast.error("Failed to add patient to waiting list")
      throw error
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus(id, status)
    } catch (error) {
      console.error("Status change error:", error)
      toast.error("Failed to update status")
    }
  }

  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-white overflow-auto"
    : "p-6 max-w-full mx-auto"

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Failed to load whiteboard</div>
          <div className="text-red-500 text-sm">{error.message}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      {/* Stats Row */}
      {!isFullscreen && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 px-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Patients</div>
                  <div className="text-xl font-bold text-gray-900">{stats.total}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Waiting</div>
                  <div className="text-xl font-bold text-gray-900">{stats.waiting}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Attending</div>
                  <div className="text-xl font-bold text-gray-900">{stats.attending}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Completed</div>
                  <div className="text-xl font-bold text-gray-900">{stats.completed}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Toolbar */}
      <WhiteboardToolbar
        filters={filters}
        onFiltersChange={setFilters}
        onAddPatient={() => {}} // Handled by modal
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />

      {/* Main Content */}
      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Loading patient whiteboard...</p>
          </div>
        ) : (
          <>
            {/* Status Summary */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Patient Queue
                </h2>
                <div className="flex items-center space-x-2">
                  {stats.waiting > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {stats.waiting} waiting
                    </Badge>
                  )}
                  {stats.attending > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      {stats.attending} attending
                    </Badge>
                  )}
                </div>
              </div>
              
              <ImprovedAddToWaitingListModal onAdd={handleAddToWaitingList} />
            </div>

            {/* Whiteboard Table */}
            <WhiteboardTable
              data={rows}
              onStatusChange={handleStatusChange}
              onPhotoUpload={uploadPhoto}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default function WaitingListPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <WhiteboardContent />
    </QueryClientProvider>
  )
}