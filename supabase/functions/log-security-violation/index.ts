import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { testId, violationType, userAgent, additionalData } = await req.json();

    if (!testId || !violationType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security: Validate violationType length
    if (typeof violationType !== 'string' || violationType.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Invalid violation type - must be string under 200 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security: Rate limiting - max 10 violations per minute per user
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { count, error: countError } = await supabaseClient
      .from('security_violations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneMinuteAgo);

    if (countError) {
      console.error('Error checking rate limit:', countError.message);
    } else if (count !== null && count >= 10) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded - maximum 10 violations per minute' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitized logging - avoid exposing user IDs
    console.log('Security violation logged:', { 
      testId: testId.substring(0, 8) + '...', 
      violationType: violationType.substring(0, 50)
    });

    // Insert violation record
    const { error: insertError } = await supabaseClient
      .from('security_violations')
      .insert({
        test_id: testId,
        user_id: user.id,
        violation_type: violationType,
        user_agent: userAgent,
        additional_data: additionalData,
      });

    if (insertError) {
      console.error('Error inserting violation:', insertError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to log violation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current violation count
    const { data: test, error: testError } = await supabaseClient
      .from('tests')
      .select('security_violations_count')
      .eq('id', testId)
      .single();

    if (testError) {
      console.error('Error fetching test:', testError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch test' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newCount = (test.security_violations_count || 0) + 1;
    const shouldTerminate = newCount >= 3;

    // Update test with new violation count and termination status
    const { error: updateError } = await supabaseClient
      .from('tests')
      .update({
        security_violations_count: newCount,
        security_terminated: shouldTerminate,
      })
      .eq('id', testId);

    if (updateError) {
      console.error('Error updating test:', updateError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to update test' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Violation recorded. Count:', newCount, 'Terminated:', shouldTerminate);

    return new Response(
      JSON.stringify({
        success: true,
        violationCount: newCount,
        terminated: shouldTerminate,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in log-security-violation function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
