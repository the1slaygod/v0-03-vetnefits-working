"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { createClient } from "@supabase/supabase-js"
import type { WhiteboardRow, WhiteboardFilters } from "@/lib/types/whiteboard"

// Fetch whiteboard data with realtime subscriptions
export function useWhiteboard(filters: WhiteboardFilters) {
  const queryClient = useQueryClient()
  
  // Create Supabase client only on client side
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !anonKey) {
      console.warn("Supabase environment variables not configured")
      return null
    }
    
    // Validate URL format
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      console.warn("Invalid Supabase URL format:", url)
      return null
    }
    
    try {
      return createClient(url, anonKey)
    } catch (error) {
      console.warn("Failed to create Supabase client:", error)
      return null
    }
  }, [])
  
  const query = useQuery({
    queryKey: ["whiteboard", filters],
    queryFn: async (): Promise<WhiteboardRow[]> => {
      const params = new URLSearchParams()
      
      if (filters.dateISO) params.append("date", filters.dateISO)
      if (filters.show && filters.show !== "all") params.append("show", filters.show)
      if (filters.providerId) params.append("providerId", filters.providerId)
      if (filters.apptType) params.append("apptType", filters.apptType)
      if (filters.q) params.append("q", filters.q)
      
      const response = await fetch(`/api/whiteboard?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch whiteboard data")
      }
      
      const result = await response.json()
      return result.data || []
    },
    refetchInterval: 30000, // Fallback refetch every 30 seconds
  })
  
  // Set up realtime subscription for appointment changes
  useEffect(() => {
    if (!supabase || typeof window === "undefined") {
      return // Skip realtime if Supabase is not configured or on server
    }
    
    const channel = supabase
      .channel("whiteboard-updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "appointments",
        },
        (payload) => {
          console.log("Realtime update:", payload)
          // Invalidate and refetch whiteboard data when appointments change
          queryClient.invalidateQueries({ queryKey: ["whiteboard"] })
        }
      )
      .subscribe()
    
    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase, queryClient, filters])
  
  return query
}

// Update appointment status
export function useUpdateStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/whiteboard/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update status")
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate whiteboard queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["whiteboard"] })
    },
  })
}

// Update appointment photo
export function useUpdatePhoto() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, fileUrl }: { id: string; fileUrl: string }) => {
      const response = await fetch(`/api/whiteboard/${id}/photo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update photo")
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate whiteboard queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["whiteboard"] })
    },
  })
}