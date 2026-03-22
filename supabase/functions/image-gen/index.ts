import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const FAL_API_KEY = Deno.env.get('FAL_API_KEY')
  if (!FAL_API_KEY) {
    return new Response(
      JSON.stringify({ url: null, error: 'FAL_API_KEY not configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  }

  try {
    const { prompt, image_size, num_images, num_inference_steps } = await req.json()

    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: image_size || 'square_hd',
        num_images: num_images || 1,
        num_inference_steps: num_inference_steps || 4,
      }),
    })

    const data = await response.json()
    const url = data?.images?.[0]?.url || null

    return new Response(
      JSON.stringify({ url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ url: null, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
