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

    // Get modules from clinic_settings
    const { data: settings, error: settingsError } = await supabase
      .from('clinic_settings')
      .select('modules')
      .eq('clinic_id', clinicId)
      .single()

    // Get individual module settings from clinic_modules table
    const { data: moduleSettings, error: moduleError } = await supabase
      .from('clinic_modules')
      .select('*')
      .eq('clinic_id', clinicId)

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Module settings fetch error:', settingsError)
    }

    if (moduleError) {
      console.error('Individual modules fetch error:', moduleError)
    }

    // Merge settings with individual module data
    const defaultModules = {
      vaccines: true,
      compliance: true,
      lab_reports: true,
      otc_billing: true,
      inventory: true
    }

    const modules = settings?.modules || defaultModules

    // Override with individual module settings if they exist
    if (moduleSettings) {
      moduleSettings.forEach(module => {
        modules[module.module_name] = module.enabled
      })
    }

    return NextResponse.json({
      success: true,
      modules
    })

  } catch (error) {
    console.error('Modules API error:', error)
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
    const { modules } = body

    if (!modules || typeof modules !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Modules object is required' },
        { status: 400 }
      )
    }

    // For now, use a default clinic ID - in a real app, this would come from auth
    const clinicId = 'ff4a1430-f7df-49b8-99bf-2240faa8d622'

    // Update modules in clinic_settings
    const { error: settingsError } = await supabase
      .from('clinic_settings')
      .upsert({
        clinic_id: clinicId,
        modules,
        updated_at: new Date().toISOString()
      }, { onConflict: 'clinic_id' })

    if (settingsError) {
      console.error('Module settings update error:', settingsError)
    }

    // Also update individual module records
    const modulePromises = Object.entries(modules).map(([moduleName, enabled]) => {
      return supabase
        .from('clinic_modules')
        .upsert({
          clinic_id: clinicId,
          module_name: moduleName,
          enabled: Boolean(enabled),
          updated_at: new Date().toISOString()
        }, { onConflict: 'clinic_id,module_name' })
    })

    const moduleResults = await Promise.allSettled(modulePromises)
    const moduleErrors = moduleResults
      .filter(result => result.status === 'rejected')
      .map(result => (result as PromiseRejectedResult).reason)

    if (moduleErrors.length > 0) {
      console.error('Individual module update errors:', moduleErrors)
    }

    return NextResponse.json({
      success: true,
      message: 'Module settings updated successfully'
    })

  } catch (error) {
    console.error('Modules update API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}