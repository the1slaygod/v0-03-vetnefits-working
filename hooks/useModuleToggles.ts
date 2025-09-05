import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface ModuleSettings {
  vaccines: boolean
  compliance: boolean
  lab_reports: boolean
  otc_billing: boolean
  inventory: boolean
}

const CLINIC_ID = 'ff4a1430-f7df-49b8-99bf-2240faa8d622' // Default clinic ID

export function useModuleToggles() {
  const queryClient = useQueryClient()

  // Query for module settings
  const {
    data: modules,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['module-toggles', CLINIC_ID],
    queryFn: async (): Promise<ModuleSettings> => {
      if (!isSupabaseConfigured()) {
        // Return mock data when Supabase is not configured
        return {
          vaccines: true,
          compliance: true,
          lab_reports: true,
          otc_billing: true,
          inventory: true
        }
      }

      const response = await fetch('/api/settings/modules')
      if (!response.ok) {
        throw new Error('Failed to fetch module settings')
      }

      const result = await response.json()
      return result.modules || {
        vaccines: true,
        compliance: true,
        lab_reports: true,
        otc_billing: true,
        inventory: true
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Mutation for updating module settings
  const updateModulesMutation = useMutation({
    mutationFn: async (newModules: Partial<ModuleSettings>) => {
      const response = await fetch('/api/settings/modules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules: newModules }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update module settings')
      }

      return response.json()
    },
    onMutate: async (newModules) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['module-toggles', CLINIC_ID] })
      
      const previousModules = queryClient.getQueryData<ModuleSettings>(['module-toggles', CLINIC_ID])
      
      if (previousModules) {
        queryClient.setQueryData(['module-toggles', CLINIC_ID], {
          ...previousModules,
          ...newModules
        })
      }

      return { previousModules }
    },
    onError: (err, newModules, context) => {
      // Revert optimistic update on error
      if (context?.previousModules) {
        queryClient.setQueryData(['module-toggles', CLINIC_ID], context.previousModules)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['module-toggles', CLINIC_ID] })
    },
  })

  // Helper function to toggle a single module
  const toggleModule = (moduleName: keyof ModuleSettings) => {
    if (modules) {
      updateModulesMutation.mutate({
        [moduleName]: !modules[moduleName]
      })
    }
  }

  // Real-time subscription
  useEffect(() => {
    if (!isSupabaseConfigured()) return

    // Subscribe to clinic_settings changes for modules
    const settingsChannel = supabase!
      .channel('clinic-settings-modules')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'clinic_settings',
          filter: `clinic_id=eq.${CLINIC_ID}`,
        },
        (payload) => {
          console.log('Module settings changed:', payload)
          
          if (payload.new.modules) {
            queryClient.setQueryData(['module-toggles', CLINIC_ID], payload.new.modules)
          }
        }
      )
      .subscribe()

    // Subscribe to individual clinic_modules changes
    const modulesChannel = supabase!
      .channel('clinic-modules-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clinic_modules',
          filter: `clinic_id=eq.${CLINIC_ID}`,
        },
        (payload) => {
          console.log('Individual module changed:', payload)
          
          queryClient.setQueryData<ModuleSettings>(['module-toggles', CLINIC_ID], (old) => {
            if (!old) return old
            
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              return {
                ...old,
                [payload.new.module_name]: payload.new.enabled
              }
            }
            
            return old
          })
        }
      )
      .subscribe()

    return () => {
      supabase!.removeChannel(settingsChannel)
      supabase!.removeChannel(modulesChannel)
    }
  }, [queryClient])

  return {
    modules: modules || {
      vaccines: true,
      compliance: true,
      lab_reports: true,
      otc_billing: true,
      inventory: true
    },
    isLoading,
    error,
    refetch,
    updateModules: updateModulesMutation.mutate,
    toggleModule,
    isUpdating: updateModulesMutation.isPending,
    updateError: updateModulesMutation.error,
  }
}