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

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('logo') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // For now, use a default clinic ID - in a real app, this would come from auth
    const clinicId = 'ff4a1430-f7df-49b8-99bf-2240faa8d622'

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${clinicId}/logo-${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('clinic-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Logo upload error:', uploadError)
      return NextResponse.json(
        { success: false, message: 'Failed to upload logo' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('clinic-assets')
      .getPublicUrl(fileName)

    const logoUrl = urlData.publicUrl

    // Update clinic settings with new logo URL
    const { error: updateError } = await supabase
      .from('clinic_settings')
      .upsert({
        clinic_id: clinicId,
        logo_url: logoUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'clinic_id' })

    if (updateError) {
      console.error('Logo URL update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update logo URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Logo uploaded successfully',
      logo_url: logoUrl
    })

  } catch (error) {
    console.error('Logo upload API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}