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

    // Verify user has an active test session
    const { data: test, error: testError } = await supabaseClient
      .from('tests')
      .select('id, user_id, completed, security_terminated, product_slug, product_id')
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

    // Map product slug to actual storage filename
    const mapSlugToFileName = (slug: string): string => {
      // Adolescent assessments
      if (slug.includes('adolescent-14-15') || slug === 'adolescent-14-15') {
        return 'adolescent-14-15.json';
      }
      if (slug.includes('adolescent-16-17') || slug === 'adolescent-16-17') {
        return 'adolescent-16-17.json';
      }
      
      // Beginner tier assessments
      if (slug.includes('beginner') || slug === 'beginner') {
        return 'beginner-assessment.json';
      }
      
      // Professional tier assessments
      if (slug.includes('professional') || slug === 'professional') {
        return 'professional-assessment.json';
      }
      
      // Advanced/Expert tier assessments
      if (slug.includes('advanced') || slug.includes('expert') || 
          slug === 'advanced' || slug === 'expert') {
        return 'expert-assessment.json';
      }
      
      // Default fallback to beginner
      return 'beginner-assessment.json';
    };
    
    // Load assessment from storage bucket
    const slug = productSlug || test.product_slug || 'beginner';
    const fileName = mapSlugToFileName(slug);
    
    console.log(`Loading assessment: slug=${slug}, fileName=${fileName}`);
    
    let { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('aiq-items')
      .download(fileName);

    if (downloadError || !fileData) {
      console.error(`Failed to download assessment file from storage: ${fileName}`, downloadError?.message ?? downloadError);

      // Fallback: use beginner assessment so the test can still run
      const fallbackFileName = 'beginner-assessment.json';
      console.log(`Falling back to assessment file: ${fallbackFileName}`);

      const fallbackResult = await supabaseClient.storage
        .from('aiq-items')
        .download(fallbackFileName);

      if (fallbackResult.error || !fallbackResult.data) {
        console.error('Fallback assessment download also failed', fallbackResult.error?.message ?? fallbackResult.error);
        return new Response(
          JSON.stringify({
            error: 'Assessment file not found in storage',
            fileName,
            details: downloadError?.message ?? null,
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      fileData = fallbackResult.data;
    }

    const assessmentText = await fileData.text();
    const assessment = JSON.parse(assessmentText);

    // Sanitize assessment - remove correct answers and sensitive data recursively
    const sensitiveKeys = new Set([
      'correctAnswer',
      'correctAnswers',
      'rationale',
      'explanation',
      'discrimination',
    ]);

    const deepSanitize = (value: any): any => {
      if (Array.isArray(value)) {
        return value.map(deepSanitize);
      }

      if (value !== null && typeof value === 'object') {
        const sanitized: any = {};
        for (const [key, nested] of Object.entries(value)) {
          if (sensitiveKeys.has(key)) continue;
          sanitized[key] = deepSanitize(nested);
        }
        return sanitized;
      }

      return value;
    };

    const sanitizedAssessment = deepSanitize(assessment);

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
