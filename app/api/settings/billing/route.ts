import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create Supabase client with service role for server-side operations
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      )
    }

    // For now, use a default clinic ID - in a real app, this would come from auth
    const clinicId = 'ff4a1430-f7df-49b8-99bf-2240faa8d622'

    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get payment history
    const { data: payments, error: payError } = await supabase
      .from('payments')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('payment_date', { ascending: false })
      .limit(10)

    if (subError && subError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Subscription fetch error:', subError)
    }

    if (payError) {
      console.error('Payments fetch error:', payError)
    }

    return NextResponse.json({
      success: true,
      subscription: subscription || null,
      payments: payments || []
    })

  } catch (error) {
    console.error('Billing API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { plan_type, amount } = body

    // For now, use a default clinic ID - in a real app, this would come from auth
    const clinicId = 'ff4a1430-f7df-49b8-99bf-2240faa8d622'

    // Create new subscription
    const endDate = new Date()
    if (plan_type === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (plan_type === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        clinic_id: clinicId,
        plan_type,
        status: 'active',
        end_date: endDate.toISOString(),
        amount: amount || (plan_type === 'yearly' ? 10000 : 1000), // Default amounts in paise
        currency: 'INR'
      })
      .select()
      .single()

    if (subError) {
      console.error('Subscription creation error:', subError)
      return NextResponse.json(
        { success: false, message: 'Failed to create subscription' },
        { status: 500 }
      )
    }

    // Create payment record
    const { error: payError } = await supabase
      .from('payments')
      .insert({
        clinic_id: clinicId,
        subscription_id: subscription.id,
        amount: subscription.amount,
        currency: 'INR',
        status: 'completed',
        payment_method: 'online',
        transaction_id: `TXN_${Date.now()}`,
        payment_date: new Date().toISOString()
      })

    if (payError) {
      console.error('Payment creation error:', payError)
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription renewed successfully',
      subscription
    })

  } catch (error) {
    console.error('Billing renewal API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}