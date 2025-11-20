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
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
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
      return new Response(
        JSON.stringify({ error: 'Test not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (test.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to test' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (test.completed || test.security_terminated) {
      return new Response(
        JSON.stringify({ error: 'Test already completed or terminated' }),
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
      console.error(`Failed to load assessment file: ${fileName}`, downloadError);
      return new Response(
        JSON.stringify({ 
          error: 'Assessment file not found',
          fileName: fileName,
          details: downloadError?.message || 'File does not exist in storage bucket'
        }),
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

    const sanitizedAssessment = {
      ...assessment,
      itemBank: {
        ...assessment.itemBank,
        dimensions: assessment.itemBank.dimensions.map((dim: any) => ({
          ...dim,
          items: dim.items.map(sanitizeItem),
        })),
      },
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
