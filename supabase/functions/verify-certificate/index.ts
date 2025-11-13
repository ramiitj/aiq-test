import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shareCode } = await req.json();

    if (!shareCode || typeof shareCode !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid share code' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create admin client with service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Rate limiting: Check attempts from this IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const rateLimitKey = `verify:${clientIp}`;
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

    // Clean up old rate limit entries
    await supabase.rpc('cleanup_rate_limits');

    // Check current rate limit
    const { data: rateLimitData } = await supabase
      .from('rate_limits')
      .select('count')
      .eq('key', rateLimitKey)
      .gte('created_at', oneHourAgo)
      .maybeSingle();

    if (rateLimitData && rateLimitData.count >= 10) {
      console.log('Rate limit exceeded for certificate verification');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Too many verification attempts. Please try again later.' 
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Increment or create rate limit counter
    if (rateLimitData) {
      await supabase
        .from('rate_limits')
        .update({ count: rateLimitData.count + 1 })
        .eq('key', rateLimitKey)
        .gte('created_at', oneHourAgo);
    } else {
      await supabase
        .from('rate_limits')
        .insert({ key: rateLimitKey, count: 1 });
    }

    // Server-side validation with share code check
    const { data, error } = await supabase
      .from('public_results')
      .select(`
        id,
        test_id,
        user_id,
        overall_score,
        dimension_scores,
        test_completion_date,
        test_duration_seconds,
        percentile_rank,
        product_slug,
        test_version,
        user_name,
        pdf_url,
        created_at,
        expires_at
      `)
      .eq('share_code', shareCode)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Database query error');
      return new Response(
        JSON.stringify({ valid: false, error: 'Internal server error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ valid: false }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate percentage from points (overall_score now stores actual points)
    // Use test_version to determine total possible points
    const testVersion = data.test_version || 'professional';
    const totalPossible = testVersion === 'beginner' ? 600 : 1600;
    const percentage = (data.overall_score / totalPossible) * 100;
    
    let scoreRange = "";
    let level = "";

    // Determine level based on test version and percentage
    if (testVersion === 'beginner') {
      if (percentage >= 90) {
        scoreRange = "90-100%";
        level = "Advanced";
      } else if (percentage >= 80) {
        scoreRange = "80-89%";
        level = "Proficient";
      } else if (percentage >= 60) {
        scoreRange = "60-79%";
        level = "Developing";
      } else if (percentage >= 40) {
        scoreRange = "40-59%";
        level = "Beginner";
      } else {
        scoreRange = "0-39%";
        level = "Novice";
      }
    } else if (testVersion === 'expert') {
      if (percentage >= 90) {
        scoreRange = "90-100%";
        level = "Thought Leader";
      } else if (percentage >= 80) {
        scoreRange = "80-89%";
        level = "Senior Expert";
      } else if (percentage >= 65) {
        scoreRange = "65-79%";
        level = "Expert";
      } else if (percentage >= 50) {
        scoreRange = "50-64%";
        level = "Advanced Professional";
      } else {
        scoreRange = "0-49%";
        level = "Emerging Expert";
      }
    } else {
      // Professional
      if (percentage >= 90) {
        scoreRange = "90-100%";
        level = "Expert";
      } else if (percentage >= 80) {
        scoreRange = "80-89%";
        level = "Advanced";
      } else if (percentage >= 60) {
        scoreRange = "60-79%";
        level = "Proficient";
      } else if (percentage >= 40) {
        scoreRange = "40-59%";
        level = "Developing";
      } else {
        scoreRange = "0-39%";
        level = "Emerging";
      }
    }

    // Return sanitized data without user_id
    return new Response(
      JSON.stringify({
        valid: true,
        issueDate: data.created_at,
        expiryDate: data.expires_at,
        scoreRange,
        level,
        userName: data.user_name,
        testDuration: data.test_duration_seconds ? `${Math.floor(data.test_duration_seconds / 60)}m ${data.test_duration_seconds % 60}s` : undefined,
        percentile: data.percentile_rank,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in verify-certificate function:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
