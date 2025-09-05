import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface StaffMember {
  id: string
  clinic_id: string
  name: string
  email: string
  role: 'doctor' | 'receptionist' | 'admin'
  whatsapp_phone?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

const CLINIC_ID = 'ff4a1430-f7df-49b8-99bf-2240faa8d622' // Default clinic ID

export function useStaff() {
  const queryClient = useQueryClient()

  // Query for staff members
  const {
    data: staff,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['staff', CLINIC_ID],
    queryFn: async (): Promise<StaffMember[]> => {
      if (!isSupabaseConfigured()) {
        // Return mock data when Supabase is not configured
        return [
          {
            id: 'staff-1',
            clinic_id: CLINIC_ID,
            name: 'Dr. Sarah Johnson',
            email: 'dr.sarah@vetnefits.com',
            role: 'doctor',
            whatsapp_phone: '+91 98765 11111',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'staff-2',
            clinic_id: CLINIC_ID,
            name: 'Mike Wilson',
            email: 'mike@vetnefits.com',
            role: 'receptionist',
            whatsapp_phone: '+91 98765 22222',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'staff-3',
            clinic_id: CLINIC_ID,
            name: 'Admin User',
            email: 'admin@vetnefits.com',
            role: 'admin',
            whatsapp_phone: '+91 98765 33333',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      }

      const response = await fetch('/api/settings/staff')
      if (!response.ok) {
        throw new Error('Failed to fetch staff')
      }

      const result = await response.json()
      return result.staff || []
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Mutation for adding staff
  const addStaffMutation = useMutation({
    mutationFn: async (newStaff: Omit<StaffMember, 'id' | 'clinic_id' | 'created_at' | 'updated_at'>) => {
      const response = await fetch('/api/settings/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add staff member')
      }

      return response.json()
    },
    onMutate: async (newStaff) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['staff', CLINIC_ID] })
      
      const previousStaff = queryClient.getQueryData<StaffMember[]>(['staff', CLINIC_ID]) || []
      
      const optimisticStaff: StaffMember = {
        id: `temp-${Date.now()}`,
        clinic_id: CLINIC_ID,
        ...newStaff,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      queryClient.setQueryData(['staff', CLINIC_ID], [optimisticStaff, ...previousStaff])

      return { previousStaff }
    },
    onError: (err, newStaff, context) => {
      // Revert optimistic update on error
      if (context?.previousStaff) {
        queryClient.setQueryData(['staff', CLINIC_ID], context.previousStaff)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['staff', CLINIC_ID] })
    },
  })

  // Mutation for updating staff
  const updateStaffMutation = useMutation({
    mutationFn: async (updatedStaff: Partial<StaffMember> & { id: string }) => {
      const response = await fetch('/api/settings/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStaff),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update staff member')
      }

      return response.json()
    },
    onMutate: async (updatedStaff) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['staff', CLINIC_ID] })
      
      const previousStaff = queryClient.getQueryData<StaffMember[]>(['staff', CLINIC_ID]) || []
      
      const newStaff = previousStaff.map(staff => 
        staff.id === updatedStaff.id 
          ? { ...staff, ...updatedStaff, updated_at: new Date().toISOString() }
          : staff
      )
      
      queryClient.setQueryData(['staff', CLINIC_ID], newStaff)

      return { previousStaff }
    },
    onError: (err, updatedStaff, context) => {
      // Revert optimistic update on error
      if (context?.previousStaff) {
        queryClient.setQueryData(['staff', CLINIC_ID], context.previousStaff)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['staff', CLINIC_ID] })
    },
  })

  // Mutation for toggling staff status
  const toggleStaffStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const response = await fetch('/api/settings/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update staff status')
      }

      return response.json()
    },
    onMutate: async ({ id, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['staff', CLINIC_ID] })
      
      const previousStaff = queryClient.getQueryData<StaffMember[]>(['staff', CLINIC_ID]) || []
      
      const newStaff = previousStaff.map(staff => 
        staff.id === id 
          ? { ...staff, status, updated_at: new Date().toISOString() }
          : staff
      )
      
      queryClient.setQueryData(['staff', CLINIC_ID], newStaff)

      return { previousStaff }
    },
    onError: (err, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousStaff) {
        queryClient.setQueryData(['staff', CLINIC_ID], context.previousStaff)
      }
    },
  })

  // Mutation for deleting staff
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/settings/staff?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete staff member')
      }

      return response.json()
    },
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['staff', CLINIC_ID] })
      
      const previousStaff = queryClient.getQueryData<StaffMember[]>(['staff', CLINIC_ID]) || []
      
      const newStaff = previousStaff.filter(staff => staff.id !== id)
      
      queryClient.setQueryData(['staff', CLINIC_ID], newStaff)

      return { previousStaff }
    },
    onError: (err, id, context) => {
      // Revert optimistic update on error
      if (context?.previousStaff) {
        queryClient.setQueryData(['staff', CLINIC_ID], context.previousStaff)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['staff', CLINIC_ID] })
    },
  })

  // Real-time subscription
  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const channel = supabase!
      .channel('staff-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff',
          filter: `clinic_id=eq.${CLINIC_ID}`,
        },
        (payload) => {
          console.log('Staff changed:', payload)
          
          queryClient.setQueryData<StaffMember[]>(['staff', CLINIC_ID], (old) => {
            if (!old) return []
            
            if (payload.eventType === 'INSERT') {
              return [payload.new as StaffMember, ...old]
            } else if (payload.eventType === 'UPDATE') {
              return old.map(staff => 
                staff.id === payload.new.id ? payload.new as StaffMember : staff
              )
            } else if (payload.eventType === 'DELETE') {
              return old.filter(staff => staff.id !== payload.old.id)
            }
            
            return old
          })
        }
      )
      .subscribe()

    return () => {
      supabase!.removeChannel(channel)
    }
  }, [queryClient])

  return {
    staff: staff || [],
    isLoading,
    error,
    refetch,
    addStaff: addStaffMutation.mutate,
    isAdding: addStaffMutation.isPending,
    addError: addStaffMutation.error,
    updateStaff: updateStaffMutation.mutate,
    isUpdating: updateStaffMutation.isPending,
    updateError: updateStaffMutation.error,
    toggleStaffStatus: toggleStaffStatusMutation.mutate,
    isToggling: toggleStaffStatusMutation.isPending,
    toggleError: toggleStaffStatusMutation.error,
    deleteStaff: deleteStaffMutation.mutate,
    isDeleting: deleteStaffMutation.isPending,
    deleteError: deleteStaffMutation.error,
  }
}