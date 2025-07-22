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

  try {
    const url = new URL(req.url)
    const shortId = url.pathname.split('/').pop()
    
    if (!shortId) {
      return new Response('Invalid short URL', { status: 400 })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get QR code data
    const { data: qrCode, error: qrError } = await supabase
      .from('qrcodes')
      .select('*')
      .eq('shortUrlId', shortId)
      .single()

    if (qrError || !qrCode) {
      return new Response('QR code not found', { status: 404 })
    }

    // Extract analytics data
    const userAgent = req.headers.get('user-agent') || ''
    const referer = req.headers.get('referer') || ''
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'

    // Get location data from IP (simplified)
    let location = { city: 'Unknown', country: 'Unknown', lat: null, lng: null }
    try {
      // You could integrate with a geolocation service here
      // For now, we'll use a simple approach
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
        qr_code_id: qrCode.id,
        scanned_at: new Date().toISOString(),
        ip_address: ip,
        user_agent: userAgent,
        referer: referer,
        location: location
      })

    if (scanError) {
      console.error('Failed to log scan:', scanError)
    }

    // Update scan count
    const { error: updateError } = await supabase
      .from('qrcodes')
      .update({ 
        scan_count: (qrCode.scan_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', qrCode.id)

    if (updateError) {
      console.error('Failed to update scan count:', updateError)
    }

    // Redirect to destination
    const destinationUrl = qrCode.destination_url || qrCode.content?.url || '/'
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': destinationUrl
      }
    })

  } catch (error) {
    console.error('Redirect error:', error)
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})