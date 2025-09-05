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
    const {
      clinic_name,
      clinic_phone,
      clinic_email,
      clinic_address,
      whatsapp_phone_number,
      logo_url
    } = body

    // For now, use a default clinic ID - in a real app, this would come from auth
    const clinicId = 'ff4a1430-f7df-49b8-99bf-2240faa8d622'

    // Update clinic_settings table
    const { error: settingsError } = await supabase
      .from('clinic_settings')
      .upsert({
        clinic_id: clinicId,
        clinic_name,
        clinic_phone,
        clinic_email,
        clinic_address,
        whatsapp_phone_number,
        logo_url,
        updated_at: new Date().toISOString()
      }, { onConflict: 'clinic_id' })

    if (settingsError) {
      console.error('Settings update error:', settingsError)
      return NextResponse.json(
        { success: false, message: 'Failed to update clinic settings' },
        { status: 500 }
      )
    }

    // Also update the main clinics table
    const { error: clinicError } = await supabase
      .from('clinics')
      .update({
        name: clinic_name,
        phone: clinic_phone,
        email: clinic_email,
        address: clinic_address,
        logo: logo_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', clinicId)

    if (clinicError) {
      console.error('Clinic update error:', clinicError)
      return NextResponse.json(
        { success: false, message: 'Failed to update clinic information' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Clinic settings updated successfully'
    })

  } catch (error) {
    console.error('Clinic settings API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}