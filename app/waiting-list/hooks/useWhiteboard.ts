"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { WhiteboardRow, WhiteboardFilters } from "../types"
import { toast } from "sonner"

const defaultFilters: WhiteboardFilters = {
  dateISO: new Date().toISOString().split("T")[0],
  show: "all",
  providerId: "all",
  apptType: "all",
  q: ""
}

export function useWhiteboard() {
  const [filters, setFilters] = useState<WhiteboardFilters>(defaultFilters)
  const queryClient = useQueryClient()

  // Fetch whiteboard data
  const {
    data: whiteboardData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["whiteboard", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.append(key, value)
        }
      })
      
      const response = await fetch(`/api/whiteboard?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch whiteboard data")
      }
      return response.json()
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchIntervalInBackground: true
  })

  const rows: WhiteboardRow[] = whiteboardData?.data || []

  // Update appointment status
  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/whiteboard/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      // Refetch the data to get updated timestamps
      refetch()
      toast.success("Status updated successfully")
    } catch (error) {
      console.error("Status update error:", error)
      toast.error("Failed to update status")
    }
  }

  // Upload photo
  const uploadPhoto = async (id: string) => {
    // TODO: Implement photo upload to Supabase Storage
    toast.info("Photo upload functionality coming soon")
  }

  // Add patient to waiting list (via appointments)
  const addToWaitingList = async (data: {
    patient_id: string
    pet_id: string
    priority: "low" | "normal" | "high" | "urgent"
    reason: string
    notes?: string
    estimated_duration?: number
  }) => {
    try {
      // Create appointment first
      const appointmentData = {
        patient_id: data.patient_id,
        pet_id: data.pet_id,
        appointment_date: new Date().toISOString(),
        appointment_type: "Walk-in",
        duration: data.estimated_duration || 30,
        reason: data.reason,
        notes: data.notes,
        status: "scheduled",
        provider_id: null, // Will be assigned by staff
        clinic_id: "ff4a1430-f7df-49b8-99bf-2240faa8d622" // Default clinic
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(appointmentData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add to waiting list")
      }

      const result = await response.json()
      
      // Immediately check the patient in to put them in waiting status
      await updateStatus(result.data.id, "waiting")
      
      // Refresh the whiteboard data
      refetch()
      
    } catch (error) {
      console.error("Add to waiting list error:", error)
      throw error
    }
  }

  // Real-time updates (simplified - could be enhanced with WebSocket/SSE)
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 60000) // Refresh every minute for real-time feel

    return () => clearInterval(interval)
  }, [refetch])

  return {
    rows,
    filters,
    setFilters,
    isLoading,
    error,
    refetch,
    updateStatus,
    uploadPhoto,
    addToWaitingList,
    // Stats
    stats: {
      total: rows.length,
      waiting: rows.filter(r => r.status === "waiting").length,
      attending: rows.filter(r => r.status === "attending").length,
      completed: rows.filter(r => r.status === "completed").length,
      averageWaitTime: 0 // TODO: Calculate from data
    }
  }
}