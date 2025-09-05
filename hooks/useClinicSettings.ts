import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface ClinicSettings {
  clinic_id: string
  clinic_name: string
  clinic_phone: string
  clinic_email: string
  clinic_address: string
  logo_url?: string
  whatsapp_phone_number?: string
  whatsapp_phone_number_id?: string
  theme: 'light' | 'dark'
  default_view: 'dashboard' | 'appointments' | 'admit'
  modules: {
    vaccines: boolean
    compliance: boolean
    lab_reports: boolean
    otc_billing: boolean
    inventory: boolean
  }
  created_at: string
  updated_at: string
}

const CLINIC_ID = 'ff4a1430-f7df-49b8-99bf-2240faa8d622' // Default clinic ID

export function useClinicSettings() {
  const queryClient = useQueryClient()

  // Query for clinic settings
  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['clinic-settings', CLINIC_ID],
    queryFn: async (): Promise<ClinicSettings | null> => {
      if (!isSupabaseConfigured()) {
        // Return mock data when Supabase is not configured
        return {
          clinic_id: CLINIC_ID,
          clinic_name: 'Vetnefits Animal Hospital',
          clinic_phone: '+91 98765 43210',
          clinic_email: 'admin@vetnefits.com',
          clinic_address: '123 Pet Street, Animal City, AC 12345',
          logo_url: '/images/clinic-logo.png',
          whatsapp_phone_number: '+91 98765 43210',
          theme: 'light',
          default_view: 'dashboard',
          modules: {
            vaccines: true,
            compliance: true,
            lab_reports: true,
            otc_billing: true,
            inventory: true
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      const { data, error } = await supabase!
        .from('clinic_settings')
        .select('*')
        .eq('clinic_id', CLINIC_ID)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data || null
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Mutation for updating clinic settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<ClinicSettings>) => {
      const response = await fetch('/api/settings/clinic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update clinic settings')
      }

      return response.json()
    },
    onMutate: async (newSettings) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['clinic-settings', CLINIC_ID] })
      
      const previousSettings = queryClient.getQueryData<ClinicSettings | null>(['clinic-settings', CLINIC_ID])
      
      if (previousSettings) {
        queryClient.setQueryData(['clinic-settings', CLINIC_ID], {
          ...previousSettings,
          ...newSettings,
          updated_at: new Date().toISOString()
        })
      }

      return { previousSettings }
    },
    onError: (err, newSettings, context) => {
      // Revert optimistic update on error
      if (context?.previousSettings) {
        queryClient.setQueryData(['clinic-settings', CLINIC_ID], context.previousSettings)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['clinic-settings', CLINIC_ID] })
    },
  })

  // Logo upload mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/settings/clinic/logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to upload logo')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update the logo URL in cache
      queryClient.setQueryData<ClinicSettings | null>(['clinic-settings', CLINIC_ID], (old) => {
        if (old) {
          return {
            ...old,
            logo_url: data.logo_url,
            updated_at: new Date().toISOString()
          }
        }
        return old
      })
    },
  })

  // Real-time subscription
  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const channel = supabase!
      .channel('clinic-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clinic_settings',
          filter: `clinic_id=eq.${CLINIC_ID}`,
        },
        (payload) => {
          console.log('Clinic settings changed:', payload)
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            queryClient.setQueryData(['clinic-settings', CLINIC_ID], payload.new as ClinicSettings)
          } else if (payload.eventType === 'DELETE') {
            queryClient.setQueryData(['clinic-settings', CLINIC_ID], null)
          }
        }
      )
      .subscribe()

    return () => {
      supabase!.removeChannel(channel)
    }
  }, [queryClient])

  return {
    settings,
    isLoading,
    error,
    refetch,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
    updateError: updateSettingsMutation.error,
    uploadLogo: uploadLogoMutation.mutate,
    isUploadingLogo: uploadLogoMutation.isPending,
    uploadError: uploadLogoMutation.error,
  }
}