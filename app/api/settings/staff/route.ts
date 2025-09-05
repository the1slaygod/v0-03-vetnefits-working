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

    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Staff fetch error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch staff' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      staff: staff || []
    })

  } catch (error) {
    console.error('Staff API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { name, email, role, whatsapp_phone } = body

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['doctor', 'receptionist', 'admin'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      )
    }

    // For now, use a default clinic ID - in a real app, this would come from auth
    const clinicId = 'ff4a1430-f7df-49b8-99bf-2240faa8d622'

    const { data: staff, error } = await supabase
      .from('staff')
      .insert({
        clinic_id: clinicId,
        name,
        email,
        role,
        whatsapp_phone,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Staff creation error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to create staff member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member created successfully',
      staff
    })

  } catch (error) {
    console.error('Staff creation API error:', error)
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
    const { id, name, email, role, whatsapp_phone, status } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Staff ID is required' },
        { status: 400 }
      )
    }

    const { data: staff, error } = await supabase
      .from('staff')
      .update({
        name,
        email,
        role,
        whatsapp_phone,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Staff update error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to update staff member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member updated successfully',
      staff
    })

  } catch (error) {
    console.error('Staff update API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Staff ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Staff deletion error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to delete staff member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully'
    })

  } catch (error) {
    console.error('Staff deletion API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}