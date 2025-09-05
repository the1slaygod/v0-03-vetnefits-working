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
    const { theme, default_view } = body

    // Validate inputs
    if (theme && !['light', 'dark'].includes(theme)) {
      return NextResponse.json(
        { success: false, message: 'Invalid theme value' },
        { status: 400 }
      )
    }

    if (default_view && !['dashboard', 'appointments', 'admit'].includes(default_view)) {
      return NextResponse.json(
        { success: false, message: 'Invalid default_view value' },
        { status: 400 }
      )
    }

    // For now, use a default clinic ID - in a real app, this would come from auth
    const clinicId = 'ff4a1430-f7df-49b8-99bf-2240faa8d622'

    // Update appearance settings
    const { error } = await supabase
      .from('clinic_settings')
      .upsert({
        clinic_id: clinicId,
        theme,
        default_view,
        updated_at: new Date().toISOString()
      }, { onConflict: 'clinic_id' })

    if (error) {
      console.error('Appearance settings update error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to update appearance settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Appearance settings updated successfully'
    })

  } catch (error) {
    console.error('Appearance settings API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}