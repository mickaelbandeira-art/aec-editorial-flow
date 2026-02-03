// Setup CORS headers for browser access
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { prompt } = await req.json()
        const apiKey = Deno.env.get('GEMINI_API_KEY')

        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY")
            return new Response(JSON.stringify({ success: false, error: 'GEMINI_API_KEY is missing via Deno.env.get' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Returning 200 to allow client error parsing
            })
        }

        // Call Google Gemini API directly
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            }
        )

        const data = await response.json()

        if (!response.ok) {
            const errorMsg = data.error?.message || response.statusText;
            console.error("Gemini API Error:", errorMsg);
            return new Response(JSON.stringify({ success: false, error: `Gemini API: ${errorMsg}` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!generatedText) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid response format from Gemini' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        return new Response(JSON.stringify({ success: true, text: generatedText }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("Edge Function Critical Error:", error)
        return new Response(JSON.stringify({ success: false, error: error.message || 'Unknown Error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }
})
