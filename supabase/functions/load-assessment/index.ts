import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'AUTH_001' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'AUTH_002' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { testId, productSlug } = await req.json();

    console.log(`Load assessment request - testId: ${testId}, productSlug: ${productSlug}`);

    // Verify user has an active test session
    const { data: test, error: testError } = await supabaseClient
      .from('tests')
      .select('id, user_id, completed, security_terminated, product_slug')
      .eq('id', testId)
      .single();

    if (testError || !test) {
      console.error('Test lookup failed:', testError?.message);
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'TEST_001' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (test.user_id !== user.id) {
      console.error('Unauthorized test access attempt');
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'TEST_002' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (test.completed || test.security_terminated) {
      console.error('Test already completed or terminated');
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'TEST_003' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load assessment from storage bucket
    const fileName = `${productSlug || test.product_slug}.json`;
    console.log(`Attempting to load file: ${fileName} from aiq-items bucket`);
    
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('aiq-items')
      .download(fileName);

    if (downloadError || !fileData) {
      console.error(`Failed to load assessment file: ${fileName}`, downloadError?.message);
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'ASSESS_001' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const assessmentText = await fileData.text();
    const assessment = JSON.parse(assessmentText);

    // Sanitize assessment - remove correct answers and sensitive data
    const sanitizeItem = (item: any) => {
      const sanitized = { ...item };
      delete sanitized.correctAnswer;
      delete sanitized.correctAnswers;
      delete sanitized.rationale;
      delete sanitized.explanation;
      delete sanitized.discrimination;
      return sanitized;
    };

    // Handle both itemBank formats:
    // 1. Direct array: itemBank: [{dimensionCode, items: [...]}]
    // 2. Nested object: itemBank: {dimensions: [{dimensionCode, items: [...]}]}
    let dimensions: any[];
    
    if (Array.isArray(assessment.itemBank)) {
      // Format 1: Direct array
      dimensions = assessment.itemBank;
    } else if (assessment.itemBank?.dimensions && Array.isArray(assessment.itemBank.dimensions)) {
      // Format 2: Nested object
      dimensions = assessment.itemBank.dimensions;
    } else {
      console.error('Invalid itemBank structure in assessment file');
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'ASSESS_002' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedDimensions = dimensions.map((dim: any) => ({
      ...dim,
      items: dim.items.map(sanitizeItem),
    }));

    const sanitizedAssessment = {
      ...assessment,
      itemBank: Array.isArray(assessment.itemBank) 
        ? sanitizedDimensions  // Direct array format
        : { ...assessment.itemBank, dimensions: sanitizedDimensions }  // Nested format
    };

    console.log(`Assessment loaded for test ${testId.substring(0, 8)}...`);

    return new Response(
      JSON.stringify({ assessment: sanitizedAssessment }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in load-assessment:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
