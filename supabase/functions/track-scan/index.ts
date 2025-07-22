import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const { qrCodeId, scanData } = await req.json()
    
    if (!qrCodeId) {
      return new Response('QR code ID is required', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get QR code data to verify it exists
    const { data: qrCode, error: qrError } = await supabase
      .from('qrcodes')
      .select('*')
      .eq('id', qrCodeId)
      .single()

    if (qrError || !qrCode) {
      return new Response('QR code not found', { 
        status: 404,
        headers: corsHeaders 
      })
    }

    // Extract analytics data from request
    const userAgent = req.headers.get('user-agent') || scanData?.userAgent || ''
    const referer = req.headers.get('referer') || scanData?.referer || ''
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               scanData?.ip || 
               'unknown'

    // Get location data from IP
    let location = { city: 'Unknown', country: 'Unknown', lat: null, lng: null }
    try {
      const geoResponse = await fetch(`http://ip-api.com/json/${ip}`)
      if (geoResponse.ok) {
        const geoData = await geoResponse.json()
        location = {
          city: geoData.city || 'Unknown',
          country: geoData.country || 'Unknown',
          lat: geoData.lat || null,
          lng: geoData.lon || null
        }
      }
    } catch (error) {
      console.warn('Failed to get location data:', error)
    }

    // Log the scan
    const { error: scanError } = await supabase
      .from('analytics_scans')
      .insert({
        qr_code_id: qrCodeId,
        scanned_at: new Date().toISOString(),
        ip_address: ip,
        user_agent: userAgent,
        referer: referer,
        location: location
      })

    if (scanError) {
      console.error('Failed to log scan:', scanError)
      return new Response('Failed to log scan', { 
        status: 500,
        headers: corsHeaders 
      })
    }

    // Update scan count
    const { error: updateError } = await supabase
      .from('qrcodes')
      .update({ 
        scan_count: (qrCode.scan_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', qrCodeId)

    if (updateError) {
      console.error('Failed to update scan count:', updateError)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Track scan error:', error)
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})