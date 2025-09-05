import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface Subscription {
  id: string
  clinic_id: string
  plan_type: 'monthly' | 'yearly'
  status: 'active' | 'inactive' | 'trial' | 'expired'
  start_date: string
  end_date: string
  amount: number
  currency: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  clinic_id: string
  subscription_id?: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method?: string
  transaction_id?: string
  invoice_url?: string
  payment_date: string
  created_at: string
  updated_at: string
}

export interface BillingData {
  subscription: Subscription | null
  payments: Payment[]
}

const CLINIC_ID = 'ff4a1430-f7df-49b8-99bf-2240faa8d622' // Default clinic ID

export function useBillingSettings() {
  const queryClient = useQueryClient()

  // Query for billing data
  const {
    data: billingData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['billing-settings', CLINIC_ID],
    queryFn: async (): Promise<BillingData> => {
      if (!isSupabaseConfigured()) {
        // Return mock data when Supabase is not configured
        return {
          subscription: {
            id: 'mock-sub-1',
            clinic_id: CLINIC_ID,
            plan_type: 'monthly',
            status: 'trial',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 1000,
            currency: 'INR',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          payments: [
            {
              id: 'mock-pay-1',
              clinic_id: CLINIC_ID,
              subscription_id: 'mock-sub-1',
              amount: 1000,
              currency: 'INR',
              status: 'completed',
              payment_method: 'online',
              transaction_id: 'TXN_MOCK_001',
              payment_date: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
        }
      }

      const response = await fetch('/api/settings/billing')
      if (!response.ok) {
        throw new Error('Failed to fetch billing data')
      }

      const result = await response.json()
      return {
        subscription: result.subscription,
        payments: result.payments || []
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Mutation for renewing subscription
  const renewSubscriptionMutation = useMutation({
    mutationFn: async ({ plan_type, amount }: { plan_type: 'monthly' | 'yearly'; amount?: number }) => {
      const response = await fetch('/api/settings/billing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_type, amount }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to renew subscription')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update billing data in cache
      queryClient.setQueryData<BillingData>(['billing-settings', CLINIC_ID], (old) => {
        if (old) {
          return {
            subscription: data.subscription,
            payments: [
              {
                id: `pay-${Date.now()}`,
                clinic_id: CLINIC_ID,
                subscription_id: data.subscription.id,
                amount: data.subscription.amount,
                currency: 'INR',
                status: 'completed',
                payment_method: 'online',
                transaction_id: `TXN_${Date.now()}`,
                payment_date: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              ...old.payments
            ]
          }
        }
        return old
      })
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['billing-settings', CLINIC_ID] })
    },
  })

  // Real-time subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured()) return

    // Subscribe to subscriptions changes
    const subscriptionChannel = supabase!
      .channel('subscriptions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `clinic_id=eq.${CLINIC_ID}`,
        },
        (payload) => {
          console.log('Subscription changed:', payload)
          
          queryClient.setQueryData<BillingData>(['billing-settings', CLINIC_ID], (old) => {
            if (old) {
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                return {
                  ...old,
                  subscription: payload.new as Subscription
                }
              }
            }
            return old
          })
        }
      )
      .subscribe()

    // Subscribe to payments changes
    const paymentsChannel = supabase!
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `clinic_id=eq.${CLINIC_ID}`,
        },
        (payload) => {
          console.log('Payment changed:', payload)
          
          queryClient.setQueryData<BillingData>(['billing-settings', CLINIC_ID], (old) => {
            if (old) {
              if (payload.eventType === 'INSERT') {
                return {
                  ...old,
                  payments: [payload.new as Payment, ...old.payments]
                }
              } else if (payload.eventType === 'UPDATE') {
                return {
                  ...old,
                  payments: old.payments.map(payment => 
                    payment.id === payload.new.id ? payload.new as Payment : payment
                  )
                }
              }
            }
            return old
          })
        }
      )
      .subscribe()

    return () => {
      supabase!.removeChannel(subscriptionChannel)
      supabase!.removeChannel(paymentsChannel)
    }
  }, [queryClient])

  return {
    subscription: billingData?.subscription || null,
    payments: billingData?.payments || [],
    isLoading,
    error,
    refetch,
    renewSubscription: renewSubscriptionMutation.mutate,
    isRenewing: renewSubscriptionMutation.isPending,
    renewError: renewSubscriptionMutation.error,
  }
}